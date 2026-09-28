import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import appConfig from '@core/config/app.config.js';
import { ConfigType } from '@nestjs/config';
import { requestContextMiddleware } from '@core/context/request-context.middleware.js';

/** Todo lo que NO puede ir en un módulo. Lo usan main.ts y los tests e2e. */
export function setupApp(app: NestExpressApplication): NestExpressApplication {
  const config = app.get<ConfigType<typeof appConfig>>(appConfig.KEY);

  app.use(requestContextMiddleware);   // primero de todo
  app.use(helmet());
  app.enableCors({ origin: config.corsOrigins, credentials: true });
  app.setGlobalPrefix(config.apiPrefix);
  app.enableShutdownHooks();

  return app;
}