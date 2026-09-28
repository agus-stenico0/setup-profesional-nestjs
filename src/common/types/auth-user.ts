export type Role = 'admin' | 'merchant' | 'customer';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  merchantId?: string;
}

