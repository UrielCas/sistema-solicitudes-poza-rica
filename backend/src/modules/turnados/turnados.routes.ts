import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRoles } from '../../core/middleware/rbac';
import { auditar } from '../../core/middleware/audit';
import * as turnadosController from './turnados.controller';

const router = Router();
router.use(authenticate, authorizeRoles('SUPERADMIN'));

router.post(
  '/',
  auditar('SOLICITUD_TURNADA', (req) => ({ solicitudId: req.body?.solicitudId, areaDestino: req.body?.areaDestino })),
  turnadosController.turnar
);
router.get('/solicitud/:solicitudId', turnadosController.historial);

export default router;
