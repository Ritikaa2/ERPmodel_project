import { pool, isUsingInMemoryFallback, inMemoryStore } from '../config/database.js';
import { UserRole } from '../constants/roles.js';

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: UserRole;
  phone?: string;
  reset_password_token?: string | null;
  reset_password_expires?: Date | string | null;
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
      };
      inMemoryStore.users.push(newUser);
      return newUser;
    }
  }

  static async saveResetToken(email: string, token: string, expires: Date): Promise<boolean> {
    const cleanEmail = email.trim().toLowerCase();
    if (isUsingInMemoryFallback || !pool) {
      const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.reset_password_token = token;
        user.reset_password_expires = expires;
        return true;
      }
      return false;
    }

    try {
      await pool.query(
        'UPDATE users SET reset_password_token = ?, reset_password_expires = ? WHERE LOWER(email) = ?',
        [token, expires, cleanEmail]
      );
      return true;
    } catch (err) {
      const user = inMemoryStore.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (user) {
        user.reset_password_token = token;
        user.reset_password_expires = expires;
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
          u.reset_password_token === token &&
          u.reset_password_expires &&
          new Date(u.reset_password_expires) > now
      );
      if (user) {
        user.password_hash = newPasswordHash;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        return true;
      }
      return false;
    }

    try {
      const [result]: any = await pool.query(
        'UPDATE users SET password_hash = ?, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = ? AND reset_password_expires > ?',
        [newPasswordHash, token, now]
      );
      return result.affectedRows > 0;
    } catch (err) {
      const user = inMemoryStore.users.find(
        (u) =>
          u.reset_password_token === token &&
          u.reset_password_expires &&
          new Date(u.reset_password_expires) > now
      );
      if (user) {
        user.password_hash = newPasswordHash;
        user.reset_password_token = null;
        user.reset_password_expires = null;
        return true;
      }
      return false;
    }
  }
}
