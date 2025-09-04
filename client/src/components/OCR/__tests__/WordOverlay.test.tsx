import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { WordOverlay } from '../WordOverlay'
import type { OCRWord } from '../../../types/ocr-types'

describe('WordOverlay', () => {
  const mockWord: OCRWord = {
    text: 'Hello',
    left: 10,
    top: 20,
    width: 50,
    height: 15,
    wordId: 1,
    lineId: 0,
    confidence: 0.95
  }

  const defaultProps = {
    word: mockWord,
    isSelected: false,
    isHovered: false,
    scaleX: 1,
    scaleY: 1,
    onClick: vi.fn(),
    onMouseEnter: vi.fn(),
    onMouseLeave: vi.fn()
  }

  it('renders word overlay', () => {
    render(<WordOverlay {...defaultProps} />)
    
    const overlay = document.querySelector('.word-overlay')
    expect(overlay).toBeTruthy()
  })

  it('applies selected styles when selected', () => {
    render(<WordOverlay {...defaultProps} isSelected={true} />)
    
    const overlay = document.querySelector('.word-overlay')
    expect(overlay?.className).toContain('selected')
  })

  it('applies hovered styles when hovered', () => {
    render(<WordOverlay {...defaultProps} isHovered={true} />)
    
    const overlay = document.querySelector('.word-overlay')
    expect(overlay?.className).toContain('hovered')
  })

  it('positions word correctly', () => {
    render(<WordOverlay {...defaultProps} />)
    
    const overlay = document.querySelector('.word-overlay') as HTMLElement
    expect(overlay.style.left).toBe('10px')
    expect(overlay.style.top).toBe('20px')
  })

  it('scales word correctly', () => {
    render(<WordOverlay {...defaultProps} scaleX={2} scaleY={1.5} />)
    
    const overlay = document.querySelector('.word-overlay') as HTMLElement
    expect(overlay.style.left).toBe('20px')
    expect(overlay.style.top).toBe('30px')
  })
})