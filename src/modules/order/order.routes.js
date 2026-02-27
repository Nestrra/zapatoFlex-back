import { Router } from 'express';
import orderController from './order.controller.js';
import authMiddleware from '../../middleware/auth.js';

const router = Router();

router.post('/checkout', authMiddleware.requireAuth, orderController.checkout);
router.get('/', authMiddleware.requireAuth, orderController.listMine);
router.get('/:id', authMiddleware.requireAuth, orderController.getById);

export default router;
