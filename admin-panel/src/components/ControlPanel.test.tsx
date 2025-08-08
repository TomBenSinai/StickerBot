import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ControlPanel from './ControlPanel'

describe('ControlPanel', () => {
  it('renders action buttons', () => {
    render(<ControlPanel />)
    expect(screen.getByText(/Restart Bot/)).toBeInTheDocument()
    expect(screen.getByText(/Request QR/)).toBeInTheDocument()
  })
})
