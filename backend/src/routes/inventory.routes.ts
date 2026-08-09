import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', InventoryController.getProducts);
router.post('/', InventoryController.createProduct);
router.patch('/:id/stock', InventoryController.updateStock);
router.get('/movements', InventoryController.getStockMovements);

export default router;
