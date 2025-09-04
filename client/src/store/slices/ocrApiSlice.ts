import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { EnhancedOCRResponse } from '../../types/ocr-types';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface OCRApiState {
  // api data state
  currentOCRData: EnhancedOCRResponse | null;
  lastProcessedFile: string | null;
  
  // api status state
  isProcessing: boolean;
  lastError: ApiError | null;
  
  // api history (for potential future features)
  uploadHistory: Array<{
    id: string;
    fileName: string;
    timestamp: number;
    status: 'success' | 'error';
    wordCount?: number;
  }>;
}

const initialState: OCRApiState = {
  // api data state
  currentOCRData: null,
  lastProcessedFile: null,
  
  // api status state
  isProcessing: false,
  lastError: null,
  
  // api history
  uploadHistory: [],
};

const ocrApiSlice = createSlice({
  name: 'ocrApi',
  initialState,
  reducers: {
    // api data actions
    setOCRData: (state, action: PayloadAction<EnhancedOCRResponse>) => {
      state.currentOCRData = action.payload;
      state.lastError = null;
    },
    
    clearOCRData: (state) => {
      state.currentOCRData = null;
      state.lastProcessedFile = null;
    },
    
    // api status actions
    setProcessingStatus: (state, action: PayloadAction<boolean>) => {
      state.isProcessing = action.payload;
      if (action.payload) {
        state.lastError = null;
      }
    },
    
    setApiError: (state, action: PayloadAction<ApiError>) => {
      state.lastError = action.payload;
      state.isProcessing = false;
    },
    
    clearApiError: (state) => {
      state.lastError = null;
    },
    
    // file processing actions
    setLastProcessedFile: (state, action: PayloadAction<string>) => {
      state.lastProcessedFile = action.payload;
    },
    
    // history actions
    addToUploadHistory: (state, action: PayloadAction<{
      fileName: string;
      status: 'success' | 'error';
      wordCount?: number;
    }>) => {
      const historyEntry = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        ...action.payload,
      };
      
      state.uploadHistory.unshift(historyEntry);
      
      // keep only last 10 entries
      if (state.uploadHistory.length > 10) {
        state.uploadHistory = state.uploadHistory.slice(0, 10);
      }
    },
    
    clearUploadHistory: (state) => {
      state.uploadHistory = [];
    },
  },
});

export const {
  setOCRData,
  clearOCRData,
  setProcessingStatus,
  setApiError,
  clearApiError,
  setLastProcessedFile,
  addToUploadHistory,
  clearUploadHistory,
} = ocrApiSlice.actions;

export default ocrApiSlice.reducer;

// exporting types
export type { OCRApiState, ApiError };