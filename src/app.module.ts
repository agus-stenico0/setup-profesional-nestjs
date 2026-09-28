import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { validateEnv } from '@core/config/validate-env.js';
import appConfig from '@core/config/app.config.js';
import authConfig from '@core/config/auth.config.js';
import { ConfigModule } from '@nestjs/config';
import { CoreModule } from '@core/core.module.js';
import { HealthModule } from '@modules/health/health.module.js';
import { UsersModule } from '@modules/users/users.module.js';
import { AuthModule } from '@modules/auth/auth.module.js';
import { FeatureFlagsModule } from '@modules/feature-flags/feature-flag.module.js';
import { ProductsModule } from '@modules/products/products.module.js';

import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '@modules/auth/guards/roles.guard.js';
import { FeatureFlagGuard } from '@modules/feature-flags/feature-flag.guard.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'orderflow-core',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
      load: [appConfig, authConfig]
    }),
    CoreModule,
    HealthModule,
    UsersModule,
    AuthModule,
    FeatureFlagsModule,
    ProductsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },   // 1º ¿quién sos?
    { provide: APP_GUARD, useClass: RolesGuard },     // 2º ¿podés?
    { provide: APP_GUARD, useClass: FeatureFlagGuard },   // ¿existe para vos?
  ],
  
})
export class AppModule {}
