import { Injectable } from '@nestjs/common';
import { OCRWordDto, OCRLineDto } from './dto/enhanced-ocr.dto';

@Injectable()
export class TextParserService {

  // fallback method to create word boundaries when ocr api doesn't provide TextOverlay
  // this creates approximate word positions based on text parsing
  createWordsFromText(text: string, imageWidth: number = 1200, imageHeight: number = 1600): { words: OCRWordDto[], lines: OCRLineDto[] } {
    const lines: OCRLineDto[] = [];
    const allWords: OCRWordDto[] = [];
    let wordIdCounter = 0;

    // split text into lines
    const textLines = text.split(/\r?\n/).filter(line => line.trim());

    // estimate character width and height based on image size
    // approximate characters per line
    const avgCharWidth = imageWidth / 80;

    // approximate line height
    const avgLineHeight = 25;
    const leftMargin = imageWidth * 0.05; // 5% left margin
    const topMargin = imageHeight * 0.05; // 5% top margin

    textLines.forEach((lineText, lineIndex) => {
      const trimmedLine = lineText.trim();
      if (!trimmedLine) return;

      // split line into words
      const wordsInLine = trimmedLine.split(/\s+/).filter(word => word.length > 0);

      let currentX = leftMargin;
      const currentY = topMargin + (lineIndex * avgLineHeight * 1.2);
      const lineWords: OCRWordDto[] = [];

      wordsInLine.forEach((wordText) => {
        const wordWidth = wordText.length * avgCharWidth;

        const word: OCRWordDto = {
          text: wordText,
          left: Math.round(currentX),
          top: Math.round(currentY),
          width: Math.round(wordWidth),
          height: Math.round(avgLineHeight),
          wordId: ++wordIdCounter,
          lineId: lineIndex,
          confidence: 0.8 // default confidence = 0.8 for parsed text
        };

        lineWords.push(word);
        allWords.push(word);

        // move to next word position (word width + space)
        currentX += wordWidth + (avgCharWidth * 0.5);
      });

      if (lineWords.length > 0) {
        // calculating   line boundaries
        const lineLeft = Math.min(...lineWords.map(w => w.left));
        const lineTop = Math.min(...lineWords.map(w => w.top));
        const lineRight = Math.max(...lineWords.map(w => w.left + w.width));
        const lineBottom = Math.max(...lineWords.map(w => w.top + w.height));

        lines.push({
          lineId: lineIndex,
          words: lineWords,
          left: lineLeft,
          top: lineTop,
          width: lineRight - lineLeft,
          height: lineBottom - lineTop,
          text: trimmedLine
        });
      }
    });

    return { words: allWords, lines };
  }

  // estimate image dimensions from text content if not provided
  estimateImageDimensions(text: string): { width: number; height: number } {
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    const maxLineLength = Math.max(...lines.map(line => line.length));

    // rough estimation based on content
    const estimatedWidth = Math.max(800, Math.min(1600, maxLineLength * 12));
    const estimatedHeight = Math.max(600, Math.min(2000, lines.length * 30));

    return {
      width: estimatedWidth,
      height: estimatedHeight
    };
  }
}