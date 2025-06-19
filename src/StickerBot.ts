import { Client, LocalAuth, Message, Chat, GroupChat, MessageMedia } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import clc from 'cli-color';
import { BotConfig, IBotService } from './types/BotConfig';
import { TextToImageService } from './services/TextToImageService';
import { AdminService } from './services/AdminService';
import { MentionService } from './services/MentionService';
import { StringTooLongForSticker, MAX_TEXT_LENGTH } from './utils';

export class StickerBot implements IBotService {
  private client: Client;
  private textService: TextToImageService;
  private adminService: AdminService;
  private mentionService: MentionService;
  private isRunning: boolean = false;

  constructor(private config: BotConfig = {}) {
    this.textService = new TextToImageService(config.fontPath);
    this.adminService = new AdminService();
    this.mentionService = new MentionService();
    this.client = this.initializeClient();
    this.setupEventHandlers();
  }

  private initializeClient(): Client {
    const defaultArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu'
    ];

    return new Client({
      authStrategy: new LocalAuth(),
      puppeteer: {
        headless: this.config.headless ?? true,
        args: this.config.puppeteerArgs || defaultArgs
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

  private handleReady(): void {
    console.log(clc.green("Client is up and running!"));
    this.retrieveUnreadMessages();
  }

  private handleAuthFailure(msg: string): void {
    console.error(clc.red('Authentication failure:'), msg);
  }

  private handleCriticalError(err: Error): void {
    console.error(clc.red('Critical error:'), err);
  }

  async handleMessage(message: Message): Promise<void> {
    try {
      const chat = await message.getChat();
      
      if (chat.isGroup) {
        await this.handleGroupMessage(message, chat as GroupChat);
      } else {
        await this.handlePrivateMessage(message, chat);
      }
    } catch (err) {
      if (err instanceof StringTooLongForSticker) {
        await message.reply(err.message);
      } else {
        console.error(clc.red('Error handling message:'), err);
      }
    }
  }

  private async handleGroupMessage(message: Message, chat: GroupChat): Promise<void> {
    const mentions = this.getMentionsArray(message);
    const isMentioned = mentions.some(mention => mention === this.client.info.me._serialized);
    
    if (isMentioned) {
      const [replyData, options] = await this.getProcessedData(message);
      if (replyData) {
        await message.reply(replyData, message.from, options);
      }
    }
  }

  private async handlePrivateMessage(message: Message, chat: Chat): Promise<void> {
    try {
      if (message.type === "image" || message.type === "video") {
        const media = await message.downloadMedia();
        await chat.sendMessage(media, {
          sendMediaAsSticker: true,
          stickerAuthor: "",
          stickerName: "Sticker Bot ^_^"
        });
      } else if (message.type === "chat") {
        const text = message.body;
        const maxLength = this.config.maxTextLength || MAX_TEXT_LENGTH;
        
        if (text.length > maxLength) {
          throw new StringTooLongForSticker(text.length);
        }
        
        const stickerData = await this.textService.generateImage(text);
        const imageSticker = new MessageMedia("image/png", stickerData, "sticker.png");
        await chat.sendMessage(imageSticker, {
          sendMediaAsSticker: true,
          stickerAuthor: "",
          stickerName: "Sticker Bot ^_^"
        });
      } else if (message.type === "sticker") {
        const media = await message.downloadMedia();
        await message.reply(media);
      }
    } catch (err) {
      throw err; // Re-throw to be handled by main error handler
    }
  }

  private getMentionsArray(message: Message): string[] {
    if (!message.mentionedIds) {
      return [];
    }
    return message.mentionedIds.map((id: any) => id._serialized || id);
  }

  private async getProcessedData(message: Message): Promise<[MessageMedia, object] | [undefined, undefined]> {
    try {
      const messageToProcess = message.hasQuotedMsg ? await message.getQuotedMessage() : message;
      return this.processMessage(messageToProcess);
    } catch (err) {
      console.error('Error processing message data:', err);
      return [undefined, undefined];
    }
  }

  private async processMessage(message: Message): Promise<[MessageMedia, object] | [undefined, undefined]> {
    const stickerOptions = {
      sendMediaAsSticker: true,
      stickerName: "Sticker Bot ^_^"
    };

    try {
      if (message.type === "image" || message.type === "video") {
        const media = await message.downloadMedia();
        return [media, stickerOptions];
      }
      
      if (message.type === "chat") {
        const text = message.body;
        const maxLength = this.config.maxTextLength || MAX_TEXT_LENGTH;
        
        if (text.length > maxLength) {
          throw new StringTooLongForSticker(text.length);
        }
        
        const stickerData = await this.textService.generateImage(text);
        const media = new MessageMedia("image/png", stickerData, "sticker.png");
        return [media, stickerOptions];
      }
      
      if (message.type === "sticker") {
        const media = await message.downloadMedia();
        return [media, {}];
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
            await this.handleMessage(message);
          }
        }
      }
    } catch (err) {
      console.error('Error retrieving unread messages:', err);
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
