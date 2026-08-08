import { apiFetch, setStoredToken, clearStoredToken } from './api.js';
import { User, LoginResponse, UserRole } from '../types/auth.types.js';

export interface RegisterPayload {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  password: string;
  confirmPassword?: string;
}

export interface ForgotPasswordResponse {
  emailSentTo: string;
  resetToken?: string;
  resetLink?: string;
}

export const authService = {
  register: async (payload: RegisterPayload): Promise<User> => {
    const data = await apiFetch<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    setStoredToken(data.token, true);
    return data.user;
  },

  login: async (email: string, password: string, rememberMe: boolean = true): Promise<User> => {
    const data = await apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setStoredToken(data.token, rememberMe);
    return data.user;
  },

  getMe: async (): Promise<User> => {
    return apiFetch<User>('/auth/me', {
      method: 'GET',
    });
  },

  forgotPassword: async (email: string): Promise<{ message: string; data?: ForgotPasswordResponse }> => {
    const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to process password reset request');
    }
    return { message: data.message, data: data.data };
  },

  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    const response = await fetch('http://localhost:5000/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data.message;
  },

  googleAuth: async (): Promise<void> => {
    const response = await fetch('http://localhost:5000/api/auth/google');
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Google OAuth authentication failed');
    }
  },

  logout: () => {
    clearStoredToken();
  },
};
