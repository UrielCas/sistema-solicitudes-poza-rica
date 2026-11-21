import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRoles } from '../../core/middleware/rbac';
import { auditar } from '../../core/middleware/audit';
import * as areasController from './areas.controller';

const router = Router();
router.use(authenticate);

router.get('/', areasController.getAreas);
router.post(
  '/',
  authorizeRoles('SUPERADMIN'),
  auditar('AREA_CREADA', (req) => ({ nombre: req.body?.nombre, siglas: req.body?.siglas })),
  areasController.createArea
);

export default router;
