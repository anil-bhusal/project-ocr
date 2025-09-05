import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useZoomHandlers } from '../useZoomHandlers'

describe('useZoomHandlers', () => {
  it('should return zoom handlers', () => {
    // Create mock DOM element
    const mockContainer = document.createElement('div') as HTMLDivElement;
    
    const props = {
      containerRef: { current: mockContainer },
      showFloatingInput: false,
      wordSelectionLength: 0,
      setZoomLevel: vi.fn(),
      setShowFloatingInput: vi.fn(),
    }

    const { result } = renderHook(() => useZoomHandlers(props))
    
    expect(typeof result.current.handleZoomIn).toBe('function')
    expect(typeof result.current.handleZoomOut).toBe('function')
    expect(typeof result.current.handleZoomReset).toBe('function')
  })
})