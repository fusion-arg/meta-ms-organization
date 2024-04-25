import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  InternalServerErrorException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(InternalServerErrorException)
export class InternalServerErrorFilter implements ExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();
    const message = process.env.APP_DEBUG
      ? exception.stack
      : 'Please try later';
    const error = 'Internal Server Error';

    response.status(statusCode).json({
      message,
      error,
      statusCode,
    });
  }
}
