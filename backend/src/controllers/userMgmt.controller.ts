import { Request, Response, NextFunction } from 'express';
import { inMemoryStore, pool } from '../config/database';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { hashPassword } from '../utils/hash';
import { UserRole } from '../constants/roles';

const publicUserFields = (u: any) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  role: u.role,
  status: u.status || 'ACTIVE',
});

export class UserMgmtController {
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      if (pool) {
        const [rows]: any = await pool.query(
          `SELECT id, name, email, role, status FROM users ORDER BY id DESC`
        );
        return res.status(200).json(ApiResponse.success(rows.map(publicUserFields)));
      }

      const users = inMemoryStore.users.map(publicUserFields);
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

      const cleanEmail = email.trim().toLowerCase();
      const hashedPassword = await hashPassword(password);

      if (pool) {
        const [existingRows]: any = await pool.query('SELECT id FROM users WHERE LOWER(email) = ?', [cleanEmail]);
        if (existingRows.length > 0) {
          throw new ApiError(409, 'User with this email already exists');
        }

        const [result]: any = await pool.query(
          `INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'ACTIVE')`,
          [name.trim(), cleanEmail, hashedPassword, role]
        );
        const [rows]: any = await pool.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [result.insertId]);

        return res.status(201).json(ApiResponse.success(publicUserFields(rows[0]), 'User created successfully'));
      }

      const existing = inMemoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        throw new ApiError(409, 'User with this email already exists');
      }

      const newUser = {
        id: inMemoryStore.users.length + 1,
        name: name.trim(),
        email: cleanEmail,
        password_hash: hashedPassword,
        role: role,
        status: 'ACTIVE',
      };

      inMemoryStore.users.push(newUser);
      return res.status(201).json(ApiResponse.success(publicUserFields(newUser), 'User created successfully'));
    } catch (error) {
      next(error);
    }
  }

  static async updateUserStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = Number(id);
      const nextStatus = status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE';

      if (!Number.isInteger(userId)) {
        throw ApiError.badRequest('Invalid user ID');
      }

      if (pool) {
        const [result]: any = await pool.query('UPDATE users SET status = ? WHERE id = ?', [nextStatus, userId]);
        if (result.affectedRows === 0) {
          throw ApiError.notFound('User not found');
        }

        const [rows]: any = await pool.query('SELECT id, name, email, role, status FROM users WHERE id = ?', [userId]);
        return res.status(200).json(ApiResponse.success(publicUserFields(rows[0]), `User status updated to ${nextStatus}`));
      }

      const user = inMemoryStore.users.find((u) => u.id === userId);
      if (!user) {
        throw ApiError.notFound('User not found');
      }

      user.status = nextStatus;
      return res.status(200).json(ApiResponse.success(publicUserFields(user), `User status updated to ${user.status}`));
    } catch (error) {
      next(error);
    }
  }
}
