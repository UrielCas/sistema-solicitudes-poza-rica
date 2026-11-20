import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../core/middleware/auth';
import { authRateLimiter } from '../../core/middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);

export default router;