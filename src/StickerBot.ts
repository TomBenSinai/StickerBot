import { Client, LocalAuth, Message, MessageMedia, MessageSendOptions } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import clc from 'cli-color';
import sharp from 'sharp';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

import { BotConfig, IBotService } from './types/BotConfig';
import { mergeWithDefaults, ResolvedBotConfig } from './config/DefaultConfig';
import { TextToImageService } from './services/TextToImage/TextToImageService';
import { StringTooLongForSticker } from './utils';
import { ProcessedMessage, isMediaMessage, isTextMessage, isStickerMessage } from './types/Message';

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
    this.textService = new TextToImageService({
      rtlFont: this.finalConfig.rtlFont,
      ltrFont: this.finalConfig.ltrFont
    });
    // this.adminService = new AdminService(); // TODO: Implement use of admin service
    // this.mentionService = new MentionService(); // TODO: Implement use of mention service
    this.client = this.initializeClient();
    this.setupEventHandlers();
  }

  private initializeClient(): Client {
    const puppeteerConfig: any = {
      headless: this.finalConfig.headless,
      args: this.finalConfig.puppeteerArgs
    };

    // Use Chrome if executable path is provided
    if (this.finalConfig.executablePath) {
      puppeteerConfig.executablePath = this.finalConfig.executablePath;
    }

    return new Client({
      authStrategy: new LocalAuth(),
      puppeteer: puppeteerConfig
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
      stickerCategories: this.finalConfig.stickerOptions.stickerCategories,
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
      
      const shouldProcess = await this.shouldProcessMessage(message, chat.isGroup);
      
      if (shouldProcess) {
        await this.handleMessageReply(message, chat.isGroup);
      }
    } catch (err) {
      await this.handleMessageError(message, err);
    }
  }

  private async handleMessageReply(message: Message, isGroup: boolean): Promise<void> {
    const processedData = await this.getProcessedData(message, isGroup);
    if (processedData) {
      const options = this.mergeStickerOptions(processedData.stickerOptions);
      const media = options.sendMediaAsSticker
        ? await this.embedStickerMetadata(processedData.media, options)
        : processedData.media;
      console.log(clc.cyan('Sending sticker with options:'), JSON.stringify(options, null, 2));
      await message.reply(media, undefined, options);
    }
  }

  private mergeStickerOptions(overrides?: MessageSendOptions): MessageSendOptions {
    const base = this.getStickerOptions();
    if (!overrides) return base;

    const sanitized = Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => value !== undefined)
    ) as MessageSendOptions;

    return { ...base, ...sanitized };
  }

  private async embedStickerMetadata(media: MessageMedia, options: MessageSendOptions): Promise<MessageMedia> {
    const buffer = Buffer.from(media.data, 'base64');
    const sticker = new Sticker(buffer, {
      type: StickerTypes.FULL,
      quality: 100,
      author: options.stickerAuthor || '',
      pack: options.stickerName || '',
      categories: options.stickerCategories as any,
    });
    const webp = await sticker.build();
    return new MessageMedia('image/webp', webp.toString('base64'), 'sticker.webp');
  }

  private async handleMessageError(message: Message, err: any): Promise<void> {
    if (err instanceof StringTooLongForSticker) {
      await message.reply(err.message);
    } else {
      console.error(clc.red('Error handling message:'), err);
    }
  }

  private async shouldProcessMessage(message: Message, isGroup: boolean): Promise<boolean> {
    if (!isGroup) return true;
    
    const mentions = await this.getMentionsArray(message);    
    const clientId = this.client.info?.wid?._serialized || this.client.info?.me?._serialized;
    
    if (!clientId) return false;
    
    return mentions.some(mention => mention === clientId);
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

  private async getProcessedData(message: Message, isGroup: boolean): Promise<ProcessedMessage | undefined> {
    try {
      const messageToProcess = isGroup ? await message.getQuotedMessage() : message;
      return this.processMessage(messageToProcess);
    } catch (err) {
      console.error('Error processing message data:', err);
      return undefined;
    }
  }

  private async processMessage(message: Message): Promise<ProcessedMessage | undefined> {
    const stickerOptions = this.getStickerOptions();

    try {
      if (isMediaMessage(message.type)) {
        return await this.processMediaMessage(message, stickerOptions);
      }
      
      if (isTextMessage(message.type)) {
        return await this.processTextMessage(message, stickerOptions);
      }
      
      if (isStickerMessage(message.type)) {
        return await this.processStickerMessage(message);
      }
      
      return undefined;
    } catch (err) {
      throw err;
    }
  }

  private async processMediaMessage(message: Message, stickerOptions: MessageSendOptions): Promise<ProcessedMessage> {
    const media = await message.downloadMedia();
    return { media, stickerOptions };
  }

  private async processTextMessage(message: Message, stickerOptions: MessageSendOptions): Promise<ProcessedMessage> {
    const text = message.body;
    const maxLength = this.finalConfig.maxTextLength;
    
    if (text.length > maxLength) {
      throw new StringTooLongForSticker(text.length);
    }

    const stickerData = await this.textService.generateImage(text);
    const media = new MessageMedia("image/png", stickerData, "sticker.png");
    return { media, stickerOptions };
  }

  private async processStickerMessage(message: Message): Promise<ProcessedMessage> {
    const media = await message.downloadMedia();
    const webpBuffer = Buffer.from(media.data, 'base64');
    const pngBuffer = await sharp(webpBuffer).png().toBuffer();
    const pngBase64 = pngBuffer.toString('base64');
    const image = new MessageMedia('image/png', pngBase64, 'sticker.png');
    return { media: image, stickerOptions: { sendMediaAsSticker: false } };
  }

  private async retrieveUnreadMessages(): Promise<void> {
    try {
      const chats = await this.client.getChats();
      for (const chat of chats) {
        if (chat.unreadCount > 0) {
          const unreadMessages = await chat.fetchMessages({ limit: chat.unreadCount });
          for (const message of unreadMessages) {
            await this.processIncomingMessage(message);
          }
          chat.sendSeen();
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
