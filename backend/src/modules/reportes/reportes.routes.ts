import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRoles } from '../../core/middleware/rbac';
import { auditar } from '../../core/middleware/audit';
import * as reportesController from './reportes.controller';

// Panel de control, exportaciones y bitácora: solo Administrador.
const router = Router();
router.use(authenticate, authorizeRoles('SUPERADMIN'));

router.get('/dashboard', reportesController.dashboard);
router.get('/excel', auditar('REPORTE_EXCEL', (req) => ({ ...req.query })), reportesController.excel);
router.get('/pdf', auditar('REPORTE_PDF', (req) => ({ ...req.query })), reportesController.pdf);
router.get('/auditoria', reportesController.auditoria);

export default router;
