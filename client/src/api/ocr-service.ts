import { apiClient } from './axios-config';
import type { EnhancedOCRResponse } from '../types/ocr-types';

interface OCRUploadOptions {
  file: File;
  onUploadProgress?: (progressEvent: any) => void;
}

interface APIResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

class OCRService {
  private readonly endpoint = '/ocr/upload-enhanced';

  async uploadForOCR({ file, onUploadProgress }: OCRUploadOptions): Promise<EnhancedOCRResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<APIResponse<EnhancedOCRResponse>>(
      this.endpoint,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );

    // handle the new response format
    if (!response.data.success) {
      throw new Error(response.data.message || 'OCR processing failed');
    }

    if (!response.data.data) {
      throw new Error('No data returned from OCR processing');
    }

    return response.data.data;
  }

  async uploadForOCRWithRetry({ file, onUploadProgress }: OCRUploadOptions, retries = 2): Promise<EnhancedOCRResponse> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await this.uploadForOCR({ file, onUploadProgress });
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          // wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`[OCR Service] Retry attempt ${attempt + 1} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

// create and export singleton instance
export const ocrService = new OCRService();

// export types
export type { OCRUploadOptions };