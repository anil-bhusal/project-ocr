import { useRef, useCallback, useMemo, useEffect } from "react";
import throttle from "lodash.throttle";
import type { OCRWord, EnhancedOCRResponse } from "../types/ocr-types";
import { OCR_CONFIG } from "../constants/ocr.constants";

interface MouseSelectionProps {
  ocrData: EnhancedOCRResponse | null;
  imageRef: React.RefObject<HTMLImageElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  selectionBoxRef: React.RefObject<HTMLDivElement>;
  wordSelection: {
    wordIds: Set<number>;
    selectedWords: OCRWord[];
    selectedText: string;
  };
  isTextSelecting: boolean;
  textSelectionStart: { wordId: number; position: { x: number; y: number } } | null;
  getWordsBetween: (startWord: OCRWord, endWord: OCRWord) => OCRWord[];
  handleUpdateWordSelection: (wordIds: Set<number>) => void;
  setIsTextSelecting: (value: boolean) => void;
  setTextSelectionStart: (value: { wordId: number; position: { x: number; y: number } } | null) => void;
  setIsDragging: (value: boolean) => void;
  zoomLevel: number;
}

export const useMouseSelection = ({
  ocrData,
  imageRef,
  containerRef,
  selectionBoxRef,
  wordSelection: _wordSelection,
  isTextSelecting,
  textSelectionStart,
  getWordsBetween,
  handleUpdateWordSelection,
  setIsTextSelecting,
  setTextSelectionStart,
  setIsDragging,
  zoomLevel,
}: MouseSelectionProps) => {
  // animation frame for smooth selection box updates
  const rafRef = useRef<number>(0);
  
  // track drag state without triggering rerenders
  const dragStateRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  });

  // convert mouse position to image coordinates
  const getImageCoordinates = useCallback((clientX: number, clientY: number): { x: number, y: number } | null => {
    if (!imageRef.current || !containerRef.current) return null;

    const imgRect = imageRef.current.getBoundingClientRect();
    const img = imageRef.current;

    // get image scaling info
    const actualWidth = img.offsetWidth;
    const actualHeight = img.offsetHeight;
    const scaledWidth = imgRect.width;
    const currentScale = scaledWidth / actualWidth;

    // convert client coords to image coords
    const scaledX = clientX - imgRect.left;
    const scaledY = clientY - imgRect.top;

    const x = scaledX / currentScale;
    const y = scaledY / currentScale;

    // clamp to image bounds
    return {
      x: Math.max(0, Math.min(x, actualWidth)),
      y: Math.max(0, Math.min(y, actualHeight))
    };
  }, [zoomLevel]);

  // find which word is at the given coordinates
  const findWordAtPosition = useCallback((x: number, y: number): OCRWord | null => {
    if (!ocrData || !imageRef.current) return null;

    const img = imageRef.current;
    const scaleX = img.offsetWidth / img.naturalWidth;
    const scaleY = img.offsetHeight / img.naturalHeight;

    // check each word's bounding box
    return ocrData.words.find(word => {
      const wordLeft = word.left * scaleX;
      const wordTop = word.top * scaleY;
      const wordRight = wordLeft + (word.width * scaleX);
      const wordBottom = wordTop + (word.height * scaleY);

      return x >= wordLeft && x <= wordRight &&
        y >= wordTop && y <= wordBottom;
    }) || null;
  }, [ocrData]);

  const handleMouseDown = useCallback((event: React.MouseEvent) => {
    if (!imageRef.current) return;

    const coords = getImageCoordinates(event.clientX, event.clientY);
    if (!coords) return;

    const { x, y } = coords;
    const wordAtPosition = findWordAtPosition(x, y);

    if (wordAtPosition) {
      // clicked on a word - start text selection
      setIsTextSelecting(true);
      setTextSelectionStart({
        wordId: wordAtPosition.wordId,
        position: { x, y }
      });
      handleUpdateWordSelection(new Set([wordAtPosition.wordId]));
    } else {
      // clicked on empty space - start drag selection
      dragStateRef.current = {
        isDragging: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y
      };
      setIsDragging(true);
    }

    event.preventDefault();
  }, [findWordAtPosition, handleUpdateWordSelection, getImageCoordinates, setIsTextSelecting, setTextSelectionStart, setIsDragging]);

  // update selection box position and size during drag
  const updateSelectionBox = useCallback(() => {
    if (!dragStateRef.current.isDragging || !selectionBoxRef.current) return;

    const { startX, startY, currentX, currentY } = dragStateRef.current;
    const selectionBox = selectionBoxRef.current;

    // calculate selection box bounds
    Object.assign(selectionBox.style, {
      left: `${Math.min(startX, currentX)}px`,
      top: `${Math.min(startY, currentY)}px`,
      width: `${Math.abs(currentX - startX)}px`,
      height: `${Math.abs(currentY - startY)}px`,
      display: 'block'
    });
  }, []);

  // throttled mouse move handler to avoid performance issues
  const handleMouseMoveThrottled = useMemo(() => throttle((event: MouseEvent) => {
    if (!imageRef.current) return;

    const coords = getImageCoordinates(event.clientX, event.clientY);
    if (!coords) return;

    const { x, y } = coords;

    if (isTextSelecting && textSelectionStart) {
      // extending word selection
      const currentWord = findWordAtPosition(x, y);
      if (currentWord) {
        const startWord = ocrData?.words.find(w => w.wordId === textSelectionStart.wordId);
        if (startWord) {
          const wordsToSelect = getWordsBetween(startWord, currentWord);
          handleUpdateWordSelection(new Set(wordsToSelect.map(w => w.wordId)));
        }
      }
    } else if (dragStateRef.current.isDragging) {
      // updating drag selection box
      dragStateRef.current.currentX = x;
      dragStateRef.current.currentY = y;

      // use raf for smooth updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      rafRef.current = requestAnimationFrame(updateSelectionBox);
    }
  }, OCR_CONFIG.THROTTLE_DELAY),
    [updateSelectionBox, isTextSelecting, textSelectionStart, findWordAtPosition, getWordsBetween, ocrData, handleUpdateWordSelection, getImageCoordinates]
  );

  const handleMouseUp = useCallback(() => {
    if (isTextSelecting) {
      // finish text selection
      setIsTextSelecting(false);
      setTextSelectionStart(null);
    } else if (dragStateRef.current.isDragging && ocrData && imageRef.current && selectionBoxRef.current) {
      // finish drag selection - find words in selection area
      const img = imageRef.current;
      const scaleX = img.offsetWidth / img.naturalWidth;
      const scaleY = img.offsetHeight / img.naturalHeight;

      const { startX, startY, currentX, currentY } = dragStateRef.current;
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const width = Math.abs(currentX - startX);
      const height = Math.abs(currentY - startY);

      // only process if drag was big enough
      if (width > OCR_CONFIG.MIN_DRAG_DISTANCE && height > OCR_CONFIG.MIN_DRAG_DISTANCE) {
        const selectedWordIds = new Set<number>();

        // check each word for overlap with selection box
        ocrData.words.forEach(word => {
          const wordLeft = word.left * scaleX;
          const wordTop = word.top * scaleY;
          const wordRight = wordLeft + (word.width * scaleX);
          const wordBottom = wordTop + (word.height * scaleY);

          // rectangle intersection check
          if (!(wordRight < left || wordLeft > left + width ||
            wordBottom < top || wordTop > top + height)) {
            selectedWordIds.add(word.wordId);
          }
        });

        handleUpdateWordSelection(selectedWordIds);
      }

      // cleanup drag state
      dragStateRef.current.isDragging = false;
      selectionBoxRef.current.style.display = 'none';
      setIsDragging(false);
    }

    // cleanup animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, [isTextSelecting, ocrData, handleUpdateWordSelection, setIsTextSelecting, setTextSelectionStart, setIsDragging]);

  // setup global event listeners for drag/selection
  useEffect(() => {
    const handleGlobalMouseMove = (event: MouseEvent) => {
      if (dragStateRef.current.isDragging || isTextSelecting) {
        handleMouseMoveThrottled(event);
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragStateRef.current.isDragging || isTextSelecting) {
        handleMouseUp();
      }
    };

    // cancel selection on viewport changes
    const handleViewportChange = () => {
      if (dragStateRef.current.isDragging || isTextSelecting) {
        handleMouseUp();
      }
    };

    // attach listeners
    document.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    document.addEventListener('mouseup', handleGlobalMouseUp);
    window.addEventListener('scroll', handleViewportChange, { passive: true });
    window.addEventListener('resize', handleViewportChange, { passive: true });

    // cleanup on unmount
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      window.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('resize', handleViewportChange);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [handleMouseMoveThrottled, handleMouseUp, isTextSelecting]);

  return {
    handleMouseDown,
    handleMouseUp,
    findWordAtPosition,
    dragStateRef,
  };
};