import { Router } from 'express';
import catalogController from './catalog.controller.js';
import authMiddleware from '../../middleware/auth.js';

const router = Router();

// Públicas (catálogo para todos)
router.get('/', catalogController.list);
router.get('/:id', catalogController.getById);

// Solo ADMIN (JWT en header Authorization: Bearer <token>)
router.post('/', authMiddleware.requireAuth, authMiddleware.requireAdmin, catalogController.create);
router.put('/:id', authMiddleware.requireAuth, authMiddleware.requireAdmin, catalogController.update);
router.delete('/:id', authMiddleware.requireAuth, authMiddleware.requireAdmin, catalogController.remove);

export default router;
