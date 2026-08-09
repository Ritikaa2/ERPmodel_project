import { Router } from 'express';
import { CRMController } from '../controllers/crm.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', CRMController.getCustomers);
router.post('/', CRMController.createCustomer);
router.put('/:id', CRMController.updateCustomer);
router.post('/:id/notes', CRMController.addFollowUpNote);

export default router;
