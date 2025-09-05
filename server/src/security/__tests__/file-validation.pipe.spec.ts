import { BadRequestException } from '@nestjs/common';
import { FileValidationPipe } from '../file-validation.pipe';
import { Express } from 'express';

describe('FileValidationPipe', () => {
  let pipe: FileValidationPipe;

  beforeEach(() => {
    pipe = new FileValidationPipe();
  });

  describe('Valid files', () => {
    it('should pass valid JPEG file', () => {
      const mockFile = {
        originalname: 'test.jpg',
        mimetype: 'image/jpeg',
        size: 1024 * 1024, // 1MB
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]), // JPEG magic number
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).not.toThrow();
    });

    it('should pass valid PNG file', () => {
      const mockFile = {
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 2 * 1024 * 1024, // 2MB
        buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47]), // PNG magic number
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).not.toThrow();
    });

    it('should pass valid GIF file', () => {
      const mockFile = {
        originalname: 'test.gif',
        mimetype: 'image/gif',
        size: 500 * 1024, // 500KB
        buffer: Buffer.from([0x47, 0x49, 0x46, 0x38]), // GIF magic number
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).not.toThrow();
    });

    it('should return undefined when no file is provided', () => {
      const result = pipe.transform(
        undefined as unknown as Express.Multer.File,
      );
      expect(result).toBeUndefined();
    });
  });

  describe('File size validation', () => {
    it('should reject files larger than 10MB', () => {
      const mockFile = {
        originalname: 'large.jpg',
        mimetype: 'image/jpeg',
        size: 11 * 1024 * 1024, // 11MB
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(BadRequestException);
    });

    it('should accept files exactly at 10MB limit', () => {
      const mockFile = {
        originalname: 'limit.jpg',
        mimetype: 'image/jpeg',
        size: 10 * 1024 * 1024, // 10MB exactly
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).not.toThrow();
    });
  });

  describe('MIME type validation', () => {
    it('should reject non-image MIME types', () => {
      const mockFile = {
        originalname: 'document.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        buffer: Buffer.from([0x25, 0x50, 0x44, 0x46]),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(
        'Invalid file type. Allowed types: image/jpeg, image/jpg, image/png, image/gif, image/bmp, image/webp',
      );
    });

    it('should reject text files', () => {
      const mockFile = {
        originalname: 'script.txt',
        mimetype: 'text/plain',
        size: 100,
        buffer: Buffer.from('hello world'),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(BadRequestException);
    });

    it('should reject executable files', () => {
      const mockFile = {
        originalname: 'malware.exe',
        mimetype: 'application/octet-stream',
        size: 1024,
        buffer: Buffer.from([0x4d, 0x5a]),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(BadRequestException);
    });
  });

  describe('File extension validation', () => {
    it('should reject files with dangerous extensions', () => {
      const mockFile = {
        originalname: 'image.php',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(
        'Invalid file extension. Allowed extensions: .jpg, .jpeg, .png, .gif, .bmp, .webp',
      );
    });

    it('should reject executable extensions', () => {
      const mockFile = {
        originalname: 'fake.exe',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(BadRequestException);
    });

    it('should handle case-insensitive extensions', () => {
      const mockFile = {
        originalname: 'test.JPG',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).not.toThrow();
    });
  });

  describe('Magic number validation', () => {
    it('should reject files with mismatched magic numbers', () => {
      const mockFile = {
        originalname: 'fake.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from([0x00, 0x00, 0x00, 0x00]), // Wrong magic number
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(
        'File content does not match the declared file type',
      );
    });

    it('should reject files with insufficient buffer length', () => {
      const mockFile = {
        originalname: 'tiny.jpg',
        mimetype: 'image/jpeg',
        size: 1,
        buffer: Buffer.from([0xff]), // Too small
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(BadRequestException);
    });

    it('should validate WebP files correctly', () => {
      const webpBuffer = Buffer.alloc(16);
      webpBuffer.write('RIFF', 0); // RIFF header
      webpBuffer.write('WEBP', 8); // WebP signature at offset 8

      const mockFile = {
        originalname: 'test.webp',
        mimetype: 'image/webp',
        size: 1024,
        buffer: webpBuffer,
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).not.toThrow();
    });
  });

  describe('Filename security', () => {
    it('should reject filenames with path traversal', () => {
      const mockFile = {
        originalname: '../../../evil.jpg',
        mimetype: 'image/jpeg',
        size: 1024,
        buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
      } as Express.Multer.File;

      expect(() => pipe.transform(mockFile)).toThrow(
        'Filename contains invalid characters',
      );
    });

    it('should reject filenames with dangerous characters', () => {
      const dangerousNames = [
        'test<script>.jpg',
        'file|pipe.jpg',
        'null\x00byte.jpg',
        'question?.jpg',
      ];

      dangerousNames.forEach((name) => {
        const mockFile = {
          originalname: name,
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
        } as Express.Multer.File;

        expect(() => pipe.transform(mockFile)).toThrow(BadRequestException);
      });
    });

    it('should accept safe filenames', () => {
      const safeNames = [
        'image.jpg',
        'my-photo_2024.png',
        'scan.001.gif',
        'document-v1.2.bmp',
      ];

      safeNames.forEach((name) => {
        const mockFile = {
          originalname: name,
          mimetype: 'image/jpeg',
          size: 1024,
          buffer: Buffer.from([0xff, 0xd8, 0xff, 0xe0]),
        } as Express.Multer.File;

        expect(() => pipe.transform(mockFile)).not.toThrow();
      });
    });
  });
});
