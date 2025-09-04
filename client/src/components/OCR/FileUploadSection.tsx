import React from "react";

interface FileUploadSectionProps {
  isDragOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  isDragOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
}) => {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      style={{
        border: `3px dashed ${isDragOver ? '#007bff' : '#dee2e6'}`,
        borderRadius: "12px",
        padding: "60px 40px",
        textAlign: "center",
        backgroundColor: isDragOver ? '#f8f9fa' : '#ffffff',
        transition: "all 0.3s ease",
        cursor: "pointer",
        marginBottom: "24px",
        boxShadow: isDragOver ? "0 8px 32px rgba(0, 123, 255, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.1)",
        transform: isDragOver ? "translateY(-2px)" : "translateY(0)",
        position: "relative",
        overflow: "hidden"
      }}
      onClick={() => document.getElementById('file-input')?.click()}
    >
      <input
        id="file-input"
        data-testid="file-input"
        type="file"
        onChange={onFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />

      <div style={{
        margin: "0 auto 16px auto",
        color: isDragOver ? '#007bff' : '#6c757d',
        marginBottom: "16px",
        transition: "color 0.3s ease"
      }}
        className="document-upload-icon">
        <svg className="w-[96px] h-[96px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path fillRule="evenodd" d="M9 2.221V7H4.221a2 2 0 0 1 .365-.5L8.5 2.586A2 2 0 0 1 9 2.22ZM11 2v5a2 2 0 0 1-2 2H4v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-7Zm.394 9.553a1 1 0 0 0-1.817.062l-2.5 6A1 1 0 0 0 8 19h8a1 1 0 0 0 .894-1.447l-2-4A1 1 0 0 0 13.2 13.4l-.53.706-1.276-2.553ZM13 9.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" clipRule="evenodd" />
        </svg>
      </div>

      <h3 style={{
        margin: "0 0 12px 0",
        color: "#495057",
        fontSize: "24px",
        fontWeight: "600"
      }}>
        {isDragOver ? "Drop your image here" : "Upload Document for OCR"}
      </h3>

      <p style={{
        margin: "0 0 24px 0",
        color: "#6c757d",
        fontSize: "16px",
        lineHeight: "1.5"
      }}>
        {isDragOver
          ? "Release to upload your image file"
          : "Drag and drop an image file here, or click to browse"
        }
      </p>

      <div style={{
        display: "inline-block",
        padding: "12px 24px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 4px 12px rgba(0, 123, 255, 0.3)"
      }}>
        Choose File
      </div>
    </div>
  );
};