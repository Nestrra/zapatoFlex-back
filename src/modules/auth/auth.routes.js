import { Router } from 'express';
import authController from './auth.controller.js';
import authMiddleware from '../../middleware/auth.js';

const router = Router();

router.get('/me', authMiddleware.requireAuth, authController.getMe);
router.patch('/me', authMiddleware.requireAuth, authController.updateProfile);
router.post('/register', authController.register);
router.post('/login', authController.login);

export default router;
