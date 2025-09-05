import { HttpStatus } from '@nestjs/common';
import { ResponseDto } from '../dto/response.dto';

export class ResponseHelper {
  // success response
  static success<T>(data: T, message: string = 'Success'): ResponseDto<T> {
    return new ResponseDto(HttpStatus.OK, true, message, data);
  }

  // created response
  static created<T>(
    data: T,
    message: string = 'Created successfully',
  ): ResponseDto<T> {
    return new ResponseDto(HttpStatus.CREATED, true, message, data);
  }

  // error response
  static error(
    message: string,
    statusCode: number = HttpStatus.BAD_REQUEST,
  ): ResponseDto {
    return new ResponseDto(statusCode, false, message);
  }

  // not found
  static notFound(message: string = 'Resource not found'): ResponseDto {
    return new ResponseDto(HttpStatus.NOT_FOUND, false, message);
  }

  // unauthorized response
  static unauthorized(message: string = 'Unauthorized'): ResponseDto {
    return new ResponseDto(HttpStatus.UNAUTHORIZED, false, message);
  }
}
