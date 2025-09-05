import { Test, TestingModule } from '@nestjs/testing';
import { OcrService } from '../ocr.service';
import { TextParserService } from '../text-parser.service';
import fetch from 'node-fetch';

// Mock node-fetch
jest.mock('node-fetch');
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('OcrService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('processOCR', () => {
    let service: OcrService;
    const mockFile = {
      buffer: Buffer.from('test-image-data'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    beforeEach(async () => {
      // Set up environment for successful tests
      process.env.OCR_API_KEY = 'test-api-key';
      process.env.OCR_API_URL = 'https://api.ocr.space/parse/image';

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: TextParserService,
            useValue: {
              createWordsFromText: jest
                .fn()
                .mockReturnValue({ words: [], lines: [] }),
              estimateImageDimensions: jest
                .fn()
                .mockReturnValue({ width: 1200, height: 1600 }),
            },
          },
        ],
      }).compile();

      service = module.get<OcrService>(OcrService);
    });

    it('should successfully process OCR and return text and words', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          OCRExitCode: 1,
          ParsedResults: [
            {
              ParsedText: 'Hello World',
              TextOverlay: {
                Lines: [
                  {
                    Words: [
                      {
                        WordText: 'Hello',
                        Left: 10,
                        Top: 20,
                        Width: 50,
                        Height: 15,
                      },
                      {
                        WordText: 'World',
                        Left: 70,
                        Top: 20,
                        Width: 45,
                        Height: 15,
                      },
                    ],
                  },
                ],
              },
            },
          ],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await service.processOCR(mockFile);

      expect(result).toEqual({
        text: 'Hello World',
        words: [
          {
            text: 'Hello',
            left: 10,
            top: 20,
            width: 50,
            height: 15,
            wordId: 1,
            lineId: 0,
            confidence: 0.8,
          },
          {
            text: 'World',
            left: 70,
            top: 20,
            width: 45,
            height: 15,
            wordId: 2,
            lineId: 0,
            confidence: 0.8,
          },
        ],
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('should throw error when file buffer is empty', async () => {
      const emptyFile = { ...mockFile, buffer: undefined };

      await expect(
        service.processOCR(emptyFile as Express.Multer.File),
      ).rejects.toThrow('File buffer is empty!');
    });

    it('should throw error when OCR API key is not defined', async () => {
      // Temporarily clear environment variables
      delete process.env.OCR_API_KEY;
      delete process.env.OCR_API_URL;

      // Create a new service instance without env vars
      const moduleWithoutEnv: TestingModule = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: TextParserService,
            useValue: {
              createWordsFromText: jest
                .fn()
                .mockReturnValue({ words: [], lines: [] }),
              estimateImageDimensions: jest
                .fn()
                .mockReturnValue({ width: 1200, height: 1600 }),
            },
          },
        ],
      }).compile();

      const serviceWithoutEnv = moduleWithoutEnv.get<OcrService>(OcrService);

      await expect(serviceWithoutEnv.processOCR(mockFile)).rejects.toThrow(
        'OCR API Key or URL not defined',
      );
    });

    it('should throw error when OCR API URL is not defined', async () => {
      // Set only API key, clear URL
      process.env.OCR_API_KEY = 'test-key';
      delete process.env.OCR_API_URL;

      // Create a new service instance with only API key
      const modulePartialEnv: TestingModule = await Test.createTestingModule({
        providers: [
          OcrService,
          {
            provide: TextParserService,
            useValue: {
              createWordsFromText: jest
                .fn()
                .mockReturnValue({ words: [], lines: [] }),
              estimateImageDimensions: jest
                .fn()
                .mockReturnValue({ width: 1200, height: 1600 }),
            },
          },
        ],
      }).compile();

      const servicePartialEnv = modulePartialEnv.get<OcrService>(OcrService);

      await expect(servicePartialEnv.processOCR(mockFile)).rejects.toThrow(
        'OCR API Key or URL not defined',
      );
    });

    it('should throw error when API request fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await expect(service.processOCR(mockFile)).rejects.toThrow(
        'OCR API request failed with status: 500',
      );
    });

    it('should throw error when OCR processing fails', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          OCRExitCode: 0,
          ErrorMessage: 'Invalid image format',
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      await expect(service.processOCR(mockFile)).rejects.toThrow(
        'OCR processing failed: Invalid image format',
      );
    });

    it('should handle empty OCR results gracefully', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          OCRExitCode: 1,
          ParsedResults: [
            {
              ParsedText: '',
              TextOverlay: null,
            },
          ],
        }),
      };

      mockFetch.mockResolvedValue(mockResponse as unknown as Response);

      const result = await service.processOCR(mockFile);

      expect(result).toEqual({
        text: '',
        words: [],
      });
    });
  });
});
