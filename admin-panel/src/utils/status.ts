import type { BotStatus } from '../api'

export const statusColor = (state: BotStatus['state'] | 'unknown'): string => {
	switch (state) {
		case 'ready':
			return 'green'
		case 'starting':
			return 'yellow'
		case 'restarting':
			return 'orange'
		case 'awaiting-qr':
			return 'grape'
		case 'error':
			return 'red'
		default:
			return 'gray'
	}
}


