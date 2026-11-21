import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRoles } from '../../core/middleware/rbac';
import { auditar } from '../../core/middleware/audit';
import * as catalogosController from './catalogos.controller';

const router = Router();
router.use(authenticate);

// Lectura: cualquier cuenta (los necesita el formulario de captura).
router.get('/', catalogosController.listar);
router.get('/agrupados', catalogosController.agrupados);

// Edición: solo Administrador. No hay borrado: se desactiva con { activo: false }.
router.post(
  '/',
  authorizeRoles('SUPERADMIN'),
  auditar('CATALOGO_CREADO', (req) => ({ tipo: req.body?.tipo, valor: req.body?.valor })),
  catalogosController.crear
);
router.patch(
  '/:id',
  authorizeRoles('SUPERADMIN'),
  auditar('CATALOGO_ACTUALIZADO', (req) => ({ ...req.body })),
  catalogosController.actualizar
);

export default router;
