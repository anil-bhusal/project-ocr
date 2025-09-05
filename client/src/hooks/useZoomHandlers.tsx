import { useEffect, useCallback } from "react";
import { OCR_CONFIG } from "../constants/ocr.constants";

interface UseZoomHandlersProps {
  containerRef: React.RefObject<HTMLDivElement>;
  showFloatingInput: boolean;
  wordSelectionLength: number;
  setZoomLevel: React.Dispatch<React.SetStateAction<number>>;
  setShowFloatingInput: (value: boolean) => void;
}

export const useZoomHandlers = ({ containerRef, showFloatingInput, wordSelectionLength, setZoomLevel, setShowFloatingInput, }: UseZoomHandlersProps) => {
  // debugger
  
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + OCR_CONFIG.ZOOM_STEP, OCR_CONFIG.MAX_ZOOM));
  }, [setZoomLevel]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - OCR_CONFIG.ZOOM_STEP, OCR_CONFIG.MIN_ZOOM));
  }, [setZoomLevel]);

  const handleZoomReset = useCallback(() => {
    setZoomLevel(1);
  }, [setZoomLevel]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if ((e.ctrlKey || e.metaKey) && containerRef.current?.contains(e.target as Node)) {
        e.preventDefault();

        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoomLevel(prev => {
          const newZoom = Math.max(0.25, Math.min(prev + delta, 3));
          return Math.round(newZoom * 100) / 100;
        });

        if (showFloatingInput) {
          setShowFloatingInput(false);
          setTimeout(() => {
            if (wordSelectionLength > 0) {
              setShowFloatingInput(true);
            }
          }, 300);
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [showFloatingInput, wordSelectionLength, setZoomLevel, setShowFloatingInput, containerRef]);

  return {
    handleZoomIn,
    handleZoomOut,
    handleZoomReset,
  };
};