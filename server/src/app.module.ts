import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OcrModule } from './ocr/ocr.module';
import { SecurityModule } from './security/security.module';

@Module({
  imports: [OcrModule, SecurityModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
