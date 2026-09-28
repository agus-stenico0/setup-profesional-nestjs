import { SetMetadata } from '@nestjs/common';

export const TIMEOUT_KEY = 'timeoutMs';

export const Timeout = (ms: number) => SetMetadata(TIMEOUT_KEY, ms);