import { Router } from 'express';
import adminOrdersController from './admin.orders.controller.js';

const router = Router();

router.get('/', adminOrdersController.listAll);
router.get('/:id', adminOrdersController.getById);
router.patch('/:id/status', adminOrdersController.updateStatus);

export default router;
