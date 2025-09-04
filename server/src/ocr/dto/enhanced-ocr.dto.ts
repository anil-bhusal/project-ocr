import { ApiProperty } from '@nestjs/swagger';

export class OCRWordDto {
  @ApiProperty({
    description: 'The extracted text content of the word',
    example: 'Hello'
  })
  text: string;

  @ApiProperty({
    description: 'Left position (x-coordinate) of the word in pixels',
    example: 10
  })
  left: number;

  @ApiProperty({
    description: 'Top position (y-coordinate) of the word in pixels', 
    example: 20
  })
  top: number;

  @ApiProperty({
    description: 'Width of the word bounding box in pixels',
    example: 50
  })
  width: number;

  @ApiProperty({
    description: 'Height of the word bounding box in pixels',
    example: 15
  })
  height: number;

  @ApiProperty({
    description: 'Unique identifier for the word within the document',
    example: 1
  })
  wordId: number;

  @ApiProperty({
    description: 'Line identifier that this word belongs to',
    example: 0
  })
  lineId: number;

  @ApiProperty({
    description: 'Confidence score of OCR accuracy (0.0 to 1.0)',
    example: 0.95,
    required: false
  })
  confidence?: number;
}

export class OCRLineDto {
  @ApiProperty({
    description: 'Unique identifier for the line',
    example: 0
  })
  lineId: number;

  @ApiProperty({
    description: 'Array of words contained in this line',
    type: [OCRWordDto]
  })
  words: OCRWordDto[];

  @ApiProperty({
    description: 'Left position of the entire line',
    example: 10
  })
  left: number;

  @ApiProperty({
    description: 'Top position of the entire line',
    example: 20
  })
  top: number;

  @ApiProperty({
    description: 'Width of the entire line',
    example: 200
  })
  width: number;

  @ApiProperty({
    description: 'Height of the entire line',
    example: 15
  })
  height: number;

  @ApiProperty({
    description: 'Combined text of all words in the line',
    example: 'Hello World'
  })
  text: string;
}

export class DetectedFieldDto {
  @ApiProperty({
    description: 'Type of detected field',
    enum: ['invoice_number', 'date', 'amount', 'customer_name', 'total', 'subtotal', 'tax', 'due_date', 'unknown'],
    example: 'invoice_number'
  })
  fieldType: 'invoice_number' | 'date' | 'amount' | 'customer_name' | 'total' | 'subtotal' | 'tax' | 'due_date' | 'unknown';

  @ApiProperty({
    description: 'Extracted value of the field',
    example: 'INV-2024-001'
  })
  value: string;

  @ApiProperty({
    description: 'Confidence score for field detection accuracy',
    example: 0.89
  })
  confidence: number;

  @ApiProperty({
    description: 'Words that make up this field',
    type: [OCRWordDto]
  })
  words: OCRWordDto[];

  @ApiProperty({
    description: 'Bounding box coordinates of the field',
    example: {
      left: 100,
      top: 50,
      width: 120,
      height: 20
    }
  })
  coordinates: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export class EnhancedOCRResponseDto {
  @ApiProperty({
    description: 'Array of extracted words with positioning and metadata. Optimized response contains only words array to reduce payload size by 60-70%.',
    type: [OCRWordDto],
    example: [
      {
        text: 'Hello',
        left: 10,
        top: 20,
        width: 50,
        height: 15,
        wordId: 1,
        lineId: 0,
        confidence: 0.95
      },
      {
        text: 'World',
        left: 65,
        top: 20,
        width: 45,
        height: 15,
        wordId: 2,
        lineId: 0,
        confidence: 0.92
      }
    ]
  })
  words: OCRWordDto[];
}