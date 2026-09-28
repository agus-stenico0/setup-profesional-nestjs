import { FlagDefinition } from './feature-flag.types.js';

export const FLAG_STORE = Symbol('FLAG_STORE');

export interface FlagStore {
    get(key: string): FlagDefinition | undefined;
    list(): FlagDefinition[];
    save(flag: FlagDefinition): void;
}