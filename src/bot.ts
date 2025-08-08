import express, { Request, Response } from 'express';
import { toDataURL } from 'qrcode';
import { BotFactory } from './BotFactory';
import clc from 'cli-color';

const logs: string[] = [];
const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);

const record = (type: 'log' | 'error', args: unknown[]): void => {
  const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
  const entry = `[${new Date().toISOString()}] ${message}`;
  logs.push(entry);
  if (logs.length > 100) {
    logs.shift();
  }
  if (type === 'log') {
    originalLog(...args);
  } else {
    originalError(...args);
  }
};

console.log = (...args: unknown[]): void => record('log', args);
console.error = (...args: unknown[]): void => record('error', args);

async function main(): Promise<void> {
  try {
    console.log(clc.blue('Initializing StickerBot...'));

    const bot = process.env.NODE_ENV === 'production'
      ? BotFactory.createProduction()
      : BotFactory.createDevelopment();

    await bot.start();

    const app = express();

    app.get('/api/logs', (_req: Request, res: Response) => {
      res.json({ logs });
    });

    app.post('/api/restart', async (_req: Request, res: Response) => {
      await bot.restart();
      res.sendStatus(200);
    });

    app.get('/api/qr', async (_req: Request, res: Response) => {
      const qr = bot.getLatestQr();
      if (!qr) {
        res.status(404).json({ qr: '' });
        return;
      }
      const dataUrl = await toDataURL(qr);
      res.json({ qr: dataUrl });
    });

    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
      console.log(`Admin API listening on port ${port}`);
    });
  } catch (error) {
    console.error(clc.red('Failed to initialize StickerBot:'), error);
    process.exit(1);
  }
}

main();
