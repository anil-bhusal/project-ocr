import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useOCRMutation } from '../useOCRQuery'

// Mock the OCR service
vi.mock('../api/ocr-service', () => ({
  ocrService: {
    uploadForOCRWithRetry: vi.fn()
  }
}))

describe('useOCRMutation', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children)
  }

  it('returns mutation object', () => {
    const { result } = renderHook(() => useOCRMutation(), {
      wrapper: createWrapper()
    })

    expect(result.current).toBeDefined()
    expect(typeof result.current.mutate).toBe('function')
    expect(typeof result.current.mutateAsync).toBe('function')
  })

  it('has initial idle state', () => {
    const { result } = renderHook(() => useOCRMutation(), {
      wrapper: createWrapper()
    })

    expect(result.current.isIdle).toBe(true)
    expect(result.current.isPending).toBe(false)
    expect(result.current.isSuccess).toBe(false)
    expect(result.current.isError).toBe(false)
  })
})