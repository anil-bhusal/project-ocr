import React, { Suspense } from "react";
import type { OCRWord, EnhancedOCRResponse } from "../../types/ocr-types";
import { LoadingFallback } from "../LoadingFallback";
import { WordOverlay } from "./WordOverlay";
import { FloatingInput } from "./FloatingInput";
import { ZoomControls } from "./ZoomControls";

interface ImageViewerProps {
  imageUrl: string;
  ocrData: EnhancedOCRResponse;
  zoomLevel: number;
  isDragging: boolean;
  isTextSelecting: boolean;
  hoveredWordId: number | null;
  wordSelection: {
    wordIds: Set<number>;
    selectedWords: OCRWord[];
    selectedText: string;
  };
  showFloatingInput: boolean;
  floatingInputPosition: { x: number; y: number };
  containerRef: React.RefObject<HTMLDivElement>;
  imageRef: React.RefObject<HTMLImageElement>;
  selectionBoxRef: React.RefObject<HTMLDivElement>;
  onMouseDown: (event: React.MouseEvent) => void;
  onWordClick: (word: OCRWord, event: React.MouseEvent) => void;
  onWordHover: (wordId: number | null) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onClearSelection: () => void;
  setHoveredWordId: (id: number | null) => void;
  setShowFloatingInput: (show: boolean) => void;
  setWordSelection: (selection: any) => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  ocrData,
  zoomLevel,
  isDragging,
  isTextSelecting,
  hoveredWordId,
  wordSelection,
  showFloatingInput,
  floatingInputPosition,
  containerRef,
  imageRef,
  selectionBoxRef,
  onMouseDown,
  onWordClick,
  onWordHover,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onClearSelection,
  setHoveredWordId,
  setShowFloatingInput,
  setWordSelection,
}) => {
  // debugger;
  
  // console.log("imageUrl ---------->", imageUrl);
  // console.log("ocrData ---------->", ocrData);
  console.log("isDragging ---------->", isDragging);
  console.log("isTextSelecting ---------->", isTextSelecting);
  console.log("floatingInputPosition ---------->", floatingInputPosition);

  return (
    <div style={{ width: "80%" }}>
      <div
        ref={containerRef}
        style={{
          position: "relative",
          border: "1px solid #ccc",
          overflow: "auto",
          height: "100%",
          userSelect: "none",
          cursor: isTextSelecting ? "text" : (isDragging ? "crosshair" : "text"),
          background: "#f5f5f5",
          padding: "20px"
        }}
      >
        <div
          style={{
            position: "relative",
            display: "inline-block",
            transform: `scale(${zoomLevel})`,
            transformOrigin: "top left",
            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            minWidth: "100%",
            minHeight: "100%"
          }}
          onMouseDown={onMouseDown}
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="uploaded"
            style={{
              display: "block",
              maxWidth: "100%",
              height: "auto"
            }}
            onLoad={() => {
              if (ocrData) {
                setHoveredWordId(-999);
                setTimeout(() => setHoveredWordId(null), 50);
              }
            }}
          />

          <Suspense fallback={<LoadingFallback name="Word Overlays" size="small" />}>
            {ocrData.words.map((word) => (
              <WordOverlay
                key={`word-${word.wordId}-${wordSelection.wordIds.has(word.wordId)}`}
                word={word}
                isSelected={wordSelection.wordIds.has(word.wordId)}
                isHovered={hoveredWordId === word.wordId}
                scaleX={imageRef.current ? imageRef.current.offsetWidth / imageRef.current.naturalWidth : 1}
                scaleY={imageRef.current ? imageRef.current.offsetHeight / imageRef.current.naturalHeight : 1}
                onClick={(e) => onWordClick(word, e)}
                onMouseEnter={() => onWordHover(word.wordId)}
                onMouseLeave={() => onWordHover(null)}
              />
            ))}
          </Suspense>

          {showFloatingInput && (
            <Suspense fallback={<LoadingFallback name="Floating Input" size="small" />}>
              <FloatingInput
                position={floatingInputPosition}
                wordSelection={wordSelection}
                onTextChange={(text) => setWordSelection((prev: any) => ({ ...prev, selectedText: text }))}
                onClear={() => {
                  onClearSelection();
                  setShowFloatingInput(false);
                }}
              />
            </Suspense>
          )}

          <div
            ref={selectionBoxRef}
            style={{
              position: 'absolute',
              display: 'none',
              border: '2px solid #007bff',
              backgroundColor: 'rgba(0, 123, 255, 0.1)',
              pointerEvents: 'none',
              zIndex: 1000,
              borderRadius: '3px',
              boxShadow: '0 2px 8px rgba(0, 123, 255, 0.25)',
            }}
          />
        </div>

        <Suspense fallback={<LoadingFallback name="Zoom Controls" size="small" />}>
          <ZoomControls
            zoomLevel={zoomLevel}
            onZoomIn={() => {
              onZoomIn();
              if (showFloatingInput) {
                setShowFloatingInput(false);
                setTimeout(() => {
                  if (wordSelection.selectedWords.length > 0) {
                    setShowFloatingInput(true);
                  }
                }, 300);
              }
            }}
            onZoomOut={() => {
              onZoomOut();
              if (showFloatingInput) {
                setShowFloatingInput(false);
                setTimeout(() => {
                  if (wordSelection.selectedWords.length > 0) {
                    setShowFloatingInput(true);
                  }
                }, 300);
              }
            }}
            onZoomReset={() => {
              onZoomReset();
              if (showFloatingInput) {
                setShowFloatingInput(false);
                setTimeout(() => {
                  if (wordSelection.selectedWords.length > 0) {
                    setShowFloatingInput(true);
                  }
                }, 300);
              }
            }}
          />
        </Suspense>
      </div>
    </div>
  );
};