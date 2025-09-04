import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import React from 'react'
import { useAppDispatch, useAppSelector, useOCRApiState } from '../useRedux'

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      ocrApiState: () => ({
        currentOCRData: null,
        isProcessing: false,
        lastError: null,
        lastProcessedFile: null,
        uploadHistory: []
      })
    }
  })
}

describe('useRedux hooks', () => {
  const createWrapper = (store: any) => {
    return ({ children }: { children: React.ReactNode }) =>
      React.createElement(Provider, { store } as any, children)
  }

  it('useAppDispatch returns dispatch function', () => {
    const store = createMockStore()
    const { result } = renderHook(() => useAppDispatch(), {
      wrapper: createWrapper(store)
    })

    expect(typeof result.current).toBe('function')
  })

  it('useAppSelector returns state', () => {
    const store = createMockStore()
    const { result } = renderHook(
      () => useAppSelector(state => state.ocrApiState),
      { wrapper: createWrapper(store) }
    )

    expect(result.current).toBeDefined()
    expect(result.current.isProcessing).toBe(false)
  })

  it('useOCRApiState returns OCR state and dispatch', () => {
    const store = createMockStore()
    const { result } = renderHook(() => useOCRApiState(), {
      wrapper: createWrapper(store)
    })

    expect(result.current.currentOCRData).toBeNull()
    expect(result.current.isProcessing).toBe(false)
    expect(typeof result.current.dispatch).toBe('function')
  })
})