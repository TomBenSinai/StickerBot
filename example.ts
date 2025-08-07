import { BotFactory, StickerBot, BotConfig } from './src';

// Example 1: Basic usage with factory
async function basicExample() {
  console.log('Starting basic bot...');
  const bot = BotFactory.createDefault();
  await bot.start();
}

// Example 2: Development configuration
async function developmentExample() {
  console.log('Starting development bot with custom settings...');
  const bot = BotFactory.createDevelopment();
  await bot.start();
}

// Example 3: Custom configuration
async function customExample() {
  console.log('Starting bot with custom configuration...');
  
  const customConfig: BotConfig = {
    headless: true,
    maxTextLength: 250,
    rtlFont: {
      path: './assets/fonts/font.ttf',
      family: "CustomFont",
      weight: "normal"
    },
    ltrFont: {
      path: './assets/fonts/OpenSans-Bold.ttf',
      family: "Open Sans",
      weight: "bold"
    },
    stickerOptions: {
      stickerAuthor: "My Custom Bot",
      stickerName: "Custom Stickers ✨"
    },
    puppeteerArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  };
  
  const bot = new StickerBot(customConfig);
  await bot.start();
}

// Example 4: Error handling and graceful shutdown
async function robustExample() {
  console.log('Starting bot with error handling...');
  
  const bot = BotFactory.createProduction();
  
  try {
    await bot.start();
    
    // Handle shutdown signals
    process.on('SIGINT', async () => {
      console.log('Received SIGINT, shutting down gracefully...');
      await bot.stop();
    });
    
    process.on('SIGTERM', async () => {
      console.log('Received SIGTERM, shutting down gracefully...');
      await bot.stop();
    });
    
  } catch (error) {
    console.error('Failed to start bot:', error);
    process.exit(1);
  }
}

// Example 5: Using default fonts (RTL: CustomFont normal, LTR: Open Sans bold)
const bot1 = new StickerBot();

// Example 6: Custom font configuration
const bot2 = new StickerBot({
  rtlFont: {
    path: "./assets/fonts/font.ttf",
    family: "MyCustomRTLFont",
    weight: "normal"
  },
  ltrFont: {
    path: "./assets/fonts/OpenSans-Regular.ttf", 
    family: "Open Sans",
    weight: "normal" // Use regular weight instead of bold
  },
  maxTextLength: 200,
  headless: false
});

// Example 7: Different fonts for different text directions
const bot3 = new StickerBot({
  rtlFont: {
    path: "./assets/fonts/font.ttf",
    family: "ArabicFont", 
    weight: "bold" // Bold RTL text
  },
  ltrFont: {
    path: "./assets/fonts/OpenSans-Bold.ttf",
    family: "Open Sans",
    weight: "bold" // Bold LTR text
  }
});

// Example 8: Using specific Chrome installation for better video support
const bot4 = new StickerBot({
  executablePath: "/usr/bin/google-chrome-stable", // Linux
  // executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", // Windows
  // executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // macOS
  headless: false,
  puppeteerArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--enable-features=NetworkService,NetworkServiceLogging'
  ]
});

// Run the example you want to test
// Uncomment the line below for the example you want to run:

// basicExample();
// developmentExample();
// customExample();
robustExample(); 
