import React from "react";

interface UploadStatusBarProps {
  isProcessing: boolean;
  hasOcrData: boolean;
  onUploadNew: () => void;
  onClearSelection: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadStatusBar: React.FC<UploadStatusBarProps> = ({
  isProcessing,
  hasOcrData,
  onUploadNew,
  onClearSelection,
  onFileChange,
}) => {
  return (
    <div style={{
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "16px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      border: "1px solid #e9ecef"
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        flex: 1
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          backgroundColor: "#28a745",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontSize: "18px"
        }}
          className="upload-success-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
            <g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
            <g id="SVGRepo_iconCarrier">
              <path d="M4 12.6111L8.92308 17.5L20 6.5" stroke="#ffffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </g>
          </svg>
        </div>
        <div>
          <div style={{
            fontSize: "16px",
            fontWeight: "500",
            color: "#495057",
            marginBottom: "4px"
          }}>
            Document uploaded successfully
          </div>
          <div style={{
            fontSize: "14px",
            color: "#6c757d"
          }}>
            Ready for OCR processing and text extraction
          </div>
        </div>
      </div>

      {isProcessing && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 20px",
          backgroundColor: "#e3f2fd",
          borderRadius: "8px",
          fontSize: "14px",
          color: "#1565c0",
          fontWeight: "500"
        }}>
          <div className="spinner" style={{ width: "16px", height: "16px" }}></div>
          Processing OCR...
        </div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={onUploadNew}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "14px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#0056b3"}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#007bff"}
        >
          Upload New
        </button>

        {hasOcrData && (
          <button
            onClick={onClearSelection}
            style={{
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "8px 16px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c82333"}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#dc3545"}
          >
            Clear Word(s) Selection
          </button>
        )}
      </div>

      <input
        id="file-input"
        data-testid="file-input"
        type="file"
        onChange={onFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
    </div>
  );
};