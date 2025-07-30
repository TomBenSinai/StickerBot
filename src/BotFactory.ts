import { StickerBot } from './StickerBot';
import { BotConfig } from './types/BotConfig';
import { findChromeExecutable } from './utils';
import path from 'path';

export class BotFactory {
  
  static createDefault(): StickerBot {
    return new StickerBot();
  }

  static createWithConfig(config: BotConfig): StickerBot {
    return new StickerBot(config);
  }

  static createDevelopment(): StickerBot {
    const chromeExecutable = findChromeExecutable();
    
    const config: BotConfig = {
      headless: false,
      maxTextLength: 200,
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
      puppeteerArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--enable-features=NetworkService,NetworkServiceLogging',
        '--force-color-profile=srgb',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ],
      executablePath: chromeExecutable || undefined,
      stickerOptions: {
        stickerAuthor: "Dev Bot",
        stickerName: "Dev Sticker Bot"
      }
    };
    
    if (chromeExecutable) {
      console.log(`Using Chrome at: ${chromeExecutable}`);
    } else {
      console.log('Chrome not found, using default Chromium');
    }
    
    return new StickerBot(config);
  }

  static createProduction(): StickerBot {
    const chromeExecutable = findChromeExecutable();
    
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
      ],
      executablePath: chromeExecutable || undefined
    };
    
    if (chromeExecutable) {
      console.log(`Using Chrome at: ${chromeExecutable}`);
    } else {
      console.log('Chrome not found, using default Chromium');
    }
    
    return new StickerBot(config);
  }
} 
