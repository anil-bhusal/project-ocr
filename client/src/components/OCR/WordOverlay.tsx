import React from 'react';
import type { OCRWord } from '../../types/ocr-types';

interface WordOverlayProps {
  word: OCRWord;
  isSelected: boolean;
  isHovered: boolean;
  scaleX: number;
  scaleY: number;
  onClick: (event: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// individual word overlay component
export const WordOverlay: React.FC<WordOverlayProps> = ({ word, isSelected, isHovered, scaleX, scaleY, onClick, onMouseEnter, onMouseLeave }) => {
  // debugger;
  const getStyle = (): React.CSSProperties => {
    let borderColor = 'transparent';
    let backgroundColor = 'transparent';
    let zIndex = 2;
    let boxShadow = 'none';
    let transform = 'scale(1)';
    let borderWidth = '2px';

    if (isSelected && isHovered) {
      // selected and hovered .... strongest highlight
      borderColor = '#28a745';
      backgroundColor = 'rgba(40, 167, 69, 0.35)';
      boxShadow = '0 0 12px rgba(40, 167, 69, 0.5), 0 2px 8px rgba(0, 0, 0, 0.2)';
      transform = 'scale(1.02)';
      zIndex = 5;
    } else if (isSelected) {
      // selected only
      borderColor = '#28a745';
      backgroundColor = 'rgba(40, 167, 69, 0.25)';
      boxShadow = '0 0 8px rgba(40, 167, 69, 0.3)';
      zIndex = 4;
    } else if (isHovered) {
      // hovered only .... more prominent highlighting
      borderColor = '#007bff';
      backgroundColor = 'rgba(0, 123, 255, 0.15)';
      boxShadow = '0 0 10px rgba(0, 123, 255, 0.4), 0 2px 4px rgba(0, 0, 0, 0.1)';
      transform = 'scale(1.01)';
      borderWidth = '1px';
      zIndex = 3;
    }

    return {
      position: 'absolute',
      left: word.left * scaleX,
      top: word.top * scaleY,
      width: word.width * scaleX,
      height: word.height * scaleY,
      border: (isSelected || isHovered) ? `${borderWidth} solid ${borderColor}` : 'none',
      backgroundColor,
      cursor: 'pointer',
      zIndex,
      pointerEvents: 'auto',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      borderRadius: '3px',
      boxShadow,
      transform,
      transformOrigin: 'center',
      // add subtle animation on hover
      animation: isHovered && !isSelected ? 'pulse 1.5s infinite' : 'none'
    };
  };

  return (
    <>
      <div
        className={`word-overlay smooth-transition ${isSelected ? 'selected' : ''} ${isHovered ? 'hovered' : ''}`}
        style={getStyle()}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        title={`${word.text} (Line: ${word.lineId}, Confidence: ${Math.round((word.confidence || 0) * 100)}%)`}
        data-word={word.text}
      />
      {/* tooltip on hover */}
      {isHovered && !isSelected && (
        <div
          style={{
            position: 'absolute',
            left: word.left * scaleX,
            top: (word.top * scaleY) - 25,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500',
            zIndex: 1000,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.2s ease-in-out'
          }}
        >
          {word.text}
        </div>
      )}
    </>
  );
};