import express from 'express';
import { StickerBot } from '../StickerBot';
import { LogService } from './LogService';

export function createAdminServer(bot: StickerBot) {
  const app = express();
  app.use(express.json());

  app.get('/api/logs', (_req, res) => {
    res.json({ logs: LogService.getLogs() });
  });

  app.post('/api/restart', async (_req, res) => {
    try {
      await bot.restart();
      res.json({ status: 'restarted' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to restart' });
    }
  });

  app.get('/api/qr', (_req, res) => {
    res.json({ qr: bot.getLastQR() });
  });

  return app;
}
