import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { screen, fireEvent } from '@testing-library/dom'
import { TextPanel } from '../TextPanel'
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
  wordSelection: mockWordSelection,
  onTextChange: vi.fn()
}

describe('TextPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders text panel with selected text', () => {
    render(<TextPanel {...defaultProps} />)
    
    const textarea = screen.getByDisplayValue('Hello World')
    expect(textarea).toBeInTheDocument()
  })

  it('displays word count correctly', () => {
    render(<TextPanel {...defaultProps} />)
    
    const wordCount = screen.getByText(/2 words/i)
    expect(wordCount).toBeInTheDocument()
  })

  it('calls onTextChange when text is changed', () => {
    const mockOnTextChange = vi.fn()
    render(<TextPanel {...defaultProps} onTextChange={mockOnTextChange} />)
    
    const textarea = screen.getByDisplayValue('Hello World')
    fireEvent.change(textarea, { target: { value: 'Modified text' } })
    
    expect(mockOnTextChange).toHaveBeenCalledWith('Modified text')
  })

  it('displays correct word count message', () => {
    render(<TextPanel {...defaultProps} />)
    
    const wordCount = screen.getByText('2 words selected')
    expect(wordCount).toBeInTheDocument()
  })

  it('handles empty selection', () => {
    const emptySelection: WordSelection = {
      wordIds: new Set(),
      selectedWords: [],
      selectedText: ''
    }
    
    render(<TextPanel {...defaultProps} wordSelection={emptySelection} />)
    
    const textarea = screen.getByDisplayValue('')
    expect(textarea).toBeInTheDocument()
    
    const wordCount = screen.getByText('Select text from image')
    expect(wordCount).toBeInTheDocument()
  })

  it('has proper textarea structure', () => {
    render(<TextPanel {...defaultProps} />)
    
    const textarea = screen.getByDisplayValue('Hello World')
    expect(textarea).toBeInTheDocument()
    expect(textarea.tagName).toBe('TEXTAREA')
  })
})