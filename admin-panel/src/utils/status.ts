import type { BotStatus } from '../api'

const STATUS_COLORS: Record<BotStatus['state'] | 'unknown', string> = {
  ready: 'green',
  starting: 'yellow',
  restarting: 'orange',
  'awaiting-qr': 'grape',
  error: 'red',
  unknown: 'gray'
} as const;

export const statusColor = (state: BotStatus['state'] | 'unknown'): string => {
  return STATUS_COLORS[state] || STATUS_COLORS.unknown;
}