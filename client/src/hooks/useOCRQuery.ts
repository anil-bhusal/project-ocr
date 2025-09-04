import { useMutation } from '@tanstack/react-query';
import { ocrService } from '../api/ocr-service';
import type { EnhancedOCRResponse } from '../types/ocr-types';
import type { OCRUploadOptions } from '../api/ocr-service';

interface UseOCRMutationOptions {
  onSuccess?: (data: EnhancedOCRResponse) => void;
  onError?: (error: any) => void;
  onSettled?: () => void;
}

export const useOCRMutation = (options?: UseOCRMutationOptions) => {
  return useMutation({
    mutationFn: ({ file, onUploadProgress }: OCRUploadOptions) =>
      ocrService.uploadForOCRWithRetry({ file, onUploadProgress }),
    onSuccess: (data) => {
      console.log('[OCR Query] Upload successful');
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error('[OCR Query] Upload failed:', error);
      options?.onError?.(error);
    },
    onSettled: () => {
      console.log('[OCR Query] Upload operation completed');
      options?.onSettled?.();
    },
    // retry configuration specific to this mutation
    retry: (failureCount, error: any) => {
      // don't retry client errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // retry up to 2 times for server/network errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => {
      // exponential backoff: 1s, 2s, 4s
      return Math.min(1000 * Math.pow(2, attemptIndex), 10000);
    },
  });
};