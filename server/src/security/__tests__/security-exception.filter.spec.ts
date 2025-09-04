import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { SecurityExceptionFilter } from '../security-exception.filter';

describe('SecurityExceptionFilter', () => {
  let filter: SecurityExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockHost: ArgumentsHost;

  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Set NODE_ENV to production for tests to avoid stack traces
    process.env.NODE_ENV = 'production';
    filter = new SecurityExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    mockRequest = {
      ip: '127.0.0.1',
      method: 'POST',
      url: '/ocr/upload',
      headers: {
        'user-agent': 'test-agent'
      }
    };

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest
      })
    } as any;

    // Mock console.log to avoid test output pollution
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalEnv;
  });

  describe('HTTP Exception handling', () => {
    it('should handle BadRequestException correctly', () => {
      const exception = new HttpException('Invalid file format', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Invalid file format',
          timestamp: expect.any(String),
          path: '/ocr/upload'
        })
      );
    });

    it('should handle complex HttpException response objects', () => {
      const exceptionResponse = {
        message: ['file is too large', 'invalid format'],
        error: 'Bad Request'
      };
      const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: ['file is too large', 'invalid format']
        })
      );
    });
  });

  describe('ThrottlerException handling', () => {
    it('should handle rate limiting violations', () => {
      const exception = new ThrottlerException();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(429);
      expect(mockResponse.json).toHaveBeenCalledWith({
        statusCode: 429,
        message: 'Too many requests, please try again later',
        timestamp: expect.any(String),
        path: '/ocr/upload'
      });
    });
  });

  describe('OCR-specific error handling', () => {
    it('should handle "No file uploaded" errors', () => {
      const exception = new Error('No file uploaded');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'No file uploaded'
        })
      );
    });

    it('should handle OCR processing failures', () => {
      const exception = new Error('OCR processing failed: Invalid API response');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'OCR processing failed'
        })
      );
    });

    it('should handle file buffer errors', () => {
      const exception = new Error('File buffer is empty');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'File buffer is empty'
        })
      );
    });

    it('should handle OCR API service errors', () => {
      const exception = new Error('OCR API request failed with status: 503');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(503);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 503,
          message: 'OCR service temporarily unavailable'
        })
      );
    });
  });

  describe('Production vs Development behavior', () => {
    it('should hide error details in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const exception = new Error('Detailed internal error message');

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'An error occurred while processing your request',
          statusCode: 500,
          timestamp: expect.any(String),
          path: '/ocr/upload'
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should show error details in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const exception = new Error('Detailed internal error message');

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Detailed internal error message',
          statusCode: 500,
          timestamp: expect.any(String),
          path: '/ocr/upload'
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should include stack traces in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const exception = new Error('Test error');
      exception.stack = 'Error: Test error\n    at test.js:1:1';

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: expect.stringContaining('Error: Test error')
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack traces in production', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const exception = new Error('Test error');
      exception.stack = 'Error: Test error\n    at test.js:1:1';

      filter.catch(exception, mockHost);

      const responseCall = mockResponse.json.mock.calls[0][0];
      expect(responseCall).not.toHaveProperty('stack');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Unknown error handling', () => {
    it('should handle non-Error objects', () => {
      const exception = 'String error';

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error'
        })
      );
    });

    it('should handle null/undefined exceptions', () => {
      filter.catch(null, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error'
        })
      );
    });
  });

  describe('Response structure', () => {
    it('should always include required response fields', () => {
      const exception = new Error('Test error');

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: expect.any(Number),
          message: expect.any(String),
          timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/),
          path: '/ocr/upload'
        })
      );
    });

    it('should use proper timestamp format', () => {
      const exception = new Error('Test error');

      filter.catch(exception, mockHost);

      const response = mockResponse.json.mock.calls[0][0];
      const timestamp = new Date(response.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});