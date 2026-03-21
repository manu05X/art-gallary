import apiClient from '@/lib/api';
import { User, AuthResponse, RegisterRequest, LoginRequest, ResetPasswordRequest } from '@/types';

export const authApi = {
  register: async (req: RegisterRequest): Promise<AuthResponse> => {
    const data = await apiClient.post('/auth/register', req);
    return {
      user: {
        id: String(data.userId),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: '',
        updatedAt: '',
      },
      token: data.token,
    };
  },

  login: async (req: LoginRequest): Promise<AuthResponse> => {
    const data = await apiClient.post('/auth/login', req);
    return {
      user: {
        id: String(data.userId),
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        createdAt: '',
        updatedAt: '',
      },
      token: data.token,
    };
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    } as ResetPasswordRequest);
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response;
  },
};
