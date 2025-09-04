import React, { useEffect } from 'react';

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

// zoom controls component
export const ZoomControls: React.FC<ZoomControlsProps> = ({ zoomLevel, onZoomIn, onZoomOut, onZoomReset }) => {
  // debugger;
  
  // keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // only trigger if no input is focused
      if (document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey)) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          onZoomIn();
        } else if (e.key === '-' || e.key === '_') {
          e.preventDefault();
          onZoomOut();
        } else if (e.key === '0') {
          e.preventDefault();
          onZoomReset();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onZoomIn, onZoomOut, onZoomReset]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '22.5%',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: 'rgba(255, 255, 255, 0.98)',
      padding: '6px 10px',
      borderRadius: '6px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 3px rgba(0, 0, 0, 0.08)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(0, 0, 0, 0.08)',
      zIndex: 1001,
      fontSize: '13px'
    }}>
      {/* zoom out nbutton */}
      <button
        onClick={onZoomOut}
        title="Zoom Out (Ctrl/Cmd + Minus)"
        style={{
          padding: "4px 8px",
          background: "transparent",
          color: "#333",
          border: "1px solid #ddd",
          borderRadius: "4px 0 0 4px",
          fontSize: "16px",
          cursor: "pointer",
          minWidth: "32px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      >
        −
      </button>

      {/* zoom level sdisplay */}
      <div style={{
        padding: "4px 12px",
        background: "white",
        border: "1px solid #ddd",
        borderLeft: "none",
        borderRight: "none",
        fontSize: "13px",
        color: "#333",
        minWidth: "60px",
        height: "28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "500",
        userSelect: "none"
      }}>
        {Math.round(zoomLevel * 100)}%
      </div>

      {/* zoom in button */}
      <button
        onClick={onZoomIn}
        title="Zoom In (Ctrl/Cmd + Plus)"
        style={{
          padding: "4px 8px",
          background: "transparent",
          color: "#333",
          border: "1px solid #ddd",
          borderRadius: "0 4px 4px 0",
          fontSize: "16px",
          cursor: "pointer",
          minWidth: "32px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      >
        +
      </button>

      {/* just to sperate */}
      <div style={{
        width: "1px",
        height: "20px",
        background: "#ddd",
        margin: "0 4px"
      }} />

      {/* fit-to-width */}
      <button
        onClick={() => onZoomReset()}
        title="Fit to Width"
        style={{
          padding: "4px 10px",
          background: "transparent",
          color: "#333",
          border: "1px solid #ddd",
          borderRadius: "4px",
          fontSize: "12px",
          cursor: "pointer",
          height: "28px",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = "#f0f0f0"}
        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
      >
        Fit Width
      </button>

      {/* info text */}
      <div style={{
        fontSize: "11px",
        color: "#666",
        marginLeft: "8px"
      }}>
        Ctrl + Scroll to zoom
      </div>
    </div>
  );
};