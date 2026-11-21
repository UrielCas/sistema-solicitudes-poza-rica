import { Router, Request, Response } from 'express';
import { authenticate } from '../../core/middleware/auth';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ok } from '../../core/utils/serializers';
import { parsePagination } from '../../core/utils/pagination';
import * as notificacionesService from './notificaciones.service';

// (El módulo no lleva controller en la estructura acordada: los handlers son cortos y viven aquí.)
const router = Router();
router.use(authenticate);

/** GET /notificaciones?page=1&limit=20&noLeidas=1 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { data, meta } = await notificacionesService.listar(
      req.user!,
      parsePagination(req.query, { defaultLimit: 20, maxLimit: 50 }),
      req.query.noLeidas === '1'
    );
    ok(res, data, meta);
  })
);

router.get(
  '/no-leidas',
  asyncHandler(async (req: Request, res: Response) => {
    ok(res, { total: await notificacionesService.contarNoLeidas(req.user!) });
  })
);

router.patch(
  '/leer-todas',
  asyncHandler(async (req: Request, res: Response) => {
    ok(res, { marcadas: await notificacionesService.marcarTodas(req.user!) });
  })
);

router.patch(
  '/:id/leida',
  asyncHandler(async (req: Request, res: Response) => {
    await notificacionesService.marcarLeida(req.params.id, req.user!);
    ok(res, { id: req.params.id, leida: true });
  })
);

export default router;
