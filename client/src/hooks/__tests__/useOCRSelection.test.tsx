import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import type { EnhancedOCRResponse, OCRWord } from '../../types/ocr-types'
import { useOCRSelection } from '../useOCRSelection'

const mockWords: OCRWord[] = [
  { text: 'Hello', left: 10, top: 20, width: 30, height: 15, wordId: 1, lineId: 0, confidence: 0.9 },
  { text: 'World', left: 45, top: 20, width: 35, height: 15, wordId: 2, lineId: 0, confidence: 0.95 },
  { text: 'This', left: 10, top: 40, width: 25, height: 15, wordId: 3, lineId: 1, confidence: 0.85 },
  { text: 'is', left: 40, top: 40, width: 15, height: 15, wordId: 4, lineId: 1, confidence: 0.92 },
  { text: 'test', left: 60, top: 40, width: 20, height: 15, wordId: 5, lineId: 1, confidence: 0.88 }
]

const mockOCRData: EnhancedOCRResponse = {
  words: mockWords
}

describe('useOCRSelection', () => {
  it('initializes with empty selection', () => {
    const { result } = renderHook(() => useOCRSelection(null))

    expect(result.current.wordSelection.wordIds.size).toBe(0)
    expect(result.current.wordSelection.selectedWords).toEqual([])
    expect(result.current.wordSelection.selectedText).toBe('')
  })

  it('updates word selection correctly', () => {
    const { result } = renderHook(() => useOCRSelection(mockOCRData))

    act(() => {
      const wordIds = new Set([1, 2])
      result.current.updateWordSelection(wordIds)
    })

    expect(result.current.wordSelection.wordIds.size).toBe(2)
    expect(result.current.wordSelection.selectedWords).toHaveLength(2)
    expect(result.current.wordSelection.selectedText).toBe('Hello World')
  })

  it('sorts words in reading order', () => {
    const { result } = renderHook(() => useOCRSelection(mockOCRData))

    act(() => {
      // Select words from different lines in random order
      const wordIds = new Set([5, 2, 1, 3]) // test, World, Hello, This
      result.current.updateWordSelection(wordIds)
    })

    const selectedText = result.current.wordSelection.selectedText
    // Should be sorted by line first, then by position within line
    expect(selectedText).toBe('Hello World This test')
  })

  it('clears selection', () => {
    const { result } = renderHook(() => useOCRSelection(mockOCRData))

    // First select some words
    act(() => {
      const wordIds = new Set([1, 2])
      result.current.updateWordSelection(wordIds)
    })

    expect(result.current.wordSelection.selectedWords).toHaveLength(2)

    // Then clear selection
    act(() => {
      result.current.clearSelection()
    })

    expect(result.current.wordSelection.wordIds.size).toBe(0)
    expect(result.current.wordSelection.selectedWords).toEqual([])
    expect(result.current.wordSelection.selectedText).toBe('')
  })

  it('gets words between two words correctly', () => {
    const { result } = renderHook(() => useOCRSelection(mockOCRData))

    const startWord = mockWords[0] // Hello
    const endWord = mockWords[4]   // test

    const wordsBetween = result.current.getWordsBetween(startWord, endWord)

    expect(wordsBetween).toHaveLength(5) // All words from Hello to test
    expect(wordsBetween[0].text).toBe('Hello')
    expect(wordsBetween[4].text).toBe('test')
  })

  it('handles reverse selection in getWordsBetween', () => {
    const { result } = renderHook(() => useOCRSelection(mockOCRData))

    const startWord = mockWords[4] // test (later word)
    const endWord = mockWords[0]   // Hello (earlier word)

    const wordsBetween = result.current.getWordsBetween(startWord, endWord)

    expect(wordsBetween).toHaveLength(5) // All words from Hello to test
    expect(wordsBetween[0].text).toBe('Hello')
    expect(wordsBetween[4].text).toBe('test')
  })

  it('returns result object from updateWordSelection', () => {
    const { result } = renderHook(() => useOCRSelection(mockOCRData))

    let updateResult: { orderedWords: Array<{ wordId: number; text: string; }>; selectedText: string } | undefined
    act(() => {
      const wordIds = new Set([1, 2])
      updateResult = result.current.updateWordSelection(wordIds)
    })

    expect(updateResult).toHaveProperty('orderedWords')
    expect(updateResult).toHaveProperty('selectedText')
    expect(updateResult!.orderedWords).toHaveLength(2)
    expect(updateResult!.selectedText).toBe('Hello World')
  })

  it('handles null OCR data gracefully', () => {
    const { result } = renderHook(() => useOCRSelection(null))

    act(() => {
      const wordIds = new Set([1, 2])
      result.current.updateWordSelection(wordIds)
    })

    expect(result.current.wordSelection.wordIds.size).toBe(0)
    expect(result.current.wordSelection.selectedWords).toEqual([])
    expect(result.current.wordSelection.selectedText).toBe('')
  })

  it('handles empty word selection', () => {
    const { result } = renderHook(() => useOCRSelection(mockOCRData))

    act(() => {
      const wordIds = new Set<number>()
      result.current.updateWordSelection(wordIds)
    })

    expect(result.current.wordSelection.selectedText).toBe('')
    expect(result.current.wordSelection.selectedWords).toEqual([])
  })
})