import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import * as turnadosController from './turnados.controller';

const router = Router();
router.use(authenticate);

router.post('/', turnadosController.turnar);
router.get('/solicitud/:solicitudId', turnadosController.historial);

export default router;