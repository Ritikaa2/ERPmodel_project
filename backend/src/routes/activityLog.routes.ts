import { Router } from 'express';
import { ActivityLogController } from '../controllers/activityLog.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ActivityLogController.getLogs);

export default router;
