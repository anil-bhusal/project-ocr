import React from 'react';
import type { WordSelection } from '../../types/ocr-types';

interface TextPanelProps {
  wordSelection: WordSelection;
  onTextChange: (text: string) => void;
}

// side text-area for displaying selected text
export const TextPanel: React.FC<TextPanelProps> = ({ wordSelection, onTextChange }) => {
  // debugger;

  // console.log("wordSelection -------------------------------------->", wordSelection);

  return (
    <div style={{ width: "20%" }}>
      <div style={{ height: "100%" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
          Selected Text
        </h3>

        <div style={{ marginBottom: "8px", fontSize: "11px", color: "#666" }}>
          {wordSelection.selectedWords.length > 0
            ? `${wordSelection.selectedWords.length} words selected`
            : "Select text from image"}
        </div>

        <textarea
          value={wordSelection.selectedText}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder="Selected text appears here..."
          style={{
            width: "100%",
            height: "calc(100% - 60px)",
            padding: "8px",
            fontSize: "12px",
            fontFamily: "monospace",
            border: "1px solid #ccc",
            borderRadius: "4px",
            resize: "none"
          }}
        />
      </div>
    </div>
  );
};