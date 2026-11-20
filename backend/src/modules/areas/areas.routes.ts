import { Router } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { authorizeRoles } from '../../core/middleware/rbac';
import * as areasController from './areas.controller';

const router = Router();
router.use(authenticate);

router.get('/', areasController.getAreas);
router.post('/', authorizeRoles('SUPERADMIN'), areasController.createArea);

export default router;