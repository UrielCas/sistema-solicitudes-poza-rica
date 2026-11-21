import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRoles } from '../../core/middleware/rbac';
import { auditar } from '../../core/middleware/audit';
import * as evidenciasController from './evidencias.controller';

// El acceso por área lo valida el servicio: Administrador = todas; área = solo sus solicitudes.
const router = Router();
router.use(authenticate);

router.get('/solicitud/:solicitudId', evidenciasController.listar);
router.post(
  '/solicitud/:solicitudId',
  evidenciasController.verificarAcceso,
  evidenciasController.recibirArchivo,
  auditar('EVIDENCIA_AGREGADA'),
  evidenciasController.agregar
);
router.get('/solicitud/:solicitudId/:evidenciaId/descargar', evidenciasController.descargar);
router.delete(
  '/solicitud/:solicitudId/:evidenciaId',
  authorizeRoles('SUPERADMIN'),
  auditar('EVIDENCIA_ELIMINADA', (req) => ({ evidenciaId: req.params.evidenciaId })),
  evidenciasController.eliminar
);

export default router;
