import path from 'path';
import { BotConfig } from '../types/BotConfig';

export const DEFAULT_CONFIG: Required<BotConfig> = {
  headless: true,
  fontPath: path.join(process.cwd(), "assets", "fonts", "font.ttf"),
  maxTextLength: 170,
  puppeteerArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu'
  ],
  stickerOptions: {
    stickerAuthor: "",
    stickerName: "Sticker Bot ^_^"
  }
};

export interface ResolvedBotConfig {
  headless: boolean;
  fontPath: string;
  maxTextLength: number;
  puppeteerArgs: string[];
  stickerOptions: {
    stickerAuthor: string;
    stickerName: string;
  };
}

export function mergeWithDefaults(userConfig: BotConfig): ResolvedBotConfig {
  return {
    headless: userConfig.headless ?? DEFAULT_CONFIG.headless,
    fontPath: userConfig.fontPath ?? DEFAULT_CONFIG.fontPath,
    maxTextLength: userConfig.maxTextLength ?? DEFAULT_CONFIG.maxTextLength,
    puppeteerArgs: userConfig.puppeteerArgs ?? DEFAULT_CONFIG.puppeteerArgs,
    stickerOptions: {
      stickerAuthor: (userConfig.stickerOptions?.stickerAuthor ?? DEFAULT_CONFIG.stickerOptions.stickerAuthor) as string,
      stickerName: (userConfig.stickerOptions?.stickerName ?? DEFAULT_CONFIG.stickerOptions.stickerName) as string
    }
  };
} 
