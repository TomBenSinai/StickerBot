export interface FontConfig {
  path: string;
  family: string;
  weight: string;
}

export interface BotConfig {
  headless?: boolean;
  rtlFont?: FontConfig;
  ltrFont?: FontConfig;
  maxTextLength?: number;
  puppeteerArgs?: string[];
  executablePath?: string;
  stickerOptions?: StickerOptions;
}

export interface StickerOptions {
  stickerAuthor?: string;
  stickerName?: string;
  stickerCategories?: string[];
}

export interface IBotService {
  start(): Promise<void>;
  stop(): Promise<void>;
  handleMessage(message: any): Promise<void>;
}

export interface ITextToImageService {
  generateImage(text: string): Promise<string>;
}

export interface IAdminService {
  isAdmin(chat: any, message: any): Promise<boolean>;
}

export interface IMentionService {
  mentionEveryone(chat: any): Promise<void>;
} 
