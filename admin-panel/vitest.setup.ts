// Polyfill window.matchMedia for Mantine in jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })
}

// Polyfill EventSource for tests
class DummyEventSource {
  url: string
  withCredentials = false
  readyState = 0
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private listeners: Record<string, ((ev: any) => void)[]> = {}
  constructor(url: string) {
    this.url = url
    // no-op
  }
  addEventListener(type: string, listener: (ev: MessageEvent) => void) {
    this.listeners[type] = this.listeners[type] || []
    this.listeners[type].push(listener)
  }
  removeEventListener(type: string, listener: (ev: MessageEvent) => void) {
    this.listeners[type] = (this.listeners[type] || []).filter((l) => l !== listener)
  }
  close() {
    // no-op
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).EventSource = (globalThis as any).EventSource || DummyEventSource 
