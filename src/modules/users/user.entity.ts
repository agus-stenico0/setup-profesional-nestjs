import { Exclude } from 'class-transformer';
import { Role } from '@common/types/auth-user.js';

export class UserEntity {
  id!: string;
  email!: string;
  role!: Role;
  merchantId?: string;
  createdAt!: Date;

  @Exclude()
  passwordHash!: string;   // ← nunca sale por HTTP

  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }
}