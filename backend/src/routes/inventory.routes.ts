import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { uploadMiddleware } from '../utils/s3';

const router = Router();

router.use(authenticate);

router.get('/', InventoryController.getProducts);
router.post('/', InventoryController.createProduct);
router.post('/upload-image', uploadMiddleware.single('image'), InventoryController.uploadImage);
router.patch('/:id/stock', InventoryController.updateStock);
router.get('/movements', InventoryController.getStockMovements);

export default router;
