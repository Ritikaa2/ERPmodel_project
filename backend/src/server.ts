import app from './app.js';
import { ENV } from './config/env.js';
import { initDatabase } from './config/database.js';
import { seedInitialData } from './db/seed.js';

const startServer = async () => {
  await initDatabase();
  await seedInitialData();

  app.listen(ENV.PORT, () => {
    console.log(`🚀 Mini ERP Backend listening on http://localhost:${ENV.PORT}`);
    console.log(`🔑 Available Demo Accounts:`);
    console.log(`   - Admin: admin@minierp.in / Admin@123`);
    console.log(`   - Sales: sales@minierp.in / Sales@123`);
    console.log(`   - Warehouse: warehouse@minierp.in / Warehouse@123`);
    console.log(`   - Accounts: accounts@minierp.in / Accounts@123`);
  });
};

startServer();
