import { BotFactory } from './BotFactory';
import clc from 'cli-color';
import { LogService } from './admin/LogService';
import { createAdminServer } from './admin/AdminServer';

async function main() {
  try {
    LogService.init();
    console.log(clc.blue('Initializing StickerBot...'));

    const bot = process.env.NODE_ENV === 'production'
      ? BotFactory.createProduction()
      : BotFactory.createDevelopment();

    const admin = createAdminServer(bot);
    admin.listen(3001, () => console.log(clc.green('Admin server running on port 3001')));

    await bot.start();
    
  } catch (error) {
    console.error(clc.red('Failed to initialize StickerBot:'), error);
    process.exit(1);
  }
}

main();
