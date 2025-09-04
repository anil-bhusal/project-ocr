import { useState, useCallback } from 'react';
import type { OCRWord, WordSelection, EnhancedOCRResponse } from '../types/ocr-types';

// Custom hook for managing OCR word selection logic
export const useOCRSelection = (ocrData: EnhancedOCRResponse | null) => {
  //debugger;

  const [wordSelection, setWordSelection] = useState<WordSelection>({
    wordIds: new Set(),
    selectedWords: [],
    selectedText: ""
  });

  const getWordsInReadingOrder = useCallback((words: OCRWord[]) => {
    return words.sort((a, b) => {
      // first sort by line (top to bottom)
      if (a.lineId !== b.lineId) return a.lineId - b.lineId;
      // then sort by position within line (left to right)
      return a.left - b.left;
    });
  }, []);

  const getWordsBetween = useCallback((startWord: OCRWord, endWord: OCRWord): OCRWord[] => {
    if (!ocrData) return [];

    const allWords = getWordsInReadingOrder(ocrData.words);
    const startIndex = allWords.findIndex(w => w.wordId === startWord.wordId);
    const endIndex = allWords.findIndex(w => w.wordId === endWord.wordId);

    if (startIndex === -1 || endIndex === -1) return [];

    const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
    return allWords.slice(min, max + 1);
  }, [ocrData, getWordsInReadingOrder]);

  const updateWordSelection = useCallback((wordIds: Set<number>) => {
    if (!ocrData) return;

    const selectedWords = ocrData.words.filter(w => wordIds.has(w.wordId));
    const orderedWords = getWordsInReadingOrder(selectedWords);
    const selectedText = orderedWords.map(w => w.text).join(' ');

    setWordSelection({
      wordIds,
      selectedWords: orderedWords,
      selectedText
    });

    return { orderedWords, selectedText };
  }, [ocrData, getWordsInReadingOrder]);

  const clearSelection = useCallback(() => {
    setWordSelection({
      wordIds: new Set(),
      selectedWords: [],
      selectedText: ""
    });
  }, []);

  return {
    wordSelection,
    setWordSelection,
    updateWordSelection,
    clearSelection,
    getWordsInReadingOrder,
    getWordsBetween
  };
};