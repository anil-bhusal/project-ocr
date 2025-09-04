import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMouseSelection } from '../useMouseSelection'

describe('useMouseSelection', () => {
  it('should return mouse selection handlers', () => {
    const props = {
      ocrData: null,
      imageRef: { current: null },
      containerRef: { current: null },
      selectionBoxRef: { current: null },
      wordSelection: {
        wordIds: new Set(),
        selectedWords: [],
        selectedText: ''
      },
      isTextSelecting: false,
      textSelectionStart: null,
      getWordsBetween: vi.fn(),
      handleUpdateWordSelection: vi.fn(),
      setIsTextSelecting: vi.fn(),
      setTextSelectionStart: vi.fn(),
      setIsDragging: vi.fn(),
      zoomLevel: 1,
    }

    const { result } = renderHook(() => useMouseSelection(props as any))
    
    expect(typeof result.current.handleMouseDown).toBe('function')
    expect(typeof result.current.handleMouseUp).toBe('function')
    expect(typeof result.current.findWordAtPosition).toBe('function')
    expect(result.current.dragStateRef).toBeDefined()
  })
})