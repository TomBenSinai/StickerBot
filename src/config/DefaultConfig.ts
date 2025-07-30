import path from 'path';
import { BotConfig, FontConfig } from '../types/BotConfig';

export const DEFAULT_CONFIG: Required<BotConfig> = {
  headless: true,
  rtlFont: {
    path: path.join(process.cwd(), "assets", "fonts", "font.ttf"),
    family: "CustomFont",
    weight: "normal"
  },
  ltrFont: {
    path: path.join(process.cwd(), "assets", "fonts", "OpenSans-Bold.ttf"),
    family: "Open Sans",
    weight: "bold"
  },
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
  executablePath: "",
  stickerOptions: {
    stickerAuthor: "StickerBot",
    stickerName: "Custom Sticker Pack",
    stickerCategories: ["🤖", "💬"]
  }
};

export interface ResolvedBotConfig {
  headless: boolean;
  rtlFont: FontConfig;
  ltrFont: FontConfig;
  maxTextLength: number;
  puppeteerArgs: string[];
  executablePath: string;
  stickerOptions: {
    stickerAuthor: string;
    stickerName: string;
    stickerCategories: string[];
  };
}

export function mergeWithDefaults(userConfig: BotConfig): ResolvedBotConfig {
  return {
    headless: userConfig.headless ?? DEFAULT_CONFIG.headless,
    rtlFont: userConfig.rtlFont ?? DEFAULT_CONFIG.rtlFont,
    ltrFont: userConfig.ltrFont ?? DEFAULT_CONFIG.ltrFont,
    maxTextLength: userConfig.maxTextLength ?? DEFAULT_CONFIG.maxTextLength,
    puppeteerArgs: userConfig.puppeteerArgs ?? DEFAULT_CONFIG.puppeteerArgs,
    executablePath: userConfig.executablePath ?? DEFAULT_CONFIG.executablePath,
    stickerOptions: {
      stickerAuthor: (userConfig.stickerOptions?.stickerAuthor ?? DEFAULT_CONFIG.stickerOptions.stickerAuthor) as string,
      stickerName: (userConfig.stickerOptions?.stickerName ?? DEFAULT_CONFIG.stickerOptions.stickerName) as string,
      stickerCategories: (userConfig.stickerOptions?.stickerCategories ?? DEFAULT_CONFIG.stickerOptions.stickerCategories) as string[]
    }
  };
} 
