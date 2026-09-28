import { Injectable, NestMiddleware, ServiceUnavailableException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { FeatureFlagsService } from './feature-flags.service.js';

@Injectable()
export class MaintenanceMiddleware implements NestMiddleware {
    constructor(private readonly flags: FeatureFlagsService) {}   // ← DI: por eso es clase

    use(_req: Request, _res: Response, next: NextFunction) {
        if (this.flags.isEnabled('maintenance-mode')) {
            throw new ServiceUnavailableException('Estamos en mantenimiento, volvé en unos minutos');
        }
        next();
    }
}