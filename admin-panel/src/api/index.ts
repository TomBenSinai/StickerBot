export interface BotStatus {
  state: 'ready' | 'starting' | 'restarting' | 'awaiting-qr' | 'error';
}