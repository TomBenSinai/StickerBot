// Polyfill window.matchMedia for Mantine in jsdom
if (typeof window !== 'undefined' && !window.matchMedia) {
	(window as unknown as { matchMedia: (query: string) => MediaQueryList }).matchMedia = (query: string) => ({
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

// Polyfill ResizeObserver for Mantine ScrollArea in jsdom
if (typeof window !== 'undefined' && !(window as unknown as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver) {
	class DummyResizeObserver {
		// Using unknown to avoid lint errors; tests don't rely on callback behavior
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		constructor(_callback: unknown) {}
		observe(): void {}
		unobserve(): void {}
		disconnect(): void {}
	}
	;(window as unknown as { ResizeObserver: typeof ResizeObserver }).ResizeObserver = DummyResizeObserver as unknown as typeof ResizeObserver
}

// Polyfill EventSource for tests
class DummyEventSource {
	url: string
	withCredentials = false
	readyState = 0
	private listeners: Record<string, ((ev: MessageEvent) => void)[]> = {}
	constructor(url: string) {
		this.url = url
	}
	addEventListener(type: string, listener: (ev: MessageEvent) => void): void {
		this.listeners[type] = this.listeners[type] || []
		this.listeners[type].push(listener)
	}
	removeEventListener(type: string, listener: (ev: MessageEvent) => void): void {
		this.listeners[type] = (this.listeners[type] || []).filter((l) => l !== listener)
	}
	close(): void {}
}
;(globalThis as unknown as { EventSource?: typeof EventSource }).EventSource = (globalThis as unknown as { EventSource?: typeof EventSource }).EventSource || (DummyEventSource as unknown as typeof EventSource) 
