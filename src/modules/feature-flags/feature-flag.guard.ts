import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FEATURE_FLAG_KEY } from '@common/decorators/feature-flag.decorator.js';
import { AuthUser } from '@common/types/auth-user.js';
import { FeatureFlagsService } from './feature-flags.service.js';

@Injectable()
export class FeatureFlagGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly flags: FeatureFlagsService,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const key = this.reflector.getAllAndOverride<string>(FEATURE_FLAG_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!key) return true;

        const user = context.switchToHttp().getRequest().user as AuthUser | undefined;
        const enabled = this.flags.isEnabled(key, { userId: user?.id, merchantId: user?.merchantId });

        // 404, no 403: si la función no está activa para vos, no existe
        if (!enabled) throw new NotFoundException();
        return true;
    }
}