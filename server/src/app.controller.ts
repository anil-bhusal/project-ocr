import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import { ResponseHelper } from './common/utils/response-helper';
import { ResponseDto } from './common/dto/response.dto';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns a simple greeting to verify the API is running',
  })
  @ApiResponse({
    status: 200,
    description: 'API is running successfully',
    schema: {
      type: 'object',
      example: {
        statusCode: 200,
        success: true,
        message: 'API is running successfully',
        data: 'Hello World!',
      },
    },
  })
  getHello(): ResponseDto<string> {
    const greeting = this.appService.getHello();
    return ResponseHelper.success(greeting, 'API is running successfully');
  }
}
