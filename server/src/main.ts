import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './app.module';
import { SecurityExceptionFilter } from './security/security-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // add body size limits for security
    bodyParser: true,
  });

  // request size limits (prevent memory exhaustion)
  app.use((req: Request, res: Response, next: NextFunction) => {
    // skip file upload endpoints ... they're handled by multer
    if (req.path.includes('/upload')) {
      return next();
    }

    // limit regular JSON/form requests to 1MB
    const contentType = req.headers['content-type'];
    if (
      contentType?.includes('application/json') ||
      contentType?.includes('application/x-www-form-urlencoded')
    ) {
      const contentLength = parseInt(req.headers['content-length'] || '0', 10);
      if (contentLength > 1024 * 1024) {
        // 1MB
        return res.status(413).json({
          statusCode: 413,
          message: 'Request entity too large',
        });
      }
    }
    next();
  });

  // security headers
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"], // allow inline styles for Swagger UI
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'blob:'], // allow data URLs for images
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false, // allow file uploads
    }),
  );

  // enhanced CORS configuration
  const allowedOrigins = process.env.NODE_ENV === 'development' 
    ? ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000']
    : [process.env.FRONTEND_URL || 'http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    credentials: false,
    maxAge: 86400, // 24 hours preflight cache
  });

  // global validation pipe for input validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip properties that are not in the dto
      forbidNonWhitelisted: true, // throw error if extra properties are provided
      transform: true, // automatically transform payloads to dtoo instances
      disableErrorMessages: process.env.NODE_ENV === 'production', // hide validation errors in production
    }),
  );

  // global exception filter for secure error handling
  app.useGlobalFilters(new SecurityExceptionFilter());

  // swagger api  documentation setup
  const config = new DocumentBuilder()
    .setTitle('OCR API')
    .setDescription(
      'Advanced OCR API with text extraction and word positioning',
    )
    .setVersion('1.0')
    .addTag('ocr', 'OCR processing endpoints')
    .addTag('health', 'Health check endpoints')
    .addServer('http://localhost:5000', 'Development server')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    customSiteTitle: 'OCR API Documentation',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
    },
  });

  await app.listen(5000);
  console.log('Hi, Server running on http://localhost:5000');
  console.log('API Documentation available at http://localhost:5000/api-docs');
}

// Handle unhandled promise rejection
void bootstrap();
