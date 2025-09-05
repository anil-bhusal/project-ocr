import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Query,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { OcrService } from './ocr.service';
import { FileValidationPipe } from '../security/file-validation.pipe';
import type { Express } from 'express';
import { OCRResponseDto } from './dto/ocr-response.dto';
import { EnhancedOCRResponseDto } from './dto/enhanced-ocr.dto';
import { ResponseHelper } from '../common/utils/response-helper';
import { ResponseDto } from '../common/dto/response.dto';

@ApiTags('ocr')
@Controller('ocr')
@UseGuards(ThrottlerGuard) // apply rate limiting to all ocr endpoints
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  // previous endpoit for upload images
  @Post('upload')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 uploads per minute
  @ApiOperation({
    summary: 'Process OCR on uploaded image (Legacy)',
    description:
      'Upload an image file and receive OCR results with basic text extraction',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to process',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, PDF, etc.)',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'OCR processing successful',
    type: OCRResponseDto,
    example: {
      filename: 'document.jpg',
      text: 'Sample extracted text',
      words: [
        {
          text: 'Sample',
          left: 100,
          top: 50,
          width: 60,
          height: 20,
          wordId: 1,
          lineId: 0,
          confidence: 0.95,
        },
      ],
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request - no file uploaded' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 mb limit
      },
    }),
  )
  async uploadFile(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
  ): Promise<ResponseDto<OCRResponseDto>> {
    if (!file || !file.buffer) {
      throw new HttpException(
        ResponseHelper.error('No file uploaded', HttpStatus.BAD_REQUEST),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = await this.ocrService.processOCR(file);
      const data = { filename: file.originalname, ...result };
      return ResponseHelper.success(
        data,
        'OCR processing completed successfully',
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new HttpException(
        ResponseHelper.error(
          'OCR processing failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // enhanced endpoint
  @Post('upload-enhanced')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 enhanced uploads per minute
  @ApiOperation({
    summary: 'Process OCR with enhanced features',
    description:
      'Upload an image file and receive enhanced OCR results with word positioning, confidence scores, and optimized output for interactive text selection',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file to process with enhanced OCR',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Image file (JPG, PNG, PDF, etc.)',
        },
      },
      required: ['file'],
    },
  })
  @ApiQuery({
    name: 'detectFields',
    description:
      'Enable field detection (currently unused but available for future features)',
    required: false,
    type: 'boolean',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Enhanced OCR processing successful',
    type: EnhancedOCRResponseDto,
    example: {
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
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - no file uploaded or invalid file format',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or missing OCR API key',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - OCR processing failed',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 mb limit
      },
    }),
  )
  async uploadFileEnhanced(
    @UploadedFile(FileValidationPipe) file: Express.Multer.File,
    @Query('detectFields') _detectFields: boolean = true,
  ): Promise<ResponseDto<EnhancedOCRResponseDto>> {
    if (!file || !file.buffer) {
      throw new HttpException(
        ResponseHelper.error('No file uploaded', HttpStatus.BAD_REQUEST),
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const data = await this.ocrService.processEnhancedOCR(file);
      return ResponseHelper.success(
        data,
        'Enhanced OCR processing completed successfully',
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      throw new HttpException(
        ResponseHelper.error(
          'Enhanced OCR processing failed',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
