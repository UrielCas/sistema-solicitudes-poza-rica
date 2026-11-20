import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import * as solicitudesController from './solicitudes.controller';

const router = Router();
router.use(authenticate);

router.get('/check-oficio', solicitudesController.checkOficio);
router.get('/', solicitudesController.list);
router.post('/', solicitudesController.create);
router.get('/:id', solicitudesController.getById);
router.patch('/:id/estatus', solicitudesController.changeStatus);

export default router;