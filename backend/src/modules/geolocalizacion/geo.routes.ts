import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticate } from '../../core/middleware/auth';
import * as geoController from './geo.controller';

const router = Router();
router.use(authenticate);

// Protege el servicio gratuito de Nominatim de ráfagas desde una misma cuenta.
const geocodificacionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.user?.id || req.ip || 'anonimo',
  message: { success: false, message: 'Demasiadas búsquedas en el mapa, espera un minuto' },
});

router.get('/reverse', geocodificacionLimiter, geoController.reverse);
router.get('/buscar', geocodificacionLimiter, geoController.buscar);
router.post('/validar', geoController.validar);
router.get('/zonas', geoController.zonas);

export default router;
