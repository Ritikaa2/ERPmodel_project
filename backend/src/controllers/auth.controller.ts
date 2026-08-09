import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { UserService } from '../services/user.service';
import { comparePassword, hashPassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';
import { sendOTPEmail } from '../utils/mailer';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, role, password, confirmPassword } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        throw ApiError.badRequest('Full Name must be at least 2 characters long');
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw ApiError.badRequest('Please enter a valid business email address');
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
        throw new ApiError(409, 'An account with this email address already exists. Please sign in instead.');
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

  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, name } = req.body;

      if (!email || !email.includes('@')) {
        throw ApiError.badRequest('Google authentication failed: Email is missing');
      }

      let user = await UserService.findByEmail(email);

      if (!user) {
        // Auto-register new Google user with default SALES role
        const placeholderPassword = await hashPassword(crypto.randomBytes(16).toString('hex'));
        user = await UserService.createUser({
          name: name || email.split('@')[0],
          email,
          password_hash: placeholderPassword,
          role: UserRole.SALES,
        });
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
          'Google authentication successful'
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
        throw ApiError.badRequest('Please provide a valid business email address');
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = await UserService.findByEmail(cleanEmail);
      
      // Generate a 6-digit numeric OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      if (user) {
        await UserService.saveOTP(user.email, otpCode, expires);
        await sendOTPEmail(user.email, otpCode, user.name);
      } else {
        await sendOTPEmail(cleanEmail, otpCode, 'User');
      }

      return res.status(200).json(
        ApiResponse.success(
          {
            emailSentTo: cleanEmail,
            otpCode: process.env.NODE_ENV === 'production' ? undefined : otpCode,
            expiresInMinutes: 15,
          },
          `A 6-digit password reset OTP code has been dispatched to ${cleanEmail}.`
        )
      );
    } catch (error) {
      next(error);
    }
  }

  static async verifyOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode } = req.body;

      if (!email || !email.includes('@')) {
        throw ApiError.badRequest('Valid email is required');
      }

      if (!otpCode || otpCode.length !== 6) {
        throw ApiError.badRequest('Please enter a valid 6-digit OTP code');
      }

      const isValid = await UserService.verifyOTP(email, otpCode);
      if (!isValid) {
        throw ApiError.badRequest('Invalid or expired OTP code. Please check your email or request a new code.');
      }

      return res.status(200).json(
        ApiResponse.success({ verified: true }, 'OTP code verified successfully')
      );
    } catch (error) {
      next(error);
    }
  }

  static async resetPasswordWithOTP(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, otpCode, newPassword } = req.body;

      if (!email || !email.includes('@')) {
        throw ApiError.badRequest('Valid email is required');
      }

      if (!otpCode || otpCode.length !== 6) {
        throw ApiError.badRequest('Please enter a valid 6-digit OTP code');
      }

      if (!newPassword || newPassword.length < 6) {
        throw ApiError.badRequest('New password must be at least 6 characters long');
      }

      const isValid = await UserService.verifyOTP(email, otpCode);
      if (!isValid) {
        throw ApiError.badRequest('Invalid or expired OTP code. Please request a new code.');
      }

      const newHash = await hashPassword(newPassword);
      await UserService.updatePasswordByEmail(email, newHash);

      return res.status(200).json(
        ApiResponse.success(null, 'Password updated successfully! You can now sign in with your new password.')
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
