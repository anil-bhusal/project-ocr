import { ApiProperty } from '@nestjs/swagger';

export class OCRWordDto {
  @ApiProperty({
    description: 'The extracted text content of the word',
    example: 'Sample'
  })
  text: string;

  @ApiProperty({
    description: 'Left position (x-coordinate) of the word in pixels',
    example: 100
  })
  left: number;

  @ApiProperty({
    description: 'Top position (y-coordinate) of the word in pixels',
    example: 50
  })
  top: number;

  @ApiProperty({
    description: 'Width of the word bounding box in pixels',
    example: 60
  })
  width: number;

  @ApiProperty({
    description: 'Height of the word bounding box in pixels',
    example: 20
  })
  height: number;
}

export class OCRResponseDto {
  @ApiProperty({
    description: 'Original filename of the uploaded image',
    example: 'document.jpg'
  })
  filename: string;

  @ApiProperty({
    description: 'Complete extracted text content from the image',
    example: 'Sample extracted text from the document'
  })
  text: string;

  @ApiProperty({
    description: 'Array of individual words with their positions',
    type: [OCRWordDto]
  })
  words: OCRWordDto[];
}
