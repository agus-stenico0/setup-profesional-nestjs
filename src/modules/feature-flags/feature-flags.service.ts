import { Inject, Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { FLAG_STORE, type FlagStore } from './flag-store.port.js';
import { FlagContext, FlagDecision } from './feature-flag.types.js';

@Injectable()
export class FeatureFlagsService {
    constructor(@Inject(FLAG_STORE) private readonly store: FlagStore) {}

    isEnabled(key: string, ctx: FlagContext = {}): boolean {
        return this.evaluate(key, ctx).enabled;
    }

    evaluate(key: string, ctx: FlagContext = {}): FlagDecision {
        const flag = this.store.get(key);
        
        if (!flag) return { enabled: false, reason: 'not_found' };
        if (new Date(flag.expiresAt) < new Date()) return { enabled: false, reason: 'expired' };

        const subject = ctx.merchantId ?? ctx.userId;

        if (subject && flag.disabledFor.includes(subject)) return { enabled: false, reason: 'force_disabled' };
        if (subject && flag.enabledFor.includes(subject)) return { enabled: true, reason: 'force_enabled' };
        if (!flag.enabled) return { enabled: false, reason: 'flag_disabled' };
        if (flag.rolloutPercent >= 100) return { enabled: true, reason: 'in_rollout' };
        if (!subject || flag.rolloutPercent <= 0) return { enabled: false, reason: 'out_of_rollout' };

        return this.bucket(key, subject) < flag.rolloutPercent
        ? { enabled: true, reason: 'in_rollout' }
        : { enabled: false, reason: 'out_of_rollout' };
    }

    /** 0..99 estable: el mismo subject cae siempre en el mismo número para el mismo flag. */
    private bucket(key: string, subject: string): number {
        return createHash('sha256').update(`${key}:${subject}`).digest().readUInt32BE(0) % 100;
    }
}