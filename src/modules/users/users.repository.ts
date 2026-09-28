import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import * as argon2 from 'argon2';
import { UserEntity } from './user.entity.js';
import { Role } from '@common/types/auth-user.js';

export const SEED_MERCHANT_ID = 'merchant-pizzeria';

@Injectable()
export class UsersRepository implements OnModuleInit {
    private readonly logger = new Logger(UsersRepository.name);
    private readonly users = new Map<string, UserEntity>();

    async onModuleInit() {
        const passwordHash = await argon2.hash('Password123!', { type: argon2.argon2id });
        const seed: Array<{ email: string; role: Role; merchantId?: string }> = [
            { email: 'admin@orderflow.dev', role: 'admin' },
            { email: 'pizzeria@orderflow.dev', role: 'merchant', merchantId: SEED_MERCHANT_ID },
            { email: 'cliente@orderflow.dev', role: 'customer' },
            { email: 'cliente2@orderflow.dev', role: 'customer' },
        ];
        for (const u of seed) await this.create({ ...u, passwordHash });
        this.logger.log(`Seed: ${seed.length} usuarios (contraseña: Password123!)`);
    }

    findById(id: string): UserEntity | undefined {
        return this.users.get(id);
    }

    findByEmail(email: string): UserEntity | undefined {
        return [...this.users.values()].find((u) => u.email === email);
    }

    async create(data: { email: string; passwordHash: string; role: Role; merchantId?: string }) {
        const user = new UserEntity({ id: randomUUID(), createdAt: new Date(), ...data });
        this.users.set(user.id, user);
        return user;
    }
}