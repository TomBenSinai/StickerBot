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
    fontPath: './assets/fonts/font.ttf',
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

// Run the example you want to test
// Uncomment the line below for the example you want to run:

// basicExample();
// developmentExample();
// customExample();
robustExample(); 
