import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request, Response } from 'express';
import { getRequestContext } from '../context/request-context.js';

const SLOW_MS = 1000;

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (context.getType() !== 'http') return next.handle();

        const req = context.switchToHttp().getRequest<Request>();
        const res = context.switchToHttp().getResponse<Response>();
        const start = Date.now();

        const base = () => ({
            method: req.method,
            route: req.route?.path,                                        // ← /products/:id
            handler: `${context.getClass().name}.${context.getHandler().name}`,
            requestId: getRequestContext()?.requestId,
            userId: getRequestContext()?.userId,
            durationMs: Date.now() - start,
        });

        return next.handle().pipe(
        tap({
            next: () => {
                const data = { ...base(), statusCode: res.statusCode };
                data.durationMs > SLOW_MS ? this.logger.warn({ ...data, slow: true }) : this.logger.log(data);
            },
            error: (err: Error) => {
                this.logger.warn({ ...base(), error: err.constructor.name, message: err.message });
            },
        }),
        );
    }
}