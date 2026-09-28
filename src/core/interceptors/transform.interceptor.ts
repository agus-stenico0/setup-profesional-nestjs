import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { Response } from 'express';
import { SKIP_TRANSFORM_KEY } from '@common/decorators/skip-transform.decorator.js';
import { getRequestContext } from '@core/context/request-context.js';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
    constructor(private readonly reflector: Reflector) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TRANSFORM_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skip) return next.handle();

        return next.handle().pipe(
            map((data) => {
                const res = context.switchToHttp().getResponse<Response>();
                
                if (res.statusCode === 204) return data;
                return {
                    data,
                    meta: {
                        requestId: getRequestContext()?.requestId,
                        timestamp: new Date().toISOString(),
                    },
                };
            }),
        );
    }
}