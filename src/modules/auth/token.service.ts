import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { type ConfigType } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';
import authConfig from '@core/config/auth.config.js';
import { AuthUser } from '@common/types/auth-user.js';
import { JwtPayload, TokenPair } from './types/jwt-payload.js';
import { InvalidRefreshTokenError } from './auth.errors.js';

interface StoredRefresh {
  userId: string;
  expiresAt: Date;
  revokedAt: Date | null;
}

@Injectable()
export class TokenService {
    private readonly logger = new Logger(TokenService.name);
    // clave: hash del token. Nunca guardamos el token en claro.
    private readonly refreshTokens = new Map<string, StoredRefresh>();

    constructor(
        private readonly jwt: JwtService,
        @Inject(authConfig.KEY) private readonly config: ConfigType<typeof authConfig>,
    ) {}

    async issue(user: AuthUser): Promise<TokenPair> {
        const payload: JwtPayload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            merchantId: user.merchantId,
        };

        const accessToken = await this.jwt.signAsync(payload);
        const refreshToken = randomBytes(48).toString('base64url');

        this.refreshTokens.set(this.hash(refreshToken), {
            userId: user.id,
            expiresAt: new Date(Date.now() + this.config.refreshTtlDays * 86_400_000),
            revokedAt: null,
        });

        return { accessToken, refreshToken, expiresIn: this.config.accessTtlSeconds };
    }

    verifyAccess(token: string): Promise<JwtPayload> {
        return this.jwt.verifyAsync<JwtPayload>(token);
    }

  /** Consume un refresh (rotación). Devuelve el userId dueño. */
    consumeRefresh(token: string): string {
        const stored = this.refreshTokens.get(this.hash(token));
        if (!stored) throw new InvalidRefreshTokenError();

        if (stored.revokedAt) {
            // un token ya usado volvió a aparecer: probable robo → cerrar todas las sesiones
            this.logger.warn({ msg: 'Reuso de refresh token detectado', userId: stored.userId });
            this.revokeAllForUser(stored.userId);
            throw new InvalidRefreshTokenError();
        }
        if (stored.expiresAt < new Date()) throw new InvalidRefreshTokenError();

        stored.revokedAt = new Date();
        return stored.userId;
    }

    revokeAllForUser(userId: string) {
        for (const t of this.refreshTokens.values()) {
            if (t.userId === userId && !t.revokedAt) t.revokedAt = new Date();
        }
    }

    private hash(token: string) {
        return createHash('sha256').update(token).digest('hex');
    }
}