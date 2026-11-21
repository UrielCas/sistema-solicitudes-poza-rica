import { Router } from 'express';
import * as authController from './auth.controller';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRoles } from '../../core/middleware/rbac';
import { authRateLimiter } from '../../core/middleware/rateLimiter';
import { auditar } from '../../core/middleware/audit';

const router = Router();

// Solo el Administrador puede dar de alta cuentas nuevas.
router.post(
  '/register',
  authenticate,
  authorizeRoles('SUPERADMIN'),
  auditar('USUARIO_CREADO', (req) => ({ email: req.body?.email, rol: req.body?.rol })),
  authController.register
);
router.post('/login', authRateLimiter, authController.login);
router.get('/areas-login', authController.areasLogin);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);
router.patch(
  '/credenciales',
  authenticate,
  authRateLimiter,
  auditar('CREDENCIALES_ACTUALIZADAS', (req) => ({
    cambioUsuario: !!req.body?.nuevoEmail,
    cambioPassword: !!req.body?.nuevaPassword,
  })),
  authController.updateCredenciales
);

export default router;
