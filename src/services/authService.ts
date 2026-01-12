import { api } from '../config';
import type { 
  LoginRequest, 
  RegisterUserRequest, 
  ForgotPasswordRequest, 
  AuthSession,
  RefreshTokenRequest 
} from '../types';

export const authService = {
  login: async (data: LoginRequest): Promise<AuthSession> => {
    const response = await api.post<AuthSession>('/api/Auth', data);
    return response.data;
  },

  register: async (data: RegisterUserRequest): Promise<void> => {
    await api.post('/api/Auth/register', data);
  },

  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    await api.post('/api/Auth/forgot-password', data);
  },

  refreshToken: async (data: RefreshTokenRequest): Promise<AuthSession> => {
    const response = await api.post<AuthSession>('/api/Auth/refresh-token', data);
    return response.data;
  },
};
