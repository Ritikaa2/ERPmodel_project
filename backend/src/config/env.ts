import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DB: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: Number(process.env.DB_PORT) || 3306,
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '',
    NAME: process.env.DB_NAME || 'mini_erp_db',
  },
  JWT: {
    SECRET: process.env.JWT_SECRET || 'fallback_secret_key_dev',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
