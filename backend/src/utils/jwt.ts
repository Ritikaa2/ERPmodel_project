import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { UserRole } from '../constants/roles.js';

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, ENV.JWT.SECRET, {
    expiresIn: ENV.JWT.EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, ENV.JWT.SECRET) as TokenPayload;
};
