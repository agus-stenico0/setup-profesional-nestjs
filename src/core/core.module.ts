import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter.js';
import { DomainExceptionFilter } from './filters/domain-exception.filter.js';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './interceptors/logging.interceptor.js';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor.js';
import { TransformInterceptor } from './interceptors/transform.interceptor.js';

@Module({
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_FILTER, useClass: DomainExceptionFilter },
    // el PRIMERO es el más EXTERNO: entra primero, sale último
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },          // mide todo
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },  // aplica @Exclude
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },        // envuelve en data/meta
  ],
})
export class CoreModule {}