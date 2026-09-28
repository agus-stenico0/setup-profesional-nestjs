import { Injectable } from '@nestjs/common';
import { FlagStore } from './flag-store.port.js';
import { FlagDefinition } from './feature-flag.types.js';
import { FLAGS_SEED } from './flags.seed.js';

@Injectable()
export class InMemoryFlagStore implements FlagStore {
    private readonly flags = new Map(FLAGS_SEED.map((f) => [f.key, { ...f }]));

    get(key: string) {
        return this.flags.get(key);
    }

    list() {
        return [...this.flags.values()];
    }

    save(flag: FlagDefinition) {
        this.flags.set(flag.key, flag);
    }
}