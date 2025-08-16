export interface LogsResponse {
  logs: string[]
}

export type BotState = 'starting' | 'awaiting-qr' | 'ready' | 'restarting' | 'error'
export interface BotStatus {
  state: BotState
  since: string
  message?: string
}

export const restartBot = async (): Promise<void> => {
  await fetch('/api/restart', { method: 'POST' })
}

export const resetAuthAndRestart = async (): Promise<void> => {
  const response = await fetch('/api/reset-auth', { method: 'POST' })
  if (!response.ok) throw new Error('Failed to reset auth and restart')
}

export interface QrResponse {
  qr: string
}

export const requestQr = async (): Promise<string> => {
  const response = await fetch('/api/qr')
  if (!response.ok) {
    throw new Error('Failed to fetch QR')
  }
  const data: QrResponse = await response.json()
  return data.qr
}

export interface EventsHandlers {
  onStatus?: (status: BotStatus) => void
  onLog?: (line: string) => void
  onLogsBatch?: (lines: string[]) => void
  onQr?: (dataUrl: string) => void
  onStickerCount?: (count: number) => void
}

export const connectEvents = (handlers: EventsHandlers): EventSource => {
  const es = new EventSource('/api/events')
  es.addEventListener('status', (ev) => {
    try {
      const data = JSON.parse((ev as MessageEvent).data) as BotStatus
      handlers.onStatus?.(data)
    } catch { return }
  })
  es.addEventListener('logs', (ev) => {
    try {
      const data = JSON.parse((ev as MessageEvent).data) as string[]
      handlers.onLogsBatch?.(data)
    } catch { return }
  })
  es.addEventListener('log', (ev) => {
    try {
      const data = JSON.parse((ev as MessageEvent).data) as string
      handlers.onLog?.(data)
    } catch { return }
  })
  es.addEventListener('qr', (ev) => {
    try {
      const data = JSON.parse((ev as MessageEvent).data) as string
      handlers.onQr?.(data)
    } catch { return }
  })
  es.addEventListener('sticker-count', (ev) => {
    try {
      const data = JSON.parse((ev as MessageEvent).data) as number
      handlers.onStickerCount?.(data)
    } catch { return }
  })
  return es
}
