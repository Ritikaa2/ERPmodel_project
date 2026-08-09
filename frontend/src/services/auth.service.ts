import { API_BASE_URL, apiFetch, setStoredToken, clearStoredToken } from './api.js';
import { User, LoginResponse, UserRole } from '../types/auth.types.js';
import { signInWithGoogleFirebase } from '../config/firebase.js';

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
  otpCode?: string;
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
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
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

  verifyOTP: async (email: string, otpCode: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Invalid or expired OTP code');
    }
    return true;
  },

  resetPasswordWithOTP: async (email: string, otpCode: string, newPassword: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otpCode, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to reset password');
    }
    return data.message;
  },

  resetPassword: async (token: string, newPassword: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
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

  googleLogin: async (): Promise<User> => {
    try {
      // 1. Trigger Firebase Google Popup
      const firebaseUser = await signInWithGoogleFirebase();

      // 2. Exchange token/user with backend REST API
      const data = await apiFetch<LoginResponse>('/auth/google-login', {
        method: 'POST',
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.name,
          idToken: firebaseUser.idToken,
        }),
      });

      setStoredToken(data.token, true);
      return data.user;
    } catch (error: any) {
      console.warn('Firebase login notice:', error.message);
      throw new Error(
        'Google sign-in is not configured correctly. Check Firebase env vars and add your deployed domain in Firebase Authorized domains.'
      );
    }
  },

  googleAuth: async (): Promise<void> => {
    await authService.googleLogin();
  },

  logout: () => {
    clearStoredToken();
  },
};
