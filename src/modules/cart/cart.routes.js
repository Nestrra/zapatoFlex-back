import { Router } from 'express';
import cartController from './cart.controller.js';
import authMiddleware from '../../middleware/auth.js';

const router = Router();

// Todas las rutas de carrito requieren usuario autenticado (no necesariamente ADMIN)
router.get('/', authMiddleware.requireAuth, cartController.getCart);
router.post('/items', authMiddleware.requireAuth, cartController.addItem);
router.put('/items/:itemId', authMiddleware.requireAuth, cartController.updateItem);
router.delete('/items/:itemId', authMiddleware.requireAuth, cartController.removeItem);

export default router;
