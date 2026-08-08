import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { UserService } from '../services/user.service.js';
import { comparePassword, hashPassword } from '../utils/hash.js';
import { generateToken } from '../utils/jwt.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { UserRole } from '../constants/roles.js';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, role, password, confirmPassword } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw ApiError.badRequest('Full Name must be at least 2 characters long');
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw ApiError.badRequest('Please enter a valid email address');
      }

      if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''))) {
        throw ApiError.badRequest('Please enter a valid 10-digit Indian mobile number');
      }

      const validRoles = [UserRole.ADMIN, UserRole.SALES, UserRole.WAREHOUSE, UserRole.ACCOUNTS];
      if (!role || !validRoles.includes(role)) {
        throw ApiError.badRequest('Please select a valid role (ADMIN, SALES, WAREHOUSE, ACCOUNTS)');
      }

      if (!password || password.length < 6) {
        throw ApiError.badRequest('Password must be at least 6 characters long');
      }

      if (confirmPassword && password !== confirmPassword) {
        throw ApiError.badRequest('Password confirmation does not match');
      }

      const existing = await UserService.findByEmail(email);
      if (existing) {
        throw new ApiError(409, 'An account with this email address already exists');
      }

      const hashedPassword = await hashPassword(password);
      const newUser = await UserService.createUser({
        name,
        email,
        password_hash: hashedPassword,
        role,
        phone,
      });

      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      return res.status(201).json(
        ApiResponse.success(
          {
            token,
            user: {
              id: newUser.id,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role,
            },
          },
          'Account created successfully'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;

      if (!email || typeof email !== 'string') {
        throw ApiError.badRequest('Email is required');
      }

      if (!password || typeof password !== 'string') {
        throw ApiError.badRequest('Password is required');
      }

      const user = await UserService.findByEmail(email);
      if (!user) {
        throw ApiError.unauthorized('Invalid email address or password');
      }

      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        throw ApiError.unauthorized('Invalid email address or password');
      }

      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return res.status(200).json(
        ApiResponse.success(
          {
            token,
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            },
          },
          'Login successful'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw ApiError.unauthorized();
      }

      const user = await UserService.findById(req.user.userId);
      if (!user) {
        throw ApiError.notFound('User profile not found');
      }

      return res.status(200).json(
        ApiResponse.success({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;

      if (!email || !email.includes('@')) {
        throw ApiError.badRequest('Please provide a valid email address');
      }

      const user = await UserService.findByEmail(email);
      let resetToken: string | null = null;
      let resetLink: string | null = null;

      if (user) {
        resetToken = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 3600000); // 1 hour
        await UserService.saveResetToken(user.email, resetToken, expires);
        resetLink = `http://localhost:5173?screen=reset-password&token=${resetToken}`;
      } else {
        // Generate dummy token format for security simulation
        resetToken = crypto.randomBytes(32).toString('hex');
        resetLink = `http://localhost:5173?screen=reset-password&token=${resetToken}`;
      }

      return res.status(200).json(
        ApiResponse.success(
          {
            emailSentTo: email,
            resetToken,
            resetLink,
          },
          'If an account exists for this email, a password reset link has been sent.'
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;

      if (!token) {
        throw ApiError.badRequest('Reset token is required');
      }

      if (!newPassword || newPassword.length < 6) {
        throw ApiError.badRequest('Password must be at least 6 characters long');
      }

      const newHash = await hashPassword(newPassword);
      const updated = await UserService.updatePasswordByToken(token, newHash);

      if (!updated) {
        throw ApiError.badRequest('Invalid or expired password reset token.');
      }

      return res.status(200).json(
        ApiResponse.success(null, 'Password has been reset successfully. You can now login.')
      );
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(_req: Request, res: Response, next: NextFunction) {
    try {
      const googleClientId = process.env.GOOGLE_CLIENT_ID;
      const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!googleClientId || !googleClientSecret) {
        throw ApiError.badRequest(
          'Google OAuth is not configured in the backend environment. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in backend .env'
        );
      }

      return res.status(501).json(
        ApiResponse.error('Google OAuth backend integration endpoint configured. Redirecting to Google Identity...')
      );
    } catch (error) {
      next(error);
    }
  }
}
