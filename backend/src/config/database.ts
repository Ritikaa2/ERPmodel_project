import mysql from 'mysql2/promise';
import { ENV } from './env';

export let pool: mysql.Pool | null = null;
export let isUsingInMemoryFallback = false;

export const inMemoryStore = {
  users: [] as any[],
  customers: [] as any[],
  products: [] as any[],
  challans: [] as any[],
  challan_items: [] as any[],
  stock_movements: [] as any[],
  activity_logs: [] as any[],
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

    const conn = await connection.getConnection();
    conn.release();

    pool = connection;
    isUsingInMemoryFallback = false;

    console.log(
      `✅ Connected to MySQL database "${ENV.DB.NAME}" at ${ENV.DB.HOST}:${ENV.DB.PORT}`
    );
  } catch (error: any) {
    console.error(`❌ MySQL connection failed: ${error.message}`);

    pool = null;
    isUsingInMemoryFallback = true;

    console.warn('⚠️ Using in-memory fallback storage.');
  }
};
