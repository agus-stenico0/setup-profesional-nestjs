import {
  ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Inject, Logger,
} from '@nestjs/common';
import { type ConfigType } from '@nestjs/config';
import { Request, Response } from 'express';
import appConfig from '../config/app.config.js';
import { getRequestContext } from '../context/request-context.js';
import { ErrorCodes } from '@common/errors/error-codes.js';
import { ErrorResponse } from '@common/errors/error-response.interface.js';

const STATUS_TO_CODE: Record<number, string> = {
  400: ErrorCodes.VALIDATION_ERROR,
  401: ErrorCodes.UNAUTHORIZED,
  403: ErrorCodes.FORBIDDEN,
  404: ErrorCodes.NOT_FOUND,
  408: ErrorCodes.REQUEST_TIMEOUT,
  503: ErrorCodes.SERVICE_UNAVAILABLE,
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  constructor(@Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code: string = ErrorCodes.INTERNAL_ERROR;
    let message = 'Ocurrió un error inesperado';
    let details: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = STATUS_TO_CODE[status] ?? ErrorCodes.INTERNAL_ERROR;
      const body = exception.getResponse() as any;

      if (Array.isArray(body?.message)) {
        // errores del ValidationPipe → al campo details, message siempre string
        message = 'Los datos enviados no son válidos';
        details = body.message;
      } else {
        message = typeof body === 'string' ? body : body?.message ?? exception.message;
      }
    } else if (!this.config.isProduction && exception instanceof Error) {
      message = exception.message;   // en desarrollo mostramos el detalle
    }

    const payload: ErrorResponse = {
      statusCode: status,
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: req.url,
      requestId: getRequestContext()?.requestId ?? 'unknown',
    };

    if (status >= 500) {
      this.logger.error({ ...payload, stack: (exception as Error)?.stack });
    } else if (status === 401 || status === 403) {
      this.logger.warn({ code, path: payload.path, requestId: payload.requestId });
    }

    res.status(status).json(payload);
  }
}