export type UserRole = 'ADMIN' | 'SHOP_OWNER' | 'USER';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
}
