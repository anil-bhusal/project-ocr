import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ThrottlerException } from '@nestjs/throttler';

@Catch()
export class SecurityExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('SecurityExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // sandle specific exception types (check ThrottlerException first since it extends HttpException)
    if (exception instanceof ThrottlerException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = 'Too many requests, please try again later';
      
      // log rate limit violations for security monitoring
      this.logger.warn(`Rate limit exceeded: ${request.ip} - ${request.method} ${request.url}`);
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      }
    } else if (exception instanceof Error) {
      // handle known errors (preserve existing ocr error messages)
      if (exception.message.includes('No file uploaded')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'No file uploaded';
      } else if (exception.message.includes('OCR processing failed')) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'OCR processing failed';
      } else if (exception.message.includes('File buffer is empty')) {
        status = HttpStatus.BAD_REQUEST;
        message = 'File buffer is empty';
      } else if (exception.message.includes('OCR API')) {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'OCR service temporarily unavailable';
      } else {
        // unknown errors, use generic message in production
        if (process.env.NODE_ENV === 'production') {
          message = 'An error occurred while processing your request';
        } else {
          message = exception.message;
        }
      }
    }

    // log security-relevant errors
    if (status >= 400) {
      const errorDetails = {
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
        status,
        message: typeof exception === 'object' && exception !== null && 'message' in exception 
          ? (exception as Error).message 
          : 'Unknown error',
      };

      if (status >= 500) {
        this.logger.error('Server error occurred', JSON.stringify(errorDetails));
      } else if (status === 429) {
        this.logger.warn('Rate limit violation', JSON.stringify(errorDetails));
      } else if (status >= 400) {
        this.logger.log('Client error', JSON.stringify(errorDetails));
      }
    }

    // send response (maintaining existing API contract)
    const errorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // don't include stack traces in production
    if (process.env.NODE_ENV !== 'production' && exception instanceof Error && exception.stack) {
      (errorResponse as any).stack = exception.stack;
    }

    response.status(status).json(errorResponse);
  }
}