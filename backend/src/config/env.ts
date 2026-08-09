import dotenv from 'dotenv';

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
    SECRET: process.env.JWT_SECRET || 'supersecret_jwt_key_mini_erp_2026',
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  },
  SMTP: {
    HOST: process.env.SMTP_HOST || 'smtp.ethereal.email',
    PORT: Number(process.env.SMTP_PORT) || 587,
    USER: process.env.SMTP_USER || '',
    PASS: process.env.SMTP_PASS || '',
    FROM: process.env.SMTP_FROM || 'Mini ERP Portal <noreply@minierp.in>',
  },
  EMAILJS: {
    SERVICE_ID: process.env.EMAILJS_SERVICE_ID || '',
    TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || '',
    PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || '',
    PRIVATE_KEY: process.env.EMAILJS_PRIVATE_KEY || '',
  },
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};
