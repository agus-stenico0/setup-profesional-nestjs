import { Body, Controller, Get, HttpCode, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@common/decorators/current-user.decorator.js';
import { Roles } from '@common/decorators/roles.decorator.js';
import { type AuthUser } from '@common/types/auth-user.js';
import { NotFoundError } from '@common/errors/domain.exception.js';
import { ErrorCodes } from '@common/errors/error-codes.js';
import { FLAG_STORE, type FlagStore } from './flag-store.port.js';
import { FeatureFlagsService } from './feature-flags.service.js';
import { UpdateFlagDto } from './dto/update-flag.dto.js';

class FlagNotFoundError extends NotFoundError {
    readonly code = ErrorCodes.FLAG_NOT_FOUND;
    constructor(key: string) {
        super(`El flag ${key} no existe`, { key });
    }
}

@Controller('feature-flags')
export class FeatureFlagsController {
    constructor(
        private readonly flags: FeatureFlagsService,
        @Inject(FLAG_STORE) private readonly store: FlagStore,
    ) {}

    /** Lo que el front necesita: qué está prendido PARA MÍ. Nunca las reglas. */
    @Get('me')
    mine(@CurrentUser() user: AuthUser) {
        const ctx = { userId: user.id, merchantId: user.merchantId };
        return Object.fromEntries(this.store.list().map((f) => [f.key, this.flags.isEnabled(f.key, ctx)]));
    }

    @Roles('admin')
    @Get()
    list() {
        return this.store.list();
    }

    @Roles('admin')
    @Get(':key/evaluate')
    evaluate(@Param('key') key: string, @Query('userId') userId?: string, @Query('merchantId') merchantId?: string) {
        return this.flags.evaluate(key, { userId, merchantId });
    }

    @Roles('admin')
    @Patch(':key')
    update(@Param('key') key: string, @Body() dto: UpdateFlagDto) {
        const flag = this.store.get(key);
        if (!flag) throw new FlagNotFoundError(key);
        const updated = {
            ...flag,
            enabled: dto.enabled ?? flag.enabled,
            rolloutPercent: dto.rolloutPercent ?? flag.rolloutPercent,
            enabledFor: dto.enabledFor ?? flag.enabledFor,
            disabledFor: dto.disabledFor ?? flag.disabledFor,
        };
        this.store.save(updated);
        return updated;
    }

    @Roles('admin')
    @Post(':key/kill')
    @HttpCode(200)
    kill(@Param('key') key: string) {
        return this.update(key, { enabled: false });
    }
}