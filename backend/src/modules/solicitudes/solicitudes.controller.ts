import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ok, created } from '../../core/utils/serializers';
import { pidePaginacion, parsePagination } from '../../core/utils/pagination';
import { esAdmin } from '../../core/middleware/rbac';
import * as solicitudesService from './solicitudes.service';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const doc = await solicitudesService.createSolicitud(req.body, req.user!);
  res.locals.recursoId = String(doc._id);
  created(res, doc);
});

export const checkOficio = asyncHandler(async (req: Request, res: Response) => {
  const docs = await solicitudesService.checkCoincidenciasOficio(String(req.query.q || ''));
  // Las áreas solo ven que existe el expediente, no los datos del solicitante.
  const data = esAdmin(req.user)
    ? docs
    : docs.map((d: any) => ({ _id: d._id, folio: d.folio, folioOficialia: d.folioOficialia, estatus: d.estatus }));
  ok(res, data);
});

/** GET /solicitudes — lista completa; con ?page=&limit= devuelve una página y `meta`. */
export const list = asyncHandler(async (req: Request, res: Response) => {
  const paginacion = pidePaginacion(req.query) ? parsePagination(req.query) : undefined;
  const { data, meta } = await solicitudesService.listSolicitudes(req.query, paginacion);
  ok(res, data, meta);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await solicitudesService.getSolicitudById(req.params.id));
});

export const changeStatus = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await solicitudesService.updateEstatus(req.params.id, req.body.estatus));
});
