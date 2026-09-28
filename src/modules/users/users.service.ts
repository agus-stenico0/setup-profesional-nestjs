import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository.js';
import { UserEntity } from './user.entity.js';
import { EmailAlreadyRegisteredError, UserNotFoundError } from './users.errors.js';
import { Role } from '@common/types/auth-user.js';

@Injectable()
export class UsersService {
    constructor(private readonly repo: UsersRepository) {}

    findById(id: string): UserEntity {
        const user = this.repo.findById(id);
        if (!user) throw new UserNotFoundError(id);
        return user;
    }

    findByEmail(email: string): UserEntity | undefined {
        return this.repo.findByEmail(email.toLowerCase().trim());
    }

    async create(data: { email: string; passwordHash: string; role: Role }) {
        const email = data.email.toLowerCase().trim();
        if (this.repo.findByEmail(email)) throw new EmailAlreadyRegisteredError();
        return this.repo.create({ ...data, email });
    }
}