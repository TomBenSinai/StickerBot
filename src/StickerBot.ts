import { Client, LocalAuth, Message, Chat, GroupChat, MessageMedia, MessageSendOptions } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import clc from 'cli-color';

import { BotConfig, IBotService, StickerOptions } from './types/BotConfig';
import { mergeWithDefaults, ResolvedBotConfig } from './config/DefaultConfig';
import { TextToImageService } from './services/TextToImageService';
import { AdminService } from './services/AdminService';
import { MentionService } from './services/MentionService';
import { StringTooLongForSticker } from './utils';

export class StickerBot implements IBotService {
  private client: Client;
  private textService: TextToImageService;
  // private adminService: AdminService; TODO: Implement use of admin service
  // private mentionService: MentionService; TODO: Implement use of mention service
  private isRunning: boolean = false;
  private readonly finalConfig: ResolvedBotConfig;
  private isRetrievingUnreadMessages: boolean = true;
  private messageQueue: Message[] = [];
  private isProcessingQueue: boolean = false;

  constructor(userConfig: BotConfig = {}) {
    this.finalConfig = mergeWithDefaults(userConfig);
    this.textService = new TextToImageService(this.finalConfig.fontPath);
    // this.adminService = new AdminService(); // TODO: Implement use of admin service
    // this.mentionService = new MentionService(); // TODO: Implement use of mention service
    this.client = this.initializeClient();
    this.setupEventHandlers();
  }

  private initializeClient(): Client {
    return new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: this.finalConfig.headless,
        args: this.finalConfig.puppeteerArgs
      }
    });
  }

  private setupEventHandlers(): void {
    this.client.on('qr', this.handleQR.bind(this));
    this.client.on('ready', this.handleReady.bind(this));
    this.client.on('message', this.handleMessage.bind(this));
    this.client.on('auth_failure', this.handleAuthFailure.bind(this));
    
    process.on('uncaughtException', this.handleCriticalError.bind(this));
    process.on('SIGINT', this.stop.bind(this));
    process.on('SIGTERM', this.stop.bind(this));
  }

  private handleQR(qr: string): void {
    console.log(clc.yellow('Please scan the QR code below:'));
    qrcode.generate(qr, { small: true });
  }

  private async handleReady(): Promise<void> {
    console.log(clc.green("Client is up and running!"));
    await this.retrieveUnreadMessages();
    this.isRetrievingUnreadMessages = false;
    
    // Process any messages that arrived while we were processing unread messages
    await this.processQueuedMessages();
  }

  private handleAuthFailure(msg: string): void {
    console.error(clc.red('Authentication failure:'), msg);
  }

  private handleCriticalError(err: Error): void {
    console.error(clc.red('Critical error:'), err);
  }

  private getStickerOptions(): MessageSendOptions {
    return {
      sendMediaAsSticker: true,
      stickerAuthor: this.finalConfig.stickerOptions.stickerAuthor,
      stickerName: this.finalConfig.stickerOptions.stickerName,
    };
  }

  async handleMessage(message: Message): Promise<void> {
    if (this.isRetrievingUnreadMessages) {
      this.messageQueue.push(message);
      return;
    }

    await this.processIncomingMessage(message);
  }

  private async processIncomingMessage(message: Message): Promise<void> {
    try {
      const chat = await message.getChat();
      if (chat.isGroup) {
        await this.handleGroupMessage(message);
      } else {
        await this.handlePrivateMessage(message);
      }
    } catch (err) {
      if (err instanceof StringTooLongForSticker) {
        await message.reply(err.message);
      } else {
        console.error(clc.red('Error handling message:'), err);
      }
    }
  }

  private async handleGroupMessage(message: Message): Promise<void> {
    const mentions = await this.getMentionsArray(message);    
    const clientId = this.client.info?.wid?._serialized || this.client.info?.me?._serialized;
    
    if (clientId) {
      const isMentioned = mentions.some(mention => mention === clientId);
      
      if (isMentioned) {
        const [replyData, options] = await this.getProcessedData(message);
        if (replyData) {
          await message.reply(replyData, message.from, options);
        }
      }
    }
  }

  private async handlePrivateMessage(message: Message): Promise<void> {
    try {
      const [mediaData, options] = await this.processMessage(message);
      if (mediaData) {
        await message.reply(mediaData, undefined, options);
      }
    } catch (err) {
      throw err; // Re-throw to be handled by main error handler
    }
  }

  private async getMentionsArray(message: Message): Promise<string[]> {
    try {
      // Try the new way first (more reliable when it works)
      const mentions = await message.getMentions();
      if (mentions && mentions.length > 0) {
        return mentions.map((contact) => contact.id._serialized);
      }
    } catch (err) {
      console.warn(clc.yellow('Failed to get mentions via getMentions(), falling back to mentionedIds'));
    }

    // Fallback to the old way (direct access to mentionedIds)
    if (!message.mentionedIds || message.mentionedIds.length === 0) {
      return [];
    }
    
    return message.mentionedIds.map((id: any) => {
      // Handle different ID formats
      if (typeof id === 'string') {
        return id;
      }
      return id._serialized || id.toString();
    });
  }

  private async getProcessedData(message: Message): Promise<[MessageMedia, MessageSendOptions] | [undefined, undefined]> {
    try {
      const messageToProcess = message.hasQuotedMsg ? await message.getQuotedMessage() : message;
      return this.processMessage(messageToProcess);
    } catch (err) {
      console.error('Error processing message data:', err);
      return [undefined, undefined];
    }
  }

  private async processMessage(message: Message): Promise<[MessageMedia, MessageSendOptions] | [undefined, undefined]> {
    const stickerOptions = this.getStickerOptions();

    try {
      if (message.type === "image" || message.type === "video") {
        const media = await message.downloadMedia();
        return [media, stickerOptions];
      }
      
      if (message.type === "chat") {
        const text = message.body;
        const maxLength = this.finalConfig.maxTextLength;
        
        if (text.length > maxLength) {
          throw new StringTooLongForSticker(text.length);
        }

        const stickerData = await this.textService.generateImage(text);
        const media = new MessageMedia("image/png", stickerData, "sticker.png");
        return [media, stickerOptions];
      }
      
      if (message.type === "sticker") {
        const media = await message.downloadMedia();
        return [media, {}]; // Special flag for reply handling
      }
      
      return [undefined, undefined];
    } catch (err) {
      throw err;
    }
  }

  private async retrieveUnreadMessages(): Promise<void> {
    try {
      const chats = await this.client.getChats();
      for (const chat of chats) {
        if (chat.unreadCount > 0) {
          chat.sendSeen();
          const unreadMessages = await chat.fetchMessages({ limit: chat.unreadCount });
          for (const message of unreadMessages) {
            await this.processIncomingMessage(message);
          }
        }
      }
    } catch (err) {
      console.error('Error retrieving unread messages:', err);
    }
  }

  private async processQueuedMessages(): Promise<void> {
    if (this.isProcessingQueue || this.messageQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;
    console.log(clc.yellow(`Processing ${this.messageQueue.length} queued messages...`));

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        if (message) {
          await this.processIncomingMessage(message);
        }
      }
    } catch (err) {
      console.error(clc.red('Error processing queued messages:'), err);
    } finally {
      this.isProcessingQueue = false;
      console.log(clc.green('Finished processing queued messages'));
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      console.log(clc.yellow('Bot is already running'));
      return;
    }

    try {
      console.log(clc.blue('Starting StickerBot...'));
      await this.client.initialize();
      this.isRunning = true;
    } catch (err) {
      console.error(clc.red('Failed to start bot:'), err);
      throw err;
    }
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      console.log(clc.yellow('Stopping StickerBot...'));
      await this.client.destroy();
      this.isRunning = false;
      console.log(clc.green('Bot stopped successfully'));
      process.exit(0);
    } catch (err) {
      console.error(clc.red('Error stopping bot:'), err);
      process.exit(1);
    }
  }

  isClientReady(): boolean {
    return this.isRunning;
  }
} 
