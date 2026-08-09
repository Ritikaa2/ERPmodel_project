import { apiFetch } from './api';
import { User, UserRole } from '../types';

export const usersService = {
  getUsers: async (): Promise<User[]> => {
    return apiFetch<User[]>('/users');
  },

  createUser: async (userData: { name: string; email: string; role: UserRole; password: string }): Promise<User> => {
    return apiFetch<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  updateUserStatus: async (id: number, status: 'ACTIVE' | 'INACTIVE'): Promise<User> => {
    return apiFetch<User>(`/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
};
