import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import { FloatingInput } from '../FloatingInput'
import type { WordSelection } from '../../../types/ocr-types'

const mockWordSelection: WordSelection = {
  wordIds: new Set([1, 2]),
  selectedWords: [
    { text: 'Hello', left: 10, top: 20, width: 30, height: 15, wordId: 1, lineId: 0, confidence: 0.9 },
    { text: 'World', left: 45, top: 20, width: 35, height: 15, wordId: 2, lineId: 0, confidence: 0.95 }
  ],
  selectedText: 'Hello World'
}

const defaultProps = {
  position: { x: 100, y: 200 },
  wordSelection: mockWordSelection,
  onTextChange: vi.fn(),
  onClear: vi.fn()
}

describe('FloatingInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders floating input at correct position', () => {
    render(<FloatingInput {...defaultProps} />)
    
    const input = screen.getByDisplayValue('Hello World')
    const container = input.parentElement
    expect(container).toHaveStyle({
      left: '100px',
      top: '200px'
    })
  })

  it('displays selected text in input', () => {
    render(<FloatingInput {...defaultProps} />)
    
    const input = screen.getByDisplayValue('Hello World')
    expect(input).toBeInTheDocument()
  })

  it('calls onTextChange when text is modified', () => {
    const mockOnTextChange = vi.fn()
    render(<FloatingInput {...defaultProps} onTextChange={mockOnTextChange} />)
    
    const input = screen.getByDisplayValue('Hello World')
    fireEvent.change(input, { target: { value: 'Modified Text' } })
    
    expect(mockOnTextChange).toHaveBeenCalledWith('Modified Text')
  })

  it('calls onClear when clear button is clicked', () => {
    const mockOnClear = vi.fn()
    render(<FloatingInput {...defaultProps} onClear={mockOnClear} />)
    
    const clearButton = screen.getByTitle('Clear selection')
    fireEvent.click(clearButton)
    
    expect(mockOnClear).toHaveBeenCalledTimes(1)
  })

  it('renders arrow pointing to selection', () => {
    render(<FloatingInput {...defaultProps} />)
    
    // Arrow should be positioned above the input
    const arrows = document.querySelectorAll('div[style*="border"]')
    expect(arrows.length).toBeGreaterThan(0)
  })

  it('has correct minimum width based on text length', () => {
    render(<FloatingInput {...defaultProps} />)
    
    const container = screen.getByDisplayValue('Hello World').parentElement
    const minWidth = Math.max(150, Math.min('Hello World'.length * 8 + 60, 500))
    expect(container).toHaveStyle({
      minWidth: `${minWidth}px`
    })
  })

  it('handles Enter key press', () => {
    const consoleSpy = vi.spyOn(console, 'log')
    render(<FloatingInput {...defaultProps} />)
    
    const input = screen.getByDisplayValue('Hello World')
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(consoleSpy).toHaveBeenCalledWith('Edited text:', 'Hello World')
    
    consoleSpy.mockRestore()
  })

  it('handles keydown events', () => {
    render(<FloatingInput {...defaultProps} />)
    
    const input = screen.getByDisplayValue('Hello World')
    expect(() => fireEvent.keyDown(input, { key: 'a' })).not.toThrow()
  })

  it('renders input element', () => {
    render(<FloatingInput {...defaultProps} />)
    
    const input = screen.getByDisplayValue('Hello World')
    expect(input.tagName).toBe('INPUT')
  })

  it('renders with proper container structure', () => {
    render(<FloatingInput {...defaultProps} />)
    
    const input = screen.getByDisplayValue('Hello World')
    const container = input.parentElement
    expect(container).toBeInTheDocument()
    expect(container?.style.position).toBeTruthy()
  })
})