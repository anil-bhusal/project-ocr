import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '../app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('should return "Hello World!"', () => {
      const result = service.getHello();
      expect(result).toBe('Hello World!');
    });

    it('should return a string', () => {
      const result = service.getHello();
      expect(typeof result).toBe('string');
    });

    it('should not return null or undefined', () => {
      const result = service.getHello();
      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });

    it('should return the same value on multiple calls', () => {
      const result1 = service.getHello();
      const result2 = service.getHello();
      const result3 = service.getHello();

      expect(result1).toBe(result2);
      expect(result2).toBe(result3);
    });

    it('should not return an empty string', () => {
      const result = service.getHello();
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
