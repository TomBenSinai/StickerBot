export interface BotConfig {
  headless?: boolean;
  fontPath?: string;
  maxTextLength?: number;
  puppeteerArgs?: string[];
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
  isAdmin(client: any, chat: any, message: any): Promise<boolean>;
}

export interface IMentionService {
  mentionEveryone(client: any, chat: any, message: any): Promise<void>;
} 
