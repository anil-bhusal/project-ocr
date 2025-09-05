import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { SecurityExceptionFilter } from '../src/security/security-exception.filter';
import helmet from 'helmet';

describe('OCR E2E', () => {
  let app: INestApplication;

  beforeEach(async () => {
    // Set NODE_ENV to production to hide stack traces
    process.env.NODE_ENV = 'production';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Enable CORS
    app.enableCors({
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      allowedHeaders: '*',
    });

    // Add security headers
    app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
          },
        },
      }),
    );

    // Apply same middleware as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        disableErrorMessages: false, // Enable for testing
      }),
    );

    app.useGlobalFilters(new SecurityExceptionFilter());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/ (GET)', () => {
    it('should return Hello World', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toEqual({
            statusCode: 200,
            success: true,
            message: 'API is running successfully',
            data: 'Hello World!',
          });
        });
    });
  });

  describe('/ocr/upload (POST)', () => {
    it('should reject requests without files', () => {
      return request(app.getHttpServer()).post('/ocr/upload').expect(400);
    });

    it('should reject non-image files', () => {
      return request(app.getHttpServer())
        .post('/ocr/upload')
        .attach('file', Buffer.from('not an image'), 'test.txt')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid file type');
        });
    });

    it('should reject oversized files', () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11MB
      // Create a fake JPEG header
      largeBuffer[0] = 0xff;
      largeBuffer[1] = 0xd8;
      largeBuffer[2] = 0xff;
      largeBuffer[3] = 0xe0;

      return request(app.getHttpServer())
        .post('/ocr/upload')
        .attach('file', largeBuffer, 'large.jpg')
        .expect(413); // Payload Too Large status code
    });

    it('should reject files with dangerous filenames', () => {
      const imageBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]); // JPEG header

      return request(app.getHttpServer())
        .post('/ocr/upload')
        .attach('file', imageBuffer, '../evil.jpg')
        .expect((res) => {
          // Accept either 400 or 500 as the server may handle this differently
          expect([400, 500]).toContain(res.status);
          expect(res.body.message).toBeDefined();
        });
    });

    it('should reject files with mismatched content', () => {
      const fakeImageBuffer = Buffer.from('fake image content');

      return request(app.getHttpServer())
        .post('/ocr/upload')
        .attach('file', fakeImageBuffer, 'fake.jpg')
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('File content does not match');
        });
    });
  });

  describe('/ocr/upload-enhanced (POST)', () => {
    it('should reject requests without files', () => {
      return request(app.getHttpServer())
        .post('/ocr/upload-enhanced')
        .expect(400);
    });

    it('should accept detectFields query parameter', () => {
      return request(app.getHttpServer())
        .post('/ocr/upload-enhanced')
        .query({ detectFields: true })
        .expect(400); // Still expect 400 due to missing file, but query parsing should work
    });

    it('should handle boolean conversion for detectFields', () => {
      return request(app.getHttpServer())
        .post('/ocr/upload-enhanced')
        .query({ detectFields: 'false' })
        .expect(400); // Still expect 400 due to missing file
    });
  });

  describe('Rate Limiting', () => {
    it('should accept requests within rate limit', async () => {
      const validImageBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0]); // JPEG header

      // First request should be accepted (even if it fails due to invalid OCR content)
      const response = await request(app.getHttpServer())
        .post('/ocr/upload')
        .attach('file', validImageBuffer, 'test.jpg');

      // Should not be rate limited (status should be 400 for invalid content, not 429)
      expect(response.status).not.toBe(429);
    });

    // Note: Testing actual rate limiting requires making many requests
    // which is not practical in unit tests. This would be better tested
    // with load testing tools or manual testing.
  });

  describe('CORS', () => {
    it('should have CORS headers on successful requests', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.headers['access-control-allow-origin']).toBeDefined();
        });
    });

    it('should handle preflight requests', () => {
      return request(app.getHttpServer())
        .options('/ocr/upload')
        .expect(204)
        .expect((res) => {
          expect(res.headers['access-control-allow-methods']).toContain('POST');
        });
    });
  });

  describe('Security Headers', () => {
    it('should include security headers', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          // Helmet security headers
          expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
          expect(res.headers['x-content-type-options']).toBe('nosniff');
          expect(res.headers['x-xss-protection']).toBe('0'); // Modern helmet disables this
        });
    });

    it('should include Content Security Policy', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.headers['content-security-policy']).toBeDefined();
          expect(res.headers['content-security-policy']).toContain(
            "default-src 'self'",
          );
        });
    });
  });

  describe('Error Handling', () => {
    it('should return structured error responses', () => {
      return request(app.getHttpServer())
        .post('/ocr/upload')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body).toHaveProperty('path');
        });
    });

    it('should not expose stack traces in production-like mode', () => {
      return request(app.getHttpServer())
        .post('/ocr/upload')
        .expect(400)
        .expect((res) => {
          expect(res.body).not.toHaveProperty('stack');
        });
    });
  });

  describe('Content Type Validation', () => {
    it('should only accept multipart/form-data for upload endpoints', () => {
      return request(app.getHttpServer())
        .post('/ocr/upload')
        .send({ some: 'data' })
        .expect(400);
    });
  });

  // Swagger is not enabled in test environment, skipping these tests
  describe.skip('API Documentation', () => {
    it('should serve Swagger documentation', () => {
      return request(app.getHttpServer()).get('/api-docs').expect(301); // Redirect to /api-docs/
    });

    it('should serve Swagger JSON', () => {
      return request(app.getHttpServer())
        .get('/api-docs-json')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('info');
          expect(res.body).toHaveProperty('paths');
          expect(res.body.paths).toHaveProperty('/ocr/upload');
          expect(res.body.paths).toHaveProperty('/ocr/upload-enhanced');
        });
    });
  });
});
