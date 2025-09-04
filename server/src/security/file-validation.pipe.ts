import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxSize = 10 * 1024 * 1024; // 10 mb
  private readonly allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/bmp',
    'image/webp'
  ];
  private readonly allowedExtensions = [
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'
  ];

  transform(file: Express.Multer.File) {
    // if no file, preserve existing behavior (let the controller handle it)
    if (!file) {
      return file;
    }

    // file size validation
    if (file.size > this.maxSize) {
      throw new BadRequestException(
        `File size too large. Maximum allowed size is ${this.maxSize / 1024 / 1024}MB`
      );
    }

    // MIME type validation
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    // file extension validation
    const fileExtension = this.getFileExtension(file.originalname);
    if (!this.allowedExtensions.includes(fileExtension)) {
      throw new BadRequestException(
        `Invalid file extension. Allowed extensions: ${this.allowedExtensions.join(', ')}`
      );
    }

    // basic magic number validation for common image formats
    if (!this.validateMagicNumbers(file.buffer)) {
      throw new BadRequestException(
        'File content does not match the declared file type'
      );
    }

    // filename sanitization (preserve original name but check for dangerous characters)
    if (this.containsDangerousCharacters(file.originalname)) {
      throw new BadRequestException(
        'Filename contains invalid characters'
      );
    }

    return file;
  }

  private getFileExtension(filename: string): string {
    return filename.toLowerCase().substring(filename.lastIndexOf('.'));
  }

  private containsDangerousCharacters(filename: string): boolean {
    // check for dangerous characters that could be used for path traversal or code injection
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    const pathTraversal = /\.\./;
    return dangerousChars.test(filename) || pathTraversal.test(filename);
  }

  private validateMagicNumbers(buffer: Buffer): boolean {
    if (!buffer || buffer.length < 4) {
      return false;
    }

    // check magic numbers for common image formats
    const hex = buffer.toString('hex', 0, 4).toUpperCase();

    // JPEG: FF D8 FF
    if (hex.startsWith('FFD8FF')) return true;

    // PNG: 89 50 4E 47
    if (hex.startsWith('89504E47')) return true;

    // GIF: 47 49 46 38
    if (hex.startsWith('47494638')) return true;

    // BMP: 42 4D
    if (hex.startsWith('424D')) return true;

    // WebP: 52 49 46 46 (RIFF header, need to check further)
    if (hex.startsWith('52494646')) {
      // check if it's WebP by looking for WEBP signature at offset 8
      if (buffer.length >= 12) {
        const webpSig = buffer.toString('ascii', 8, 12);
        return webpSig === 'WEBP';
      }
    }

    return false;
  }
}