import express, { Request, Response } from 'express';
import { toDataURL } from 'qrcode';
import { BotFactory } from './BotFactory';
import clc from 'cli-color';
import path from 'node:path';
import { rm as remove } from 'node:fs/promises';
import fs from 'node:fs';

const logs: string[] = [];
const sseClients: Response[] = [];

type BotState = 'starting' | 'awaiting-qr' | 'ready' | 'restarting' | 'error';
interface BotStatus {
  state: BotState;
  since: string;
  message?: string;
}

let status: BotStatus = {
  state: 'starting',
  since: new Date().toISOString(),
  message: 'Initializing',
};

const originalLog = console.log.bind(console);
const originalError = console.error.bind(console);

const sendSse = (res: Response, event: string, data: unknown): void => {
  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch {
    // ignore write errors (client likely disconnected)
  }
};

function broadcast(event: string, data: unknown): void {
  for (const client of [...sseClients]) {
    sendSse(client, event, data);
  }
}

function updateStatus(newState: BotState, message?: string): void {
  status = { state: newState, since: new Date().toISOString(), message };
  broadcast('status', status);
}

let lastQrSent: string | null = null;
let lastAwaitingAt: number | null = null;

const record = (type: 'log' | 'error', args: unknown[]): void => {
  const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
  const entry = `[${new Date().toISOString()}] ${message}`;
  logs.push(entry);
  if (logs.length > 100) {
    logs.shift();
  }
  broadcast('log', entry);

  // Detect ready from known log line
  if (message.includes('Client is up and running!')) {
    lastQrSent = null;
    lastAwaitingAt = null;
    updateStatus('ready', 'Bot is ready');
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

    updateStatus('starting', 'Starting bot');
    await bot.start();
    // Do not mark ready here; wait for the actual ready log or QR

    const app = express();

    // Static serving for admin panel if build is present
    const publicDir = path.resolve(process.cwd(), 'public');
    const indexPath = path.join(publicDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      app.use(express.static(publicDir));
    }

    // Watch for QR changes periodically and broadcast
    setInterval(async () => {
      try {
        const qr = bot.getLatestQr();
        if (qr && qr !== lastQrSent) {
          const dataUrl = await toDataURL(qr);
          lastQrSent = qr;
          updateStatus('awaiting-qr', 'Waiting for scan');
          broadcast('qr', dataUrl);
        }
        if (status.state === 'awaiting-qr' && lastAwaitingAt && Date.now() - lastAwaitingAt > 120000) {
          broadcast('status', status);
        }
      } catch (e) {
        // ignore
      }
    }, 1000);

    // SSE endpoint that streams status and logs
    app.get('/api/events', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      sseClients.push(res);

      // Send current status and recent logs on connect
      sendSse(res, 'status', status);
      sendSse(res, 'logs', logs);

      const onClose = () => {
        const idx = sseClients.indexOf(res);
        if (idx !== -1) sseClients.splice(idx, 1);
        try { res.end(); } catch { /* noop */ }
      };

      req.on('close', onClose);
      req.on('error', onClose);
    });

    app.post('/api/restart', async (_req: Request, res: Response) => {
      updateStatus('restarting', 'Restarting bot');
      lastQrSent = null;
      bot.clearLatestQr();
      await bot.restart();
      res.sendStatus(200);
    });

    app.post('/api/reset-auth', async (_req: Request, res: Response) => {
      try {
        updateStatus('restarting', 'Resetting auth and restarting');
        lastQrSent = null;
        bot.clearLatestQr();
        const authDir = path.resolve(process.cwd(), '.wwebjs_auth');
        await remove(authDir, { recursive: true, force: true });
        await bot.restart();
        res.sendStatus(200);
      } catch (err) {
        console.error(clc.red('Failed to reset auth and restart bot:'), err);
        updateStatus('error', 'Failed to reset auth');
        res.status(500).json({ error: 'Failed to reset auth and restart bot' });
      }
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

    // SPA fallback: serve index.html for non-API GETs if admin panel exists
    if (fs.existsSync(indexPath)) {
      app.get('*', (req, res) => {
        if (req.path.startsWith('/api')) return res.status(404).end();
        res.sendFile(indexPath);
      });
    }

    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => {
      console.log(`Admin API listening on port ${port}`);
    });
  } catch (error) {
    console.error(clc.red('Failed to initialize StickerBot:'), error);
    updateStatus('error', 'Initialization failed');
    process.exit(1);
  }
}

main();
