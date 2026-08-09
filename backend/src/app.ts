import express from 'express';
import cors from 'cors';
import path from 'path';
import { ENV } from './config/env';
import { errorHandler } from './middlewares/error.middleware';
import authRoutes from './routes/auth.routes';
import crmRoutes from './routes/crm.routes';
import inventoryRoutes from './routes/inventory.routes';
import challanRoutes from './routes/challan.routes';
import reportsRoutes from './routes/reports.routes';
import usersRoutes from './routes/users.routes';
import activityLogRoutes from './routes/activityLog.routes';

const app = express();

app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', crmRoutes);
app.use('/api/products', inventoryRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/logs', activityLogRoutes);

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'Mini ERP Portal API', timestamp: new Date() });
});

// Centralized error handler
app.use(errorHandler);

export default app;
