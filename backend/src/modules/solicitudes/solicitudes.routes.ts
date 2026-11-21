import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRoles } from '../../core/middleware/rbac';
import { auditar } from '../../core/middleware/audit';
import * as solicitudesController from './solicitudes.controller';

const router = Router();
router.use(authenticate);

// Cualquier área autenticada puede capturar solicitudes (quedan ligadas a su área).
router.post(
  '/',
  auditar('SOLICITUD_CREADA', (req) => ({ tipoSolicitud: req.body?.tipoSolicitud })),
  solicitudesController.create
);
router.get('/check-oficio', solicitudesController.checkOficio);

// Consulta, mapa consolidado y seguimiento: solo Administrador.
router.get('/', authorizeRoles('SUPERADMIN'), solicitudesController.list);
router.get('/:id', authorizeRoles('SUPERADMIN'), solicitudesController.getById);
router.patch(
  '/:id/estatus',
  authorizeRoles('SUPERADMIN'),
  auditar('ESTATUS_CAMBIADO', (req) => ({ estatus: req.body?.estatus })),
  solicitudesController.changeStatus
);

export default router;
