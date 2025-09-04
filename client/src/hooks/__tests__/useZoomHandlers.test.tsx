import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useZoomHandlers } from '../useZoomHandlers'

describe('useZoomHandlers', () => {
  it('should return zoom handlers', () => {
    const props = {
      containerRef: { current: null },
      showFloatingInput: false,
      wordSelectionLength: 0,
      setZoomLevel: vi.fn(),
      setShowFloatingInput: vi.fn(),
    }

    const { result } = renderHook(() => useZoomHandlers(props as any))
    
    expect(typeof result.current.handleZoomIn).toBe('function')
    expect(typeof result.current.handleZoomOut).toBe('function')
    expect(typeof result.current.handleZoomReset).toBe('function')
  })
})