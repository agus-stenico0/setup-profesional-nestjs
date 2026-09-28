import { Global, Module } from '@nestjs/common';
import { FLAG_STORE } from './flag-store.port.js';
import { InMemoryFlagStore } from './in-memory-flag.store.js';
import { FeatureFlagsService } from './feature-flags.service.js';
import { FeatureFlagsController } from './feature-flag.controller.js';

@Global()
@Module({
    controllers: [FeatureFlagsController],
    providers: [
        { provide: FLAG_STORE, useClass: InMemoryFlagStore },   // ← la línea que cambia con Postgres
        FeatureFlagsService,
    ],
    exports: [FeatureFlagsService, FLAG_STORE],
})
export class FeatureFlagsModule {}