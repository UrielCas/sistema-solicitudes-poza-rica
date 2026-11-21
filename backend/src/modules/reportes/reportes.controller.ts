import { Request, Response } from 'express';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ok } from '../../core/utils/serializers';
import { parsePagination } from '../../core/utils/pagination';
import * as reportesService from './reportes.service';

const sello = () => new Date().toISOString().slice(0, 10);

export const dashboard = asyncHandler(async (_req: Request, res: Response) => {
  ok(res, await reportesService.getDashboardStats());
});

/** GET /reportes/excel — acepta los mismos filtros que el listado (?anio, ?estatus, ?areaActual…). */
export const excel = asyncHandler(async (req: Request, res: Response) => {
  const buffer = await reportesService.generarExcel(req.query);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="solicitudes_poza_rica_${sello()}.xlsx"`);
  res.send(buffer);
});

/** GET /reportes/pdf — mismos filtros que el Excel. */
export const pdf = asyncHandler(async (req: Request, res: Response) => {
  const buffer = await reportesService.generarPdf(req.query);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="solicitudes_poza_rica_${sello()}.pdf"`);
  res.send(buffer);
});

/** GET /reportes/auditoria?accion=&usuario=&recursoId=&page=&limit= */
export const auditoria = asyncHandler(async (req: Request, res: Response) => {
  const { data, meta } = await reportesService.listarAuditoria(
    req.query,
    parsePagination(req.query, { defaultLimit: 50, maxLimit: 200 })
  );
  ok(res, data, meta);
});
