import { hashPassword } from '../utils/hash';
import { UserRole } from '../constants/roles';
import { pool, isUsingInMemoryFallback, inMemoryStore } from '../config/database';

export const seedInitialData = async () => {
  const adminPass = await hashPassword('Admin@123');
  const salesPass = await hashPassword('Sales@123');
  const warehousePass = await hashPassword('Warehouse@123');
  const accountsPass = await hashPassword('Accounts@123');

  const initialUsers = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@minierp.in',
      password_hash: adminPass,
      role: UserRole.ADMIN,
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Sales User',
      email: 'sales@minierp.in',
      password_hash: salesPass,
      role: UserRole.SALES,
      status: 'ACTIVE',
    },
    {
      id: 3,
      name: 'Warehouse User',
      email: 'warehouse@minierp.in',
      password_hash: warehousePass,
      role: UserRole.WAREHOUSE,
      status: 'ACTIVE',
    },
    {
      id: 4,
      name: 'Accounts User',
      email: 'accounts@minierp.in',
      password_hash: accountsPass,
      role: UserRole.ACCOUNTS,
      status: 'ACTIVE',
    },
  ];

  const initialCustomers = [
    {
      id: 1,
      name: 'Rahul Gupta',
      mobile: '9876543210',
      email: 'rahul@rahultraders.com',
      business_name: 'Rahul Traders',
      gstin: '27ABCDE1234F1Z5',
      type: 'Wholesale',
      address: '12, Market Road, Pune, Maharashtra',
      status: 'Active',
      follow_up_date: '2026-05-20',
      notes: 'Interested in laptop bags and accessories.',
    },
    {
      id: 2,
      name: 'Suresh Kumar',
      mobile: '98123456780',
      email: 'suresh@abcretail.in',
      business_name: 'ABC Retail',
      gstin: '29ABCDE1234F1Z5',
      type: 'Retail',
      address: '45 Commercial Street, Bengaluru',
      status: 'Active',
      follow_up_date: '2026-05-21',
      notes: 'Regular retail buyer for peripheral cables.',
    },
    {
      id: 3,
      name: 'Neha Sharma',
      mobile: '9988776655',
      email: 'neha@nehadistributors.com',
      business_name: 'Neha Distributors',
      gstin: '27XYZAB9876C1Z2',
      type: 'Distributor',
      address: '88 MIDC Area, Mumbai',
      status: 'Lead',
      follow_up_date: '2026-05-22',
      notes: 'Potential large wholesale order pending quotation approval.',
    },
    {
      id: 4,
      name: 'Amit Kumar',
      mobile: '9001122334',
      email: 'kumar@kumarstores.in',
      business_name: 'Kumar Stores',
      gstin: '19AAACB1234C1Z1',
      type: 'Retail',
      address: '10 Park Street, Kolkata',
      status: 'Inactive',
      follow_up_date: '2026-05-24',
      notes: 'Account on hold pending payment reconciliation.',
    },
  ];

  const initialProducts = [
    {
      id: 1,
      name: 'Laptop Bag',
      sku: 'BAG001',
      category: 'Bags',
      unit_price: 1200.0,
      stock_quantity: 5,
      min_stock_level: 10,
      location: 'WH-01',
    },
    {
      id: 2,
      name: 'Wireless Mouse',
      sku: 'MOU002',
      category: 'Accessories',
      unit_price: 550.0,
      stock_quantity: 3,
      min_stock_level: 10,
      location: 'WH-01',
    },
    {
      id: 3,
      name: 'Keyboard',
      sku: 'KEY001',
      category: 'Accessories',
      unit_price: 800.0,
      stock_quantity: 8,
      min_stock_level: 15,
      location: 'WH-02',
    },
    {
      id: 4,
      name: 'USB Cable',
      sku: 'USB001',
      category: 'Accessories',
      unit_price: 150.0,
      stock_quantity: 50,
      min_stock_level: 20,
      location: 'WH-02',
    },
  ];

  const initialStockMovements = [
    {
      id: 1,
      product_id: 3,
      product_name: 'Keyboard',
      sku: 'KEY001',
      type: 'OUT',
      quantity: 5,
      reason: 'Sales Challan CH-2026-0018',
      created_by_name: 'Sales User',
      created_at: '2026-05-20T10:00:00.000Z',
    },
    {
      id: 2,
      product_id: 1,
      product_name: 'Laptop Bag',
      sku: 'BAG001',
      type: 'IN',
      quantity: 20,
      reason: 'Purchase Restock',
      created_by_name: 'Admin User',
      created_at: '2026-05-19T14:30:00.000Z',
    },
    {
      id: 3,
      product_id: 2,
      product_name: 'Wireless Mouse',
      sku: 'MOU002',
      type: 'OUT',
      quantity: 2,
      reason: 'Sales Challan CH-2026-0017',
      created_by_name: 'Sales User',
      created_at: '2026-05-18T11:15:00.000Z',
    },
    {
      id: 4,
      product_id: 4,
      product_name: 'USB Cable',
      sku: 'USB001',
      type: 'IN',
      quantity: 50,
      reason: 'Purchase Batch',
      created_by_name: 'Warehouse User',
      created_at: '2026-05-17T09:00:00.000Z',
    },
  ];

  const initialChallans = [
    {
      id: 1,
      challan_number: 'CH-2026-0019',
      customer_id: 1,
      customer_name: 'Rahul Traders',
      total_amount: 5350.0,
      total_quantity: 6,
      status: 'Draft',
      created_by: 2,
      created_by_name: 'Sales User',
      created_at: '2026-05-20T10:00:00.000Z',
    },
    {
      id: 2,
      challan_number: 'CH-2026-0018',
      customer_id: 2,
      customer_name: 'ABC Retail',
      total_amount: 12500.0,
      total_quantity: 10,
      status: 'Confirmed',
      created_by: 2,
      created_by_name: 'Sales User',
      created_at: '2026-05-19T12:00:00.000Z',
    },
    {
      id: 3,
      challan_number: 'CH-2026-0017',
      customer_id: 3,
      customer_name: 'Neha Distributors',
      total_amount: 18200.0,
      total_quantity: 15,
      status: 'Confirmed',
      created_by: 2,
      created_by_name: 'Sales User',
      created_at: '2026-05-18T16:20:00.000Z',
    },
    {
      id: 4,
      challan_number: 'CH-2026-0016',
      customer_id: 4,
      customer_name: 'Kumar Stores',
      total_amount: 5400.0,
      total_quantity: 4,
      status: 'Cancelled',
      created_by: 2,
      created_by_name: 'Sales User',
      created_at: '2026-05-17T15:00:00.000Z',
    },
  ];

  const initialChallanItems = [
    {
      id: 1,
      challan_id: 1,
      product_id: 1,
      product_name: 'Laptop Bag',
      sku: 'BAG001',
      unit_price: 1200.0,
      quantity: 2,
      total_price: 2400.0,
    },
    {
      id: 2,
      challan_id: 1,
      product_id: 3,
      product_name: 'Keyboard',
      sku: 'KEY001',
      unit_price: 800.0,
      quantity: 3,
      total_price: 2400.0,
    },
    {
      id: 3,
      challan_id: 1,
      product_id: 2,
      product_name: 'Wireless Mouse',
      sku: 'MOU002',
      unit_price: 550.0,
      quantity: 1,
      total_price: 550.0,
    },
  ];

  const initialActivityLogs = [
    {
      id: 1,
      action: 'USER_LOGIN',
      details: 'Admin User logged in to Mini ERP Portal',
      user_name: 'Admin User',
      user_email: 'admin@minierp.in',
      created_at: '2026-05-20T09:30:00.000Z',
    },
    {
      id: 2,
      action: 'CHALLAN_CREATED',
      details: 'Created Sales Challan CH-2026-0019 (Amount: ₹5,350)',
      user_name: 'Sales User',
      user_email: 'sales@minierp.in',
      created_at: '2026-05-20T10:00:00.000Z',
    },
    {
      id: 3,
      action: 'STOCK_RESTOCK',
      details: 'Restocked 20 units of Laptop Bag (BAG001)',
      user_name: 'Admin User',
      user_email: 'admin@minierp.in',
      created_at: '2026-05-19T14:30:00.000Z',
    },
  ];

  inMemoryStore.users = initialUsers;
  inMemoryStore.customers = initialCustomers;
  inMemoryStore.products = initialProducts;
  inMemoryStore.challans = initialChallans;
  inMemoryStore.challan_items = initialChallanItems;
  (inMemoryStore as any).stock_movements = initialStockMovements;
  (inMemoryStore as any).activity_logs = initialActivityLogs;

  if (isUsingInMemoryFallback || !pool) {
    console.log('✅ Initialized complete 10-module dataset in memory (Users, Customers, Products, Stock Movements, Challans, Activity Logs).');
    return;
  }

  try {
    const [rows]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    if (rows[0].count === 0) {
      for (const u of initialUsers) {
        await pool.query(
          'INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)',
          [u.name, u.email, u.password_hash, u.role, u.status]
        );
      }
      console.log('✅ Seeded user accounts in MySQL.');
    }
  } catch (err: any) {
    console.warn('⚠️ MySQL seed error:', err.message);
  }
};
