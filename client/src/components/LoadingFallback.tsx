import React from 'react';

interface LoadingFallbackProps {
  name?: string;
  size?: 'small' | 'medium' | 'large';
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  name = "Component", 
  size = "medium" 
}) => {
  const sizeMap = {
    small: { width: 16, height: 16, fontSize: '10px' },
    medium: { width: 20, height: 20, fontSize: '12px' },
    large: { width: 24, height: 24, fontSize: '14px' }
  };

  const { width, height, fontSize } = sizeMap[size];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      color: '#666',
      fontSize,
      fontFamily: 'system-ui, sans-serif'
    }}>
      <div
        style={{
          width,
          height,
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginRight: '8px'
        }}
      />
      Loading {name}...
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};