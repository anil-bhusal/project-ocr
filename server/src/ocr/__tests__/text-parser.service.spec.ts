import { Test, TestingModule } from '@nestjs/testing';
import { TextParserService } from '../text-parser.service';

describe('TextParserService', () => {
  let service: TextParserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TextParserService],
    }).compile();

    service = module.get<TextParserService>(TextParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createWordsFromText', () => {
    it('should parse single line text into words', () => {
      const text = 'Hello World Test';
      const result = service.createWordsFromText(text);

      expect(result.words).toHaveLength(3);
      expect(result.lines).toHaveLength(1);
      expect(result.words[0].text).toBe('Hello');
      expect(result.words[1].text).toBe('World');
      expect(result.words[2].text).toBe('Test');
    });

    it('should parse multi-line text correctly', () => {
      const text = 'First Line\nSecond Line\nThird Line';
      const result = service.createWordsFromText(text);

      expect(result.lines).toHaveLength(3);
      expect(result.lines[0].text).toBe('First Line');
      expect(result.lines[1].text).toBe('Second Line');
      expect(result.lines[2].text).toBe('Third Line');
    });

    it('should assign unique wordIds', () => {
      const text = 'Word1 Word2 Word3';
      const result = service.createWordsFromText(text);

      const wordIds = result.words.map((w) => w.wordId);
      const uniqueIds = new Set(wordIds);
      expect(uniqueIds.size).toBe(wordIds.length);
    });

    it('should calculate word positions correctly', () => {
      const text = 'Test Word';
      const result = service.createWordsFromText(text, 1200, 1600);

      const firstWord = result.words[0];
      const secondWord = result.words[1];

      expect(firstWord.left).toBeLessThan(secondWord.left);
      expect(firstWord.top).toBe(secondWord.top);
      expect(firstWord.width).toBeGreaterThan(0);
      expect(firstWord.height).toBeGreaterThan(0);
    });

    it('should handle empty text', () => {
      const text = '';
      const result = service.createWordsFromText(text);

      expect(result.words).toHaveLength(0);
      expect(result.lines).toHaveLength(0);
    });

    it('should handle text with multiple spaces', () => {
      const text = 'Word1    Word2     Word3';
      const result = service.createWordsFromText(text);

      expect(result.words).toHaveLength(3);
      expect(result.words[0].text).toBe('Word1');
      expect(result.words[1].text).toBe('Word2');
      expect(result.words[2].text).toBe('Word3');
    });

    it('should handle text with empty lines', () => {
      const text = 'Line1\n\n\nLine2';
      const result = service.createWordsFromText(text);

      expect(result.lines).toHaveLength(2);
      expect(result.lines[0].text).toBe('Line1');
      expect(result.lines[1].text).toBe('Line2');
    });

    it('should set default confidence to 0.8', () => {
      const text = 'Test';
      const result = service.createWordsFromText(text);

      expect(result.words[0].confidence).toBe(0.8);
    });

    it('should calculate line boundaries correctly', () => {
      const text = 'Multiple Words Here';
      const result = service.createWordsFromText(text);

      const line = result.lines[0];
      expect(line.left).toBeDefined();
      expect(line.top).toBeDefined();
      expect(line.width).toBeGreaterThan(0);
      expect(line.height).toBeGreaterThan(0);
      expect(line.words).toHaveLength(3);
    });

    it('should use custom image dimensions', () => {
      const text = 'Test';
      const result1 = service.createWordsFromText(text, 800, 600);
      const result2 = service.createWordsFromText(text, 1600, 1200);

      expect(result1.words[0].left).toBeLessThan(result2.words[0].left);
      expect(result1.words[0].top).toBeLessThan(result2.words[0].top);
    });

    it('should assign correct lineIds to words', () => {
      const text = 'Line 1\nLine 2\nLine 3';
      const result = service.createWordsFromText(text);

      expect(result.words[0].lineId).toBe(0);
      expect(result.words[1].lineId).toBe(0);
      expect(result.words[2].lineId).toBe(1);
      expect(result.words[3].lineId).toBe(1);
      expect(result.words[4].lineId).toBe(2);
      expect(result.words[5].lineId).toBe(2);
    });
  });

  describe('estimateImageDimensions', () => {
    it('should estimate dimensions for short text', () => {
      const text = 'Short text';
      const dimensions = service.estimateImageDimensions(text);

      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(600);
    });

    it('should estimate dimensions for long lines', () => {
      const text =
        'This is a very long line with many words that should result in a wider estimated width for the image';
      const dimensions = service.estimateImageDimensions(text);

      expect(dimensions.width).toBeGreaterThan(800);
      expect(dimensions.width).toBeLessThanOrEqual(1600);
      expect(dimensions.height).toBe(600);
    });

    it('should estimate dimensions for many lines', () => {
      const lines = Array(50).fill('Line of text').join('\n');
      const dimensions = service.estimateImageDimensions(lines);

      expect(dimensions.height).toBeGreaterThan(600);
      expect(dimensions.height).toBeLessThanOrEqual(2000);
    });

    it('should cap maximum dimensions', () => {
      const veryLongLine = 'x'.repeat(200);
      const manyLines = Array(100).fill('Line').join('\n');

      const dimLong = service.estimateImageDimensions(veryLongLine);
      expect(dimLong.width).toBe(1600);

      const dimTall = service.estimateImageDimensions(manyLines);
      expect(dimTall.height).toBe(2000);
    });

    it('should handle empty text', () => {
      const text = '';
      const dimensions = service.estimateImageDimensions(text);

      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(600);
    });

    it('should handle text with only whitespace lines', () => {
      const text = '   \n   \n   ';
      const dimensions = service.estimateImageDimensions(text);

      expect(dimensions.width).toBe(800);
      expect(dimensions.height).toBe(600);
    });

    it('should calculate based on longest line', () => {
      const text =
        'Short\nThis is a much longer line that should be wide\nShort';
      const dimensions = service.estimateImageDimensions(text);

      // The longest line is "This is a much longer line that should be wide" (47 chars)
      // Expected: max(800, min(1600, 47 * 12)) = max(800, min(1600, 564)) = max(800, 564) = 800
      expect(dimensions.width).toBeGreaterThanOrEqual(800);
      expect(dimensions.width).toBeLessThanOrEqual(1600);
    });
  });
});
