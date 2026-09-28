import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@common/decorators/roles.decorator.js';
import { AuthUser } from '@common/types/auth-user.js';
import { Role } from '@common/types/auth-user.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        
        if (!required?.length) return true;

        const user = context.switchToHttp().getRequest().user as AuthUser | undefined;
        
        if (!user || !required.includes(user.role)) {
            throw new ForbiddenException(`Requiere rol: ${required.join(' o ')}`);
        }
        return true;
    }
}