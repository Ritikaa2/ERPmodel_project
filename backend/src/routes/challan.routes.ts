import { Router } from 'express';
import { ChallanController } from '../controllers/challan.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ChallanController.getChallans);
router.get('/:id', ChallanController.getChallanById);
router.post('/', ChallanController.createChallan);
router.patch('/:id/status', ChallanController.updateChallanStatus);

export default router;
