import { pool, isUsingInMemoryFallback, inMemoryStore } from '../config/database';
import { UserRole } from '../constants/roles';

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone?: string;
  reset_password_token?: string | null;
  reset_password_expires?: Date | string | null;
  otp_code?: string | null;
  otp_expires?: Date | string | null;
  status?: string;
}

export class UserService {
  static async findByEmail(email: string): Promise<UserDTO | null> {
    const cleanEmail = email.trim().toLowerCase();
    if (isUsingInMemoryFallback || !pool) {
      const found = inMemoryStore.users.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      return found || null;
    }

    try {
      const [rows]: any = await pool.query('SELECT * FROM users WHERE LOWER(email) = ?', [cleanEmail]);
      if (rows && rows.length > 0) {
        return rows[0] as UserDTO;
      }
      return null;
    } catch (err) {
      const found = inMemoryStore.users.find(
        (u) => u.email.toLowerCase() === cleanEmail
      );
      return found || null;
    }
  }

  static async findById(id: number): Promise<UserDTO | null> {
    if (isUsingInMemoryFallback || !pool) {
      const found = inMemoryStore.users.find((u) => u.id === id);
      return found || null;
    }

    try {
      const [rows]: any = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        return rows[0] as UserDTO;
      }
      return null;
    } catch (err) {
      const found = inMemoryStore.users.find((u) => u.id === id);
      return found || null;
    }
  }

  static async createUser(userData: {
    name: string;
    email: string;
    password_hash: string;
    role: UserRole;
    phone?: string;
  }): Promise<UserDTO> {
    const cleanEmail = userData.email.trim().toLowerCase();

    if (isUsingInMemoryFallback || !pool) {
      const newId = inMemoryStore.users.length + 1;
      const newUser: UserDTO = {
        id: newId,
        name: userData.name.trim(),
        email: cleanEmail,
        password_hash: userData.password_hash,
        role: userData.role,
        phone: userData.phone,
        status: 'ACTIVE',
      };
      inMemoryStore.users.push(newUser);
      return newUser;
    }

    try {
      const [result]: any = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [userData.name.trim(), cleanEmail, userData.password_hash, userData.role]
      );
      return {
        id: result.insertId,
        name: userData.name.trim(),
        email: cleanEmail,
        password_hash: userData.password_hash,
        role: userData.role,
        phone: userData.phone,
        status: 'ACTIVE',
      };
    } catch (err) {
      const newId = inMemoryStore.users.length + 1;
      const newUser: UserDTO = {
        id: newId,
        name: userData.name.trim(),
        email: cleanEmail,
        password_hash: userData.password_hash,
        role: userData.role,
        phone: userData.phone,
        status: 'ACTIVE',
      };
      inMemoryStore.users.push(newUser);
      return newUser;
    }
  }

  static async saveOTP(email: string, otpCode: string, expires: Date): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (isUsingInMemoryFallback || !pool) {
      const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.otp_code = otpCode;
        user.otp_expires = expires;
        user.reset_password_token = otpCode;
        user.reset_password_expires = expires;
        return true;
      }
      return false;
    }

    try {
      await pool.query(
        'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE LOWER(email) = ?',
        [otpCode, expires, cleanEmail]
      );
      return true;
    } catch (err) {
      const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.otp_code = otpCode;
        user.otp_expires = expires;
        user.reset_password_token = otpCode;
        user.reset_password_expires = expires;
        return true;
      }
      return false;
    }
  }

  static async saveResetToken(email: string, token: string, expires: Date): Promise<boolean> {
    return this.saveOTP(email, token, expires);
  }

  static async verifyOTP(email: string, otpCode: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    const now = new Date();

    if (isUsingInMemoryFallback || !pool) {
      const user = inMemoryStore.users.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail &&
          (u.otp_code === otpCode || u.reset_password_token === otpCode)
      );

      if (!user) return false;

      const expiresAt = user.otp_expires || user.reset_password_expires;
      return !expiresAt || new Date(expiresAt) > now;
    }

    try {
      const [rows]: any = await pool.query(
        'SELECT * FROM users WHERE LOWER(email) = ? AND reset_password_token = ? AND (reset_password_expires IS NULL OR reset_password_expires > ?)',
        [cleanEmail, otpCode, now]
      );
      return rows && rows.length > 0;
    } catch (err) {
      const user = inMemoryStore.users.find(
        (u) =>
          u.email.toLowerCase() === cleanEmail &&
          (u.otp_code === otpCode || u.reset_password_token === otpCode)
      );

      if (!user) return false;

      const expiresAt = user.otp_expires || user.reset_password_expires;
      return !expiresAt || new Date(expiresAt) > now;
    }
  }

  static async updatePasswordByEmail(email: string, newPasswordHash: string): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (isUsingInMemoryFallback || !pool) {
      const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.password_hash = newPasswordHash;
        user.otp_code = null;
        user.otp_expires = null;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        return true;
      }
      return false;
    }

    try {
      const [result]: any = await pool.query(
        'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE LOWER(email) = ?',
        [newPasswordHash, cleanEmail]
      );
      return result.affectedRows > 0;
    } catch (err) {
      const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.password_hash = newPasswordHash;
        user.otp_code = null;
        user.otp_expires = null;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        return true;
      }
      return false;
    }
  }

  static async updatePasswordByToken(token: string, newPasswordHash: string): Promise<boolean> {
    const now = new Date();
    if (isUsingInMemoryFallback || !pool) {
      const user = inMemoryStore.users.find(
        (u) =>
          (u.reset_password_token === token || u.otp_code === token)
      );
      const expiresAt = user?.otp_expires || user?.reset_password_expires;
      if (user && (!expiresAt || new Date(expiresAt) > now)) {
        user.password_hash = newPasswordHash;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        user.otp_code = null;
        user.otp_expires = null;
        return true;
      }
      return false;
    }

    try {
      const [result]: any = await pool.query(
        'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ? AND (reset_password_expires IS NULL OR reset_password_expires > ?)',
        [newPasswordHash, token, now]
      );
      return result.affectedRows > 0;
    } catch (err) {
      const user = inMemoryStore.users.find(
        (u) =>
          (u.reset_password_token === token || u.otp_code === token)
      );
      const expiresAt = user?.otp_expires || user?.reset_password_expires;
      if (user && (!expiresAt || new Date(expiresAt) > now)) {
        user.password_hash = newPasswordHash;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        user.otp_code = null;
        user.otp_expires = null;
        return true;
      }
      return false;
    }
  }
}
