import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ocrService } from '../ocr-service'
import { apiClient } from '../axios-config'

// Mock axios
vi.mock('../axios-config', () => ({
  apiClient: {
    post: vi.fn()
  }
}))

describe('OCRService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should be defined', () => {
    expect(ocrService).toBeDefined()
  })

  it('should have uploadForOCR method', () => {
    expect(typeof ocrService.uploadForOCR).toBe('function')
  })

  it('should have uploadForOCRWithRetry method', () => {
    expect(typeof ocrService.uploadForOCRWithRetry).toBe('function')
  })

  it('should create FormData with file', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' })
    const mockResponse = {
      data: {
        statusCode: 200,
        success: true,
        message: 'OCR processing completed successfully',
        data: { words: [] }
      }
    }
    
    vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse)
    
    await ocrService.uploadForOCR({ file: mockFile })
    
    expect(apiClient.post).toHaveBeenCalledWith(
      '/ocr/upload-enhanced',
      expect.any(FormData),
      expect.objectContaining({
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    )
  })
})