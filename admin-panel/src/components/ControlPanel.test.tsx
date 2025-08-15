import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { MantineProvider } from '@mantine/core'
import ControlPanel from './ControlPanel'

describe('ControlPanel', () => {
  it('renders action buttons', () => {
    render(
      <MantineProvider defaultColorScheme="dark">
        <ControlPanel />
      </MantineProvider>
    )
    expect(screen.getByText(/Restart Bot/)).toBeInTheDocument()
    expect(screen.getByText(/Request QR/)).toBeInTheDocument()
  })
})
