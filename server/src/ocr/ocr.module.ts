import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { TextParserService } from './text-parser.service';

@Module({
  controllers: [OcrController],
  providers: [OcrService, TextParserService],
})
export class OcrModule {}
