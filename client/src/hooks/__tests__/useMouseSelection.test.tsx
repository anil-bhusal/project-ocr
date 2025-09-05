import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMouseSelection } from '../useMouseSelection'

describe('useMouseSelection', () => {
  it('should return mouse selection handlers', () => {
    // Create mock DOM elements
    const mockImage = document.createElement('img') as HTMLImageElement;
    const mockContainer = document.createElement('div') as HTMLDivElement;
    const mockSelectionBox = document.createElement('div') as HTMLDivElement;
    
    const props = {
      ocrData: null,
      imageRef: { current: mockImage },
      containerRef: { current: mockContainer },
      selectionBoxRef: { current: mockSelectionBox },
      wordSelection: {
        wordIds: new Set<number>(),
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

    const { result } = renderHook(() => useMouseSelection(props))
    
    expect(typeof result.current.handleMouseDown).toBe('function')
    expect(typeof result.current.handleMouseUp).toBe('function')
    expect(typeof result.current.findWordAtPosition).toBe('function')
    expect(result.current.dragStateRef).toBeDefined()
  })
})