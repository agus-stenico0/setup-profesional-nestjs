import {
  CallHandler, ExecutionContext, Inject, Injectable, NestInterceptor, RequestTimeoutException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type ConfigType } from '@nestjs/config';
import { Observable, TimeoutError, catchError, throwError, timeout } from 'rxjs';
import appConfig from '../config/app.config.js';
import { TIMEOUT_KEY } from '@common/decorators/timeout.decorator.js';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        @Inject(appConfig.KEY) private readonly config: ConfigType<typeof appConfig>,
    ) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const ms =
        this.reflector.getAllAndOverride<number>(TIMEOUT_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) ?? this.config.requestTimeoutMs;

        return next.handle().pipe(
            timeout(ms),
            catchError((err) =>
                err instanceof TimeoutError
                ? throwError(() => new RequestTimeoutException('La operación tardó demasiado'))
                : throwError(() => err),
            ),
        );
    }
}