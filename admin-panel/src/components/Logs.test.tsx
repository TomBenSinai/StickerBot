import React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MantineProvider } from '@mantine/core'
import Logs from './Logs'

interface MockHandlers {
	onStatus?: (status: unknown) => void
	onLog?: (line: string) => void
	onLogsBatch?: (lines: string[]) => void
	onQr?: (dataUrl: string) => void
}

// Mock connectEvents to immediately emit a logs batch and a single log
vi.mock('../api', () => {
	return {
		connectEvents: (handlers: MockHandlers) => {
			setTimeout(() => {
				handlers.onLogsBatch?.(['alpha', 'beta', '\u001b[32mgreen\u001b[0m'])
				handlers.onLog?.('gamma')
			}, 0)
			return { close() {} }
		},
	}
})

describe('Logs', () => {
	test('renders and filters lines', async () => {
		render(
			<MantineProvider defaultColorScheme="dark">
				<Logs autoScroll={false} filterText={'a'} />
			</MantineProvider>
		)
		// Should include lines containing letter 'a' (alpha, gamma)
		expect(await screen.findByText(/alpha/)).toBeInTheDocument()
		expect(await screen.findByText(/gamma/)).toBeInTheDocument()
	})
}) 
