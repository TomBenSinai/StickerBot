import { StickerBot } from './StickerBot';
import { BotConfig } from './types/BotConfig';
import path from 'path';

export class BotFactory {
  
  static createDefault(): StickerBot {
    return new StickerBot();
  }

  static createWithConfig(config: BotConfig): StickerBot {
    return new StickerBot(config);
  }

  static createDevelopment(): StickerBot {
    const config: BotConfig = {
      headless: false,
      maxTextLength: 200,
      fontPath: path.join(process.cwd(), "assets", "fonts", "font.ttf"),
      stickerOptions: {
        stickerAuthor: "Dev Bot",
        stickerName: "Dev Sticker Bot 🚧"
      }
    };
    return new StickerBot(config);
  }

  static createProduction(): StickerBot {
    const config: BotConfig = {
      headless: true,
      maxTextLength: 150,
      puppeteerArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
        '--disable-extensions'
      ]
    };
    return new StickerBot(config);
  }
} 
