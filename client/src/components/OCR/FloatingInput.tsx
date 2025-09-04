import React from 'react';
import type { WordSelection } from '../../types/ocr-types';

interface FloatingInputProps {
  position: { x: number; y: number };
  wordSelection: WordSelection;
  onTextChange: (text: string) => void;
  onClear: () => void;
}

// floating input component .... appears below selected text
export const FloatingInput: React.FC<FloatingInputProps> = ({ position, wordSelection, onTextChange, onClear }) => {
  // debugger;
  return (
    <>
      {/* arrow pointing up to selection  */}
      <div
        style={{
          position: 'absolute',
          left: position.x + 150 - 8,
          top: position.y - 8,
          width: 0,
          height: 0,
          borderLeft: '8px solid transparent',
          borderRight: '8px solid transparent',
          borderBottom: '8px solid #007bff',
          zIndex: 999999,
          animation: 'floatingInputFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transition: 'left 0.15s ease-out, top 0.15s ease-out'
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: position.x,
          top: position.y,
          zIndex: 999999,
          transition: 'left 0.15s ease-out, top 0.15s ease-out',
          padding: '0',
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          border: '2px solid #007bff',
          borderRadius: '8px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24), 0 4px 16px rgba(0, 123, 255, 0.4)',
          backdropFilter: 'blur(20px)',
          minWidth: Math.max(150, Math.min(wordSelection.selectedText.length * 8 + 60, 500)) + 'px',
          maxWidth: '500px',
          pointerEvents: 'auto',
          animation: 'floatingInputFadeIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'top center',
          willChange: 'transform, opacity',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <button
          onClick={onClear}
          style={{
            background: 'none',
            border: 'none',
            color: '#666',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '8px 6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '24px',
            height: '100%',
            borderRadius: '6px 0 0 6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
            e.currentTarget.style.color = '#dc3545';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
          title="Clear selection"
        >
          ×
        </button>

        <input
          type="text"
          value={wordSelection.selectedText}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation();
            if (e.key === 'Enter') {
              console.log('Edited text:', wordSelection.selectedText);
            }
          }}
          style={{
            flex: 1,
            padding: '8px 12px 8px 6px',
            fontSize: '14px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#333',
            outline: 'none',
            cursor: 'text',
            borderRadius: '0 6px 6px 0'
          }}
          placeholder="Selected text appears here..."
          autoFocus
        />
      </div>
    </>
  );
};