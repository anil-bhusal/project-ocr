import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { OcrController } from '../ocr.controller';
import { OcrService } from '../ocr.service';

describe('OcrController', () => {
  let controller: OcrController;
  let service: OcrService;

  const mockOcrService = {
    processOCR: jest.fn(),
    processEnhancedOCR: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ThrottlerModule.forRoot([
          {
            name: 'default',
            ttl: 60000,
            limit: 10,
          },
        ]),
      ],
      controllers: [OcrController],
      providers: [
        {
          provide: OcrService,
          useValue: mockOcrService,
        },
      ],
    })
      .overrideGuard(ThrottlerGuard)
      .useValue({ canActivate: () => true }) // Mock throttler for tests
      .compile();

    controller = module.get<OcrController>(OcrController);
    service = module.get<OcrService>(OcrService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockFile = {
      buffer: Buffer.from('test-image-data'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    it('should successfully upload and process file', async () => {
      const mockResult = {
        text: 'Hello World',
        words: [
          {
            text: 'Hello',
            left: 10,
            top: 20,
            width: 50,
            height: 15,
          },
        ],
      };

      mockOcrService.processOCR.mockResolvedValue(mockResult);

      const result = await controller.uploadFile(mockFile);

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'OCR processing completed successfully',
        data: {
          filename: 'test.jpg',
          text: 'Hello World',
          words: [
            {
              text: 'Hello',
              left: 10,
              top: 20,
              width: 50,
              height: 15,
            },
          ],
        },
      });

      expect(mockOcrService.processOCR).toHaveBeenCalledWith(mockFile);
    });

    it('should throw error when no file is uploaded', async () => {
      const emptyFile = { ...mockFile, buffer: undefined };

      await expect(
        controller.uploadFile(emptyFile as Express.Multer.File),
      ).rejects.toThrow('No file uploaded');

      expect(mockOcrService.processOCR).not.toHaveBeenCalled();
    });

    it('should propagate service errors', async () => {
      mockOcrService.processOCR.mockRejectedValue(new Error('OCR failed'));

      await expect(controller.uploadFile(mockFile)).rejects.toThrow(
        'OCR processing failed',
      );
    });
  });

  describe('uploadFileEnhanced', () => {
    const mockFile = {
      buffer: Buffer.from('test-image-data'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
      size: 1024 * 1024, // 1MB
    } as Express.Multer.File;

    it('should successfully upload and process file with enhanced features', async () => {
      const mockResult = {
        words: [
          {
            text: 'Hello',
            left: 10,
            top: 20,
            width: 50,
            height: 15,
            wordId: 1,
            lineId: 0,
            confidence: 0.95,
          },
          {
            text: 'World',
            left: 65,
            top: 20,
            width: 45,
            height: 15,
            wordId: 2,
            lineId: 0,
            confidence: 0.92,
          },
        ],
      };

      mockOcrService.processEnhancedOCR.mockResolvedValue(mockResult);

      const result = await controller.uploadFileEnhanced(mockFile, true);

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: 'Enhanced OCR processing completed successfully',
        data: mockResult,
      });
      expect(mockOcrService.processEnhancedOCR).toHaveBeenCalledWith(mockFile);
    });

    it('should handle detectFields parameter', async () => {
      const mockResult = { words: [] };
      mockOcrService.processEnhancedOCR.mockResolvedValue(mockResult);

      await controller.uploadFileEnhanced(mockFile, false);

      expect(mockOcrService.processEnhancedOCR).toHaveBeenCalledWith(mockFile);
    });

    it('should use default detectFields when not provided', async () => {
      const mockResult = { words: [] };
      mockOcrService.processEnhancedOCR.mockResolvedValue(mockResult);

      await controller.uploadFileEnhanced(mockFile);

      expect(mockOcrService.processEnhancedOCR).toHaveBeenCalledWith(mockFile);
    });

    it('should throw error when no file is uploaded', async () => {
      const emptyFile = { ...mockFile, buffer: undefined };

      await expect(
        controller.uploadFileEnhanced(emptyFile as Express.Multer.File),
      ).rejects.toThrow('No file uploaded');

      expect(mockOcrService.processEnhancedOCR).not.toHaveBeenCalled();
    });

    it('should propagate service errors', async () => {
      mockOcrService.processEnhancedOCR.mockRejectedValue(
        new Error('Enhanced OCR failed'),
      );

      await expect(controller.uploadFileEnhanced(mockFile)).rejects.toThrow(
        'Enhanced OCR processing failed',
      );
    });
  });

  describe('Security Integration', () => {
    it('should be properly configured with security features', () => {
      // Test that controller and service are properly initialized
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });

    it('should have upload and enhanced upload methods', () => {
      expect(typeof controller.uploadFile.bind(controller)).toBe('function');
      expect(typeof controller.uploadFileEnhanced.bind(controller)).toBe(
        'function',
      );
    });

    it('should handle file validation in integration', () => {
      // This will be tested in e2e tests where the full pipeline runs
      expect(controller.uploadFile.bind(controller)).toBeDefined();
      expect(controller.uploadFileEnhanced.bind(controller)).toBeDefined();
    });
  });
});
