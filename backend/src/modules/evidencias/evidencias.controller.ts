import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ok, created, mensaje } from '../../core/utils/serializers';
import { AppError } from '../../core/errors/AppError';
import * as evidenciasService from './evidencias.service';

const enlaceSchema = z.object({
  enlace: z
    .string()
    .trim()
    .url('El enlace no es una URL válida')
    .refine((u) => /^https:\/\//i.test(u), 'El enlace debe empezar con https://'),
  nombre: z.string().trim().max(200).optional(),
  descripcion: z.string().trim().max(500).optional(),
});

/** Antes de multer: la solicitud existe y la cuenta tiene acceso (evita escribir archivos ajenos). */
export const verificarAcceso = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  await evidenciasService.cargarSolicitudConAcceso(req.params.solicitudId, req.user!);
  next();
});

/** multer.single('archivo') con errores traducidos. Si no viene archivo, sigue (puede ser un enlace). */
export const recibirArchivo = (req: Request, res: Response, next: NextFunction) => {
  if (!req.is('multipart/form-data')) return next();
  evidenciasService.upload.single('archivo')(req, res, (err) => next(err ? evidenciasService.errorDeCarga(err) : undefined));
};

export const listar = asyncHandler(async (req: Request, res: Response) => {
  ok(res, await evidenciasService.listar(req.params.solicitudId, req.user!));
});

/** POST multipart (campo "archivo" + "descripcion") o JSON { enlace, nombre?, descripcion? }. */
export const agregar = asyncHandler(async (req: Request, res: Response) => {
  try {
    if (req.file) {
      const descripcion = typeof req.body?.descripcion === 'string' ? req.body.descripcion.trim() : undefined;
      const e = await evidenciasService.agregarArchivo(req.params.solicitudId, req.file, descripcion, req.user!);
      res.locals.recursoId = String(e._id);
      return created(res, e);
    }
    if (req.is('multipart/form-data')) throw new AppError('Adjunta un archivo en el campo "archivo"', 400);
    const e = await evidenciasService.agregarEnlace(req.params.solicitudId, enlaceSchema.parse(req.body), req.user!);
    res.locals.recursoId = String(e._id);
    created(res, e);
  } catch (err) {
    evidenciasService.descartarArchivo(req.file);
    throw err;
  }
});

export const descargar = asyncHandler(async (req: Request, res: Response) => {
  const { ruta, nombre, mimetype } = await evidenciasService.obtenerArchivo(
    req.params.solicitudId,
    req.params.evidenciaId,
    req.user!
  );
  if (mimetype) res.type(mimetype);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.download(ruta, nombre);
});

export const eliminar = asyncHandler(async (req: Request, res: Response) => {
  await evidenciasService.eliminar(req.params.solicitudId, req.params.evidenciaId, req.user!);
  mensaje(res, 'Evidencia eliminada');
});
