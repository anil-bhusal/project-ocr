import { HttpStatus } from '@nestjs/common';
import { ResponseHelper } from '../response-helper';
import { ResponseDto } from '../../dto/response.dto';

describe('ResponseHelper', () => {
  describe('success', () => {
    it('should create a success response with data', () => {
      const data = { id: 1, name: 'Test' };
      const result = ResponseHelper.success(data);

      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Success');
      expect(result.data).toEqual(data);
    });

    it('should create a success response with custom message', () => {
      const data = 'test data';
      const message = 'Custom success message';
      const result = ResponseHelper.success(data, message);

      expect(result.message).toBe(message);
      expect(result.data).toBe(data);
    });

    it('should handle null data', () => {
      const result = ResponseHelper.success(null);

      expect(result.statusCode).toBe(HttpStatus.OK);
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should handle array data', () => {
      const data = [1, 2, 3];
      const result = ResponseHelper.success(data);

      expect(result.data).toEqual(data);
      expect(Array.isArray(result.data)).toBe(true);
    });
  });

  describe('created', () => {
    it('should create a created response with data', () => {
      const data = { id: 1, created: true };
      const result = ResponseHelper.created(data);

      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
      expect(result.success).toBe(true);
      expect(result.message).toBe('Created successfully');
      expect(result.data).toEqual(data);
    });

    it('should create a created response with custom message', () => {
      const data = { resource: 'User' };
      const message = 'User created successfully';
      const result = ResponseHelper.created(data, message);

      expect(result.message).toBe(message);
      expect(result.statusCode).toBe(HttpStatus.CREATED);
    });
  });

  describe('error', () => {
    it('should create an error response with default status', () => {
      const message = 'Something went wrong';
      const result = ResponseHelper.error(message);

      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
      expect(result.success).toBe(false);
      expect(result.message).toBe(message);
      expect(result.data).toBeUndefined();
    });

    it('should create an error response with custom status', () => {
      const message = 'Internal server error';
      const result = ResponseHelper.error(
        message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(result.message).toBe(message);
      expect(result.success).toBe(false);
    });

    it('should handle various HTTP error codes', () => {
      const testCases = [
        { code: HttpStatus.FORBIDDEN, message: 'Forbidden' },
        { code: HttpStatus.CONFLICT, message: 'Conflict' },
        { code: HttpStatus.UNPROCESSABLE_ENTITY, message: 'Validation error' },
      ];

      testCases.forEach((testCase) => {
        const result = ResponseHelper.error(testCase.message, testCase.code);
        expect(result.statusCode).toBe(testCase.code);
        expect(result.message).toBe(testCase.message);
      });
    });
  });

  describe('notFound', () => {
    it('should create a not found response with default message', () => {
      const result = ResponseHelper.notFound();

      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Resource not found');
      expect(result.data).toBeUndefined();
    });

    it('should create a not found response with custom message', () => {
      const message = 'User not found';
      const result = ResponseHelper.notFound(message);

      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
      expect(result.message).toBe(message);
    });
  });

  describe('unauthorized', () => {
    it('should create an unauthorized response with default message', () => {
      const result = ResponseHelper.unauthorized();

      expect(result).toBeInstanceOf(ResponseDto);
      expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Unauthorized');
      expect(result.data).toBeUndefined();
    });

    it('should create an unauthorized response with custom message', () => {
      const message = 'Invalid credentials';
      const result = ResponseHelper.unauthorized(message);

      expect(result.statusCode).toBe(HttpStatus.UNAUTHORIZED);
      expect(result.message).toBe(message);
    });
  });

  describe('Response structure validation', () => {
    it('should always include required fields in success responses', () => {
      const result = ResponseHelper.success({ test: true });

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('data');
    });

    it('should always include required fields in error responses', () => {
      const result = ResponseHelper.error('Error');

      expect(result).toHaveProperty('statusCode');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
    });

    it('should maintain type safety for data', () => {
      interface UserData {
        id: number;
        name: string;
      }

      const userData: UserData = { id: 1, name: 'John' };
      const result = ResponseHelper.success<UserData>(userData);

      expect(result.data).toEqual(userData);
      expect(result.data?.id).toBe(1);
      expect(result.data?.name).toBe('John');
    });
  });
});
