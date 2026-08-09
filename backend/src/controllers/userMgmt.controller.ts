import { Request, Response, NextFunction } from 'express';
import { inMemoryStore } from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { hashPassword } from '../utils/hash';
import { UserRole } from '../constants/roles';

export class UserMgmtController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = inMemoryStore.users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status || 'ACTIVE',
      }));

      return res.status(200).json(ApiResponse.success(users));
    } catch (error) {
      next(error);
    }
  }

  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, role, password } = req.body;

      if (!name || name.trim().length < 2) {
        throw ApiError.badRequest('Name is required');
      }

      if (!email || !email.includes('@')) {
        throw ApiError.badRequest('Valid email address is required');
      }

      const validRoles = [UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS];
      if (!role || !validRoles.includes(role)) {
        throw ApiError.badRequest('Please select a valid role');
      }

      if (!password || password.length < 6) {
        throw ApiError.badRequest('Password must be at least 6 characters');
      }

      const existing = inMemoryStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        throw new ApiError(409, 'User with this email already exists');
      }

      const hashedPassword = await hashPassword(password);
      const newUser = {
        id: inMemoryStore.users.length + 1,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password_hash: hashedPassword,
        role: role,
        status: 'ACTIVE',
      };

      inMemoryStore.users.push(newUser);

      return res.status(201).json(
        ApiResponse.success(
          { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, status: newUser.status },
          'User created successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'ACTIVE' | 'INACTIVE'
      const userId = Number(id);

      const user = inMemoryStore.users.find((u) => u.id === userId);
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      user.status = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

      return res.status(200).json(
        ApiResponse.success(
          { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status },
          `User status updated to ${user.status}`
        )
      );
    } catch (error) {
      next(error);
    }
  }
}
