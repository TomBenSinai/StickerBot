import { BotFactory } from './BotFactory';
import clc from 'cli-color';

async function main() {
  try {
    console.log(clc.blue('Initializing StickerBot...'));
    
    const bot = process.env.NODE_ENV === 'production' 
      ? BotFactory.createProduction()
      : BotFactory.createDevelopment();

    await bot.start();
    
  } catch (error) {
    console.error(clc.red('Failed to initialize StickerBot:'), error);
    process.exit(1);
  }
}

main();
