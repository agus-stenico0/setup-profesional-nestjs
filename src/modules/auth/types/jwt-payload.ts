import { Role } from '@common/types/auth-user.js';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  merchantId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}