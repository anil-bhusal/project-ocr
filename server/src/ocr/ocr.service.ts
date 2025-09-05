import { Injectable } from '@nestjs/common';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { TextParserService } from './text-parser.service';
import {
  OCRWordDto,
  OCRLineDto,
  EnhancedOCRResponseDto,
} from './dto/enhanced-ocr.dto';

interface OCRWord {
  WordText: string;
  Left: number;
  Top: number;
  Height: number;
  Width: number;
  Confidence?: number;
}

interface OCRLine {
  LineText: string;
  Words: OCRWord[];
}

interface OCRApiResponse {
  ParsedResults?: Array<{
    ParsedText?: string;
    TextOverlay?: {
      Lines?: OCRLine[];
    };
  }>;
  OCRExitCode?: number;
  IsErroredOnProcessing?: boolean;
  ErrorMessage?: string;
  ErrorDetails?: string;
}

@Injectable()
export class OcrService {
  private OCRKey = process.env.OCR_API_KEY;
  private OCRURL = process.env.OCR_API_URL;

  constructor(private readonly textParserService: TextParserService) {}

  // previous / old method for backward compatibility
  async processOCR(
    file: Express.Multer.File,
  ): Promise<{ text: string; words: OCRWordDto[] }> {
    const result = await this.processEnhancedOCR(file);
    // reconstruct text from words for backward compatibility
    const text = result.words.map((w) => w.text).join(' ');
    return {
      text: text,
      words: result.words,
    };
  }

  async processEnhancedOCR(
    file: Express.Multer.File,
  ): Promise<EnhancedOCRResponseDto> {
    if (!file.buffer) throw new Error('File buffer is empty!');
    if (!this.OCRKey || !this.OCRURL)
      throw new Error('OCR API Key or URL not defined');

    const formData = new FormData();
    formData.append('file', file.buffer, file.originalname);
    formData.append('language', 'eng');
    formData.append('apikey', this.OCRKey);

    // Use ocr engine 2 for better word detection
    formData.append('OCREngine', '2');

    // enable word-level coordinates
    formData.append('isOverlayRequired', 'true');

    // auto-detect orientation
    formData.append('detectOrientation', 'true');

    // scale image for better accuracy
    formData.append('scale', 'true');

    const res = await fetch(this.OCRURL, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error(`OCR API request failed with status: ${res.status}`);
    }

    const data = (await res.json()) as OCRApiResponse;

    if (data.OCRExitCode !== 1) {
      throw new Error(
        `OCR processing failed: ${data.ErrorMessage || 'Unknown error'}`,
      );
    }

    const parsedText = data.ParsedResults?.[0]?.ParsedText || '';
    const textOverlay = data.ParsedResults?.[0]?.TextOverlay;

    // extract words and lines with enhanced structure
    const lines: OCRLineDto[] = [];
    const allWords: OCRWordDto[] = [];
    let wordIdCounter = 0;

    if (textOverlay?.Lines) {
      textOverlay.Lines.forEach((line: OCRLine, lineIndex: number) => {
        const lineWords: OCRWordDto[] = line.Words.map((w: OCRWord) => ({
          text: w.WordText,
          left: w.Left,
          top: w.Top,
          width: w.Width,
          height: w.Height,
          wordId: ++wordIdCounter,
          lineId: lineIndex,
          confidence: w.Confidence || 0.8,
        }));

        allWords.push(...lineWords);

        // calculate line boundaries
        const lineLeft = Math.min(...lineWords.map((w) => w.left));
        const lineTop = Math.min(...lineWords.map((w) => w.top));
        const lineRight = Math.max(...lineWords.map((w) => w.left + w.width));
        const lineBottom = Math.max(...lineWords.map((w) => w.top + w.height));

        lines.push({
          lineId: lineIndex,
          words: lineWords,
          left: lineLeft,
          top: lineTop,
          width: lineRight - lineLeft,
          height: lineBottom - lineTop,
          text: lineWords.map((w) => w.text).join(' '),
        });
      });
    } else {
      // fallback: Create word boundaries from parsed text
      const estimatedSize =
        this.textParserService.estimateImageDimensions(parsedText);
      const parsedData = this.textParserService.createWordsFromText(
        parsedText,
        estimatedSize.width,
        estimatedSize.height,
      );

      allWords.push(...parsedData.words);
      lines.push(...parsedData.lines);
    }

    return {
      words: allWords,
    };
  }
}
