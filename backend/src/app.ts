import express from 'express';
import cors from 'cors';
import { ENV } from './config/env.js';
import { errorHandler } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'Mini ERP Portal API', timestamp: new Date() });
});

// Centralized error handler
app.use(errorHandler);

export default app;
