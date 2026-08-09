import { Router } from 'express';
import { ReportsController } from '../controllers/reports.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/analytics', ReportsController.getAnalytics);

export default router;
