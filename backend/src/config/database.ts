import mysql from 'mysql2/promise';
import { ENV } from './env.js';

export let pool: mysql.Pool | null = null;
export let isUsingInMemoryFallback = false;

// In-memory data store for fallback development when MySQL server is not connected locally
export const inMemoryStore = {
  users: [] as any[],
  customers: [] as any[],
  products: [] as any[],
  challans: [] as any[],
  challan_items: [] as any[],
};

export const initDatabase = async () => {
  try {
    const connection = mysql.createPool({
      host: ENV.DB.HOST,
      port: ENV.DB.PORT,
      user: ENV.DB.USER,
      password: ENV.DB.PASSWORD,
      database: ENV.DB.NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Test connection
    await connection.getConnection();
    pool = connection;
    console.log(`✅ Connected to MySQL database "${ENV.DB.NAME}" at ${ENV.DB.HOST}:${ENV.DB.PORT}`);
    isUsingInMemoryFallback = false;
  } catch (error: any) {
    console.warn(`⚠️ Could not connect to MySQL server (${error.message}). Operating in high-reliability in-memory storage mode for local development.`);
    isUsingInMemoryFallback = true;
  }
};
