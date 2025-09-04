import React, { useState, useRef, useCallback, useMemo, useEffect, Suspense, lazy } from "react";
import debounce from "lodash.debounce";

// importing types
import type { OCRWord, EnhancedOCRResponse } from "../types/ocr-types";

// importing hooks
import { useOCRSelection } from "../hooks/useOCRSelection";
import { useOCRMutation } from "../hooks/useOCRQuery";
import { useMouseSelection } from "../hooks/useMouseSelection";
import { useZoomHandlers } from "../hooks/useZoomHandlers";

// importing components
import { FileUploadSection } from "./OCR/FileUploadSection";
import { UploadStatusBar } from "./OCR/UploadStatusBar";
import { ImageViewer } from "./OCR/ImageViewer";

// lazy-loaded components
const TextPanel = lazy(() => import("./OCR/TextPanel").then(module => ({ default: module.TextPanel })));

// loading fall - back component
import { LoadingFallback } from "./LoadingFallback";

const OCRUploader: React.FC = () => {
  // core state
  const [imageUrl, setImageUrl] = useState<string>("");
  const [ocrData, setOcrData] = useState<EnhancedOCRResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // ui state
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [hoveredWordId, setHoveredWordId] = useState<number | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // selection state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isTextSelecting, setIsTextSelecting] = useState<boolean>(false);
  const [textSelectionStart, setTextSelectionStart] = useState<{
    wordId: number;
    position: { x: number; y: number }
  } | null>(null);

  // floating input sate
  const [showFloatingInput, setShowFloatingInput] = useState<boolean>(false);
  const [floatingInputPosition, setFloatingInputPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // react-Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const selectionBoxRef = useRef<HTMLDivElement>(null);

  // custom hooks
  const { wordSelection, setWordSelection, updateWordSelection, clearSelection: clearWordSelection, getWordsBetween } = useOCRSelection(ocrData);

  // react-query mutation for OCR processing
  const ocrMutation = useOCRMutation({
    onSuccess: (data) => {
      setOcrData(data);
      // force a re-render to ensure hover events are properly attached
      setTimeout(() => {
        setHoveredWordId(null);
      }, 100);
    },
    onError: (err) => {
      console.error("OCR processing failed:", err);
      alert("OCR processing failed");
    },
    onSettled: () => {
      setIsProcessing(false);
    }
  });

  // handle file selection and trigger ocr processing
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await handleFileUpload(file);
  };

  // handle file upload (for input and drag-drop)
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setImageUrl(URL.createObjectURL(file));
    resetState();
    await processOCR(file);
  };

  // handle drag over event
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  // handle drag leave event
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  // handle drop event
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));

    if (imageFile) {
      await handleFileUpload(imageFile);
    } else {
      alert('Please drop an image file');
    }
  }, []);

  // reset all state to their  .initial values
  const resetState = useCallback(() => {
    setOcrData(null);
    clearWordSelection();
    setIsDragging(false);
    setHoveredWordId(null);
    setShowFloatingInput(false);
  }, [clearWordSelection]);

  // [process ocr on the selected file
  const processOCR = async (file: File) => {
    setIsProcessing(true);
    ocrMutation.mutate({ file });
  };

  // update floating input position based on selection
  const updateFloatingInputPosition = useCallback((orderedWords: OCRWord[]) => {
    if (!imageRef.current || !containerRef.current || orderedWords.length === 0) return;

    const img = imageRef.current;
    const scaleX = img.offsetWidth / img.naturalWidth;
    const scaleY = img.offsetHeight / img.naturalHeight;

    // get selection bounds
    const lastWord = orderedWords[orderedWords.length - 1];

    // find the bottommost word in the selection
    const bottomWord = orderedWords.reduce((bottom, word) =>
      (word.top + word.height > bottom.top + bottom.height) ? word : bottom
      , lastWord);

    // calculate selection bounds in scaled coordinates
    const selectionLeft = Math.min(...orderedWords.map(w => w.left)) * scaleX;
    const selectionRight = Math.max(...orderedWords.map(w => w.left + w.width)) * scaleX;
    const selectionWidth = selectionRight - selectionLeft;
    const selectionCenterX = (selectionLeft + selectionRight) / 2;
    const selectionBottom = (bottomWord.top + bottomWord.height) * scaleY;

    // calculate optimal input width based on selection
    const inputWidth = Math.max(200, Math.min(selectionWidth + 100, 400));

    // position the input below the selection, centered
    setFloatingInputPosition({
      x: Math.max(10, selectionCenterX - inputWidth / 2),
      y: selectionBottom + 12
    });
    setShowFloatingInput(true);
  }, [zoomLevel]); // Aadded zoomLevel dependency  here to recalculate on zoom

  // handle word selection update
  const handleUpdateWordSelection = useCallback((wordIds: Set<number>) => {
    const result = updateWordSelection(wordIds);

    if (result?.selectedText.trim()) {
      updateFloatingInputPosition(result.orderedWords);
    } else {
      setShowFloatingInput(false);
    }
  }, [updateWordSelection, updateFloatingInputPosition]);

  // custom hooks for mouse selection and zoom
  const { handleMouseDown } = useMouseSelection({
    ocrData,
    imageRef: imageRef as React.RefObject<HTMLImageElement>,
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    selectionBoxRef: selectionBoxRef as React.RefObject<HTMLDivElement>,
    wordSelection,
    isTextSelecting,
    textSelectionStart,
    getWordsBetween,
    handleUpdateWordSelection,
    setIsTextSelecting,
    setTextSelectionStart,
    setIsDragging,
    zoomLevel,
  });

  const { handleZoomIn, handleZoomOut, handleZoomReset } = useZoomHandlers({
    containerRef: containerRef as React.RefObject<HTMLDivElement>,
    showFloatingInput,
    wordSelectionLength: wordSelection.selectedWords.length,
    setZoomLevel,
    setShowFloatingInput,
  });

  // handle word click event
  const handleWordClick = useCallback((word: OCRWord, event: React.MouseEvent) => {
    if (isTextSelecting) return;
    event.stopPropagation();

    const newWordIds = new Set(wordSelection.wordIds);

    if (event.detail === 2) {
      // double-click: Select entire line
      ocrData?.words
        .filter(w => w.lineId === word.lineId)
        .forEach(w => newWordIds.add(w.wordId));
    } else if (event.ctrlKey || event.metaKey) {
      // multi-select with Ctrl/Cmd
      if (newWordIds.has(word.wordId)) {
        newWordIds.delete(word.wordId);
      } else {
        newWordIds.add(word.wordId);
      }
    } else if (event.shiftKey && wordSelection.selectedWords.length > 0) {
      // Shift+click: PDF-style range selection
      const lastSelected = wordSelection.selectedWords[wordSelection.selectedWords.length - 1];
      if (lastSelected) {
        getWordsBetween(lastSelected, word).forEach(w => newWordIds.add(w.wordId));
      }
    } else {
      // single select
      newWordIds.clear();
      newWordIds.add(word.wordId);
    }

    handleUpdateWordSelection(newWordIds);
  }, [wordSelection, ocrData, isTextSelecting, getWordsBetween, handleUpdateWordSelection]);

  // clear all selections
  const clearSelection = useCallback(() => {
    clearWordSelection();
    setIsDragging(false);
    setShowFloatingInput(false);
  }, [clearWordSelection]);

  // debounced position update for smoother zoom
  const debouncedPositionUpdate = useMemo(
    () => debounce((words: OCRWord[]) => {
      updateFloatingInputPosition(words);
    }, 50),
    [updateFloatingInputPosition]
  );

  // ensure hover events work after ocr data loads
  useEffect(() => {
    if (ocrData && imageRef.current) {
      // small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        // force hover state initialization
        setHoveredWordId(null);

        // dispatch a mouse move event to trigger hover detection
        if (containerRef.current) {
          const evt = new MouseEvent('mousemove', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          containerRef.current.dispatchEvent(evt);
        }
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [ocrData]);

  // recalculate floating input position when zoom changes
  useEffect(() => {
    if (showFloatingInput && wordSelection.selectedWords.length > 0) {
      // use debounced update for smoother experience
      debouncedPositionUpdate(wordSelection.selectedWords);
    }
  }, [zoomLevel, showFloatingInput, wordSelection.selectedWords, debouncedPositionUpdate]);

  // handle container scroll - hide floating input while scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;
    const handleContainerScroll = () => {
      // hide floating input during scroll
      if (showFloatingInput) {
        setShowFloatingInput(false);

        // show it again after scrolling stops
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          if (wordSelection.selectedWords.length > 0) {
            updateFloatingInputPosition(wordSelection.selectedWords);
          }
        }, 150);
      }
    };

    container.addEventListener('scroll', handleContainerScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleContainerScroll);
      clearTimeout(scrollTimeout);
    };
  }, [showFloatingInput, wordSelection.selectedWords, updateFloatingInputPosition]);


  return (
    <div style={{ padding: "20px" }}>
      {/* file upload seection */}
      {!imageUrl ? (
        <FileUploadSection
          isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onFileChange={handleFileChange}
        />
      ) : (
        <UploadStatusBar
          isProcessing={isProcessing}
          hasOcrData={!!ocrData}
          onUploadNew={() => document.getElementById('file-input')?.click()}
          onClearSelection={clearSelection}
          onFileChange={handleFileChange}
        />
      )}

      {/* main content area */}
      {imageUrl && ocrData && (
        <div style={{ display: "flex", marginTop: "20px", gap: "20px", height: "76vh" }}>
          {/* image viewer component */}
          <ImageViewer
            imageUrl={imageUrl}
            ocrData={ocrData}
            zoomLevel={zoomLevel}
            isDragging={isDragging}
            isTextSelecting={isTextSelecting}
            hoveredWordId={hoveredWordId}
            wordSelection={wordSelection}
            showFloatingInput={showFloatingInput}
            floatingInputPosition={floatingInputPosition}
            containerRef={containerRef as React.RefObject<HTMLDivElement>}
            imageRef={imageRef as React.RefObject<HTMLImageElement>}
            selectionBoxRef={selectionBoxRef as React.RefObject<HTMLDivElement>}
            onMouseDown={handleMouseDown}
            onWordClick={handleWordClick}
            onWordHover={setHoveredWordId}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onZoomReset={handleZoomReset}
            onClearSelection={clearSelection}
            setHoveredWordId={setHoveredWordId}
            setShowFloatingInput={setShowFloatingInput}
            setWordSelection={setWordSelection}
          />

          {/* text panel */}
          <Suspense fallback={<LoadingFallback name="Text Panel" size="medium" />}>
            <TextPanel
              wordSelection={wordSelection}
              onTextChange={(text) => setWordSelection(prev => ({ ...prev, selectedText: text }))}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
};

export default OCRUploader;