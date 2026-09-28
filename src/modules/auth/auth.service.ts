import { Injectable } from '@nestjs/common';
import { UsersService } from '@modules/users/users.service.js';
import { PasswordService } from './password.service.js';
import { TokenService } from './token.service.js';
import { LoginDto, RegisterDto } from './dto/auth.dto.js';
import { InvalidCredentialsError } from './auth.errors.js';
import { AuthUser } from '@common/types/auth-user.js';
import { UserEntity } from '@modules/users/user.entity.js';

const toAuthUser = (u: UserEntity): AuthUser => ({
    id: u.id,
    email: u.email,
    role: u.role,
    merchantId: u.merchantId,
});

@Injectable()
export class AuthService {
    constructor(
        private readonly users: UsersService,
        private readonly passwords: PasswordService,
        private readonly tokens: TokenService,
    ) {}

    async register(dto: RegisterDto) {
        const user = await this.users.create({
            email: dto.email,
            passwordHash: await this.passwords.hash(dto.password),
            role: 'customer',   // ← NUNCA del DTO: mass assignment
        });
        return this.tokens.issue(toAuthUser(user));
    }

    async login(dto: LoginDto) {
        const user = this.users.findByEmail(dto.email);

        if (!user) {
            await this.passwords.hash('dummy');   // mismo tiempo de respuesta: evita timing attack
            throw new InvalidCredentialsError();
        }
        if (!(await this.passwords.verify(user.passwordHash, dto.password))) {
            throw new InvalidCredentialsError();
        }
        return this.tokens.issue(toAuthUser(user));
    }

    async refresh(refreshToken: string) {
        const userId = this.tokens.consumeRefresh(refreshToken);
        return this.tokens.issue(toAuthUser(this.users.findById(userId)));
    }

    logoutAll(userId: string) {
        this.tokens.revokeAllForUser(userId);
    }

    me(userId: string) {
        return this.users.findById(userId);   // devuelve UserEntity: el serializer quita el hash
    }
}