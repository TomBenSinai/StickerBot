export interface LogsResponse {
  logs: string[]
}

export const fetchLogs = async (): Promise<string[]> => {
  const response = await fetch('/api/logs')
  if (!response.ok) {
    throw new Error('Failed to fetch logs')
  }
  const data: LogsResponse = await response.json()
  return data.logs
}

export const restartBot = async (): Promise<void> => {
  await fetch('/api/restart', { method: 'POST' })
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
