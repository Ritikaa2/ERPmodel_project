import { hashPassword } from '../utils/hash.js';
import { UserRole } from '../constants/roles.js';
import { pool, isUsingInMemoryFallback, inMemoryStore } from '../config/database.js';

export const seedInitialData = async () => {
  const adminPass = await hashPassword('Admin@123');
  const salesPass = await hashPassword('Sales@123');
  const warehousePass = await hashPassword('Warehouse@123');
  const accountsPass = await hashPassword('Accounts@123');

  const initialUsers = [
    {
      id: 1,
      name: 'Rajesh Sharma',
      email: 'admin@minierp.in',
      password_hash: adminPass,
      role: UserRole.ADMIN,
    },
    {
      id: 2,
      name: 'Priya Verma',
      email: 'sales@minierp.in',
      password_hash: salesPass,
      role: UserRole.SALES,
    },
    {
      id: 3,
      name: 'Vikram Singh',
      email: 'warehouse@minierp.in',
      password_hash: warehousePass,
      role: UserRole.WAREHOUSE,
    },
    {
      id: 4,
      name: 'Amit Patel',
      email: 'accounts@minierp.in',
      password_hash: accountsPass,
      role: UserRole.ACCOUNTS,
    },
  ];

  const initialCustomers = [
    {
      id: 1,
      company_name: 'Rahul Traders & Logistics',
      contact_person: 'Rahul Gupta',
      email: 'rahul@rahultraders.co.in',
      phone: '+91 98200 12345',
      gstin: '27AADCB2234M1Z2',
      address: 'Plot 45, MIDC Industrial Area, Andheri East',
      city: 'Mumbai',
      state: 'Maharashtra',
      status: 'ACTIVE',
    },
    {
      id: 2,
      company_name: 'Metro Electronics India Pvt Ltd',
      contact_person: 'Suresh Kumar',
      email: 'contact@metroelec.in',
      phone: '+91 98450 67890',
      gstin: '29ABCDE1234F1Z5',
      address: '120 SP Road, Electronic City',
      city: 'Bengaluru',
      state: 'Karnataka',
      status: 'ACTIVE',
    },
  ];

  const initialProducts = [
    {
      id: 1,
      sku: 'PRD-IND-001',
      name: 'Heavy Duty Copper Cable 100m',
      category: 'Electrical Components',
      unit: 'Roll',
      price: 4500.0,
      stock_quantity: 45,
      min_stock_level: 10,
      warehouse_location: 'Bay-A1',
    },
    {
      id: 2,
      sku: 'PRD-IND-002',
      name: 'Industrial MCB Switch 32A',
      category: 'Switchgear',
      unit: 'Pcs',
      price: 850.0,
      stock_quantity: 8, // Low stock alert!
      min_stock_level: 15,
      warehouse_location: 'Bay-B3',
    },
  ];

  if (isUsingInMemoryFallback || !pool) {
    inMemoryStore.users = initialUsers;
    inMemoryStore.customers = initialCustomers;
    inMemoryStore.products = initialProducts;
    console.log('✅ Initialized seed data in memory (Admin, Sales, Warehouse, Accounts).');
    return;
  }

  try {
    // Check if table users exists & has data
    const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      for (const u of initialUsers) {
        await pool.query(
          'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
          [u.name, u.email, u.password_hash, u.role]
        );
      }
      console.log('✅ Seeded user accounts in MySQL.');
    }
  } catch (err: any) {
    console.warn('⚠️ Seed DB error:', err.message);
    inMemoryStore.users = initialUsers;
    inMemoryStore.customers = initialCustomers;
    inMemoryStore.products = initialProducts;
  }
};
