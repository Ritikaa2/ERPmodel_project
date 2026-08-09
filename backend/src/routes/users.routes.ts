import { Router } from 'express';
import { UserMgmtController } from '../controllers/userMgmt.controller';
import { authenticate, authorizeRoles } from '../middlewares/auth.middleware';
import { UserRole } from '../constants/roles';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles(UserRole.ADMIN)); // Only Admin can manage staff user accounts

router.get('/', UserMgmtController.getUsers);
router.post('/', UserMgmtController.createUser);
router.patch('/:id/status', UserMgmtController.updateUserStatus);

export default router;
