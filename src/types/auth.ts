export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cpfCnpj: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  idToken: string;
  expiresAt: string;
  emailVerified: boolean;
  userId?: string;
  isPlatformAdmin: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
