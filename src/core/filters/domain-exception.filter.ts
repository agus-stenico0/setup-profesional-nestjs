import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import {
  DomainException, NotFoundError, ConflictError, ForbiddenError,
  UnauthorizedError, ValidationError,
} from '@common/errors/domain.exception.js';
import { getRequestContext } from '../context/request-context.js';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();
    const status = this.toStatus(exception);

    res.status(status).json({
      statusCode: status,
      code: exception.code,
      message: exception.message,
      details: exception.details,
      timestamp: new Date().toISOString(),
      path: req.url,
      requestId: getRequestContext()?.requestId ?? 'unknown',
    });
  }

  private toStatus(e: DomainException): number {
    if (e instanceof NotFoundError) return HttpStatus.NOT_FOUND;
    if (e instanceof ConflictError) return HttpStatus.CONFLICT;
    if (e instanceof ForbiddenError) return HttpStatus.FORBIDDEN;
    if (e instanceof UnauthorizedError) return HttpStatus.UNAUTHORIZED;
    if (e instanceof ValidationError) return HttpStatus.UNPROCESSABLE_ENTITY;
    return HttpStatus.BAD_REQUEST;
  }
}