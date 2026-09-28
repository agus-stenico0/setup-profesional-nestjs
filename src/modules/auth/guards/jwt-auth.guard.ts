import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator.js';
import { getRequestContext } from '@core/context/request-context.js';
import { TokenService } from '../token.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly tokens: TokenService,
        private readonly reflector: Reflector,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // 1. ¿el endpoint es público? (lee lo que anotó @Public)
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        // 2. extraer el token
        const req = context.switchToHttp().getRequest<Request>();
        const [type, token] = req.headers.authorization?.split(' ') ?? [];  

        if (type !== 'Bearer' || !token) {
            throw new UnauthorizedException('Falta el token de autenticación');
        }

        // 3. validarlo y dejar el usuario en el request
        try {
            const payload = await this.tokens.verifyAccess(token);
            (req as any).user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
                merchantId: payload.merchantId,
            };
            
            const ctx = getRequestContext();
            if (ctx) ctx.userId = payload.sub;   // ← los logs ya saben quién es
                return true;
            } catch (e: any) {
            throw new UnauthorizedException(
                e?.name === 'TokenExpiredError' ? 'El token expiró' : 'Token inválido',
            );
        }
    }
}