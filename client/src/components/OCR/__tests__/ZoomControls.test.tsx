import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import { ZoomControls } from '../ZoomControls'

const defaultProps = {
  zoomLevel: 1,
  onZoomIn: vi.fn(),
  onZoomOut: vi.fn(),
  onZoomReset: vi.fn()
}

describe('ZoomControls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders zoom controls with current zoom level', () => {
    render(<ZoomControls {...defaultProps} />)
    
    const zoomDisplay = screen.getByText('100%')
    expect(zoomDisplay).toBeInTheDocument()
  })

  it('displays correct zoom percentage for different values', () => {
    render(<ZoomControls {...defaultProps} zoomLevel={1.5} />)
    
    const zoomDisplay = screen.getByText('150%')
    expect(zoomDisplay).toBeInTheDocument()
  })

  it('calls onZoomIn when zoom in button is clicked', () => {
    const mockOnZoomIn = vi.fn()
    render(<ZoomControls {...defaultProps} onZoomIn={mockOnZoomIn} />)
    
    const zoomInButton = screen.getByText('+')
    fireEvent.click(zoomInButton)
    
    expect(mockOnZoomIn).toHaveBeenCalledTimes(1)
  })

  it('calls onZoomOut when zoom out button is clicked', () => {
    const mockOnZoomOut = vi.fn()
    render(<ZoomControls {...defaultProps} onZoomOut={mockOnZoomOut} />)
    
    const zoomOutButton = screen.getByText('−')
    fireEvent.click(zoomOutButton)
    
    expect(mockOnZoomOut).toHaveBeenCalledTimes(1)
  })

  it('calls onZoomReset when reset button is clicked', () => {
    const mockOnZoomReset = vi.fn()
    render(<ZoomControls {...defaultProps} onZoomReset={mockOnZoomReset} />)
    
    const resetButton = screen.getByText('Fit Width')
    fireEvent.click(resetButton)
    
    expect(mockOnZoomReset).toHaveBeenCalledTimes(1)
  })

  it('renders all buttons', () => {
    render(<ZoomControls {...defaultProps} />)
    
    const zoomInButton = screen.getByText('+')
    const zoomOutButton = screen.getByText('−')
    const resetButton = screen.getByText('Fit Width')
    
    expect(zoomInButton).toBeInTheDocument()
    expect(zoomOutButton).toBeInTheDocument()
    expect(resetButton).toBeInTheDocument()
  })
})