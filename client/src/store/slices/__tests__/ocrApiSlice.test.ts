import { describe, it, expect } from 'vitest'
import reducer, { clearApiError, clearOCRData, setApiError, setLastProcessedFile, setOCRData, setProcessingStatus } from '../ocrApiSlice'


describe('ocrApiSlice', () => {
  const initialState = {
    currentOCRData: null,
    isProcessing: false,
    lastError: null,
    lastProcessedFile: null,
  }

  it('returns initial state', () => {
    const state = reducer(undefined, { type: 'unknown' })
    expect(state).toEqual(initialState)
  })

  it('handles setOCRData', () => {
    const ocrData = { words: [{ text: 'test', wordId: 1 }] }
    const state = reducer(initialState, setOCRData(ocrData as any))
    expect(state.currentOCRData).toEqual(ocrData)
  })

  it('handles clearOCRData', () => {
    const stateWithData = { ...initialState, currentOCRData: { words: [] } }
    const state = reducer(stateWithData, clearOCRData())
    expect(state.currentOCRData).toBeNull()
  })

  it('handles setProcessingStatus', () => {
    const state = reducer(initialState, setProcessingStatus(true))
    expect(state.isProcessing).toBe(true)
  })

  it('handles setApiError', () => {
    const error = { message: 'Error', status: 500 }
    const state = reducer(initialState, setApiError(error))
    expect(state.lastError).toEqual(error)
  })

  it('handles clearApiError', () => {
    const stateWithError = { ...initialState, lastError: { message: 'Error' } }
    const state = reducer(stateWithError, clearApiError())
    expect(state.lastError).toBeNull()
  })

  it('handles setLastProcessedFile', () => {
    const fileName = 'test.jpg'
    const state = reducer(initialState, setLastProcessedFile(fileName))
    expect(state.lastProcessedFile).toBe(fileName)
  })
})