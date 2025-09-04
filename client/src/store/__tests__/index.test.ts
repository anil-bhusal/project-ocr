import { describe, it, expect } from 'vitest'
import { store } from '..'

describe('Redux Store', () => {
  it('should be defined', () => {
    expect(store).toBeDefined()
  })

  it('should have correct initial state structure', () => {
    const state = store.getState()
    expect(state).toHaveProperty('ocrApiState')
  })

  it('should have ocrApiState with correct structure', () => {
    const state = store.getState()
    expect(state.ocrApiState).toHaveProperty('currentOCRData')
    expect(state.ocrApiState).toHaveProperty('isProcessing')
    expect(state.ocrApiState).toHaveProperty('lastError')
    expect(state.ocrApiState).toHaveProperty('lastProcessedFile')
    expect(state.ocrApiState).toHaveProperty('uploadHistory')
  })

  it('should have dispatch function', () => {
    expect(typeof store.dispatch).toBe('function')
  })

  it('should have subscribe function', () => {
    expect(typeof store.subscribe).toBe('function')
  })
})