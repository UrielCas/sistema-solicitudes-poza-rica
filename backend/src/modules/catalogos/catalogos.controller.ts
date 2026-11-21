import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ok, created } from '../../core/utils/serializers';
import { AppError } from '../../core/errors/AppError';
import { esAdmin } from '../../core/middleware/rbac';
import { CatalogoModel, TIPOS_CATALOGO } from './catalogos.model';

const tipoSchema = z.enum(TIPOS_CATALOGO);

const crearSchema = z.object({
  tipo: tipoSchema,
  valor: z.string().trim().min(1, 'El valor es obligatorio').max(120),
  etiqueta: z.string().trim().min(1).max(120).optional(),
  orden: z.coerce.number().int().min(0).optional(),
});

const actualizarSchema = z
  .object({
    etiqueta: z.string().trim().min(1).max(120).optional(),
    orden: z.coerce.number().int().min(0).optional(),
    activo: z.boolean().optional(),
  })
  .refine((d) => Object.keys(d).length > 0, { message: 'No hay cambios que guardar' });

/** GET /catalogos?tipo=TIPO_SOLICITUD — solo activos, salvo el Administrador con ?todos=1. */
export const listar = asyncHandler(async (req: Request, res: Response) => {
  const filtro: Record<string, unknown> = {};
  if (req.query.tipo) filtro.tipo = tipoSchema.parse(req.query.tipo);
  if (!(esAdmin(req.user) && req.query.todos === '1')) filtro.activo = true;
  ok(res, await CatalogoModel.find(filtro).sort({ tipo: 1, orden: 1, etiqueta: 1 }));
});

/** GET /catalogos/agrupados — { TIPO_SOLICITUD: [...], TIPO_PETICION: [...], PRIORIDAD: [...] } */
export const agrupados = asyncHandler(async (_req: Request, res: Response) => {
  const docs = await CatalogoModel.find({ activo: true }).sort({ orden: 1, etiqueta: 1 }).lean();
  const resultado: Record<string, { valor: string; etiqueta: string }[]> = {};
  for (const tipo of TIPOS_CATALOGO) resultado[tipo] = [];
  for (const d of docs) resultado[d.tipo].push({ valor: d.valor, etiqueta: d.etiqueta });
  ok(res, resultado);
});

export const crear = asyncHandler(async (req: Request, res: Response) => {
  const data = crearSchema.parse(req.body);
  if (data.tipo === 'PRIORIDAD') {
    // Las prioridades están ligadas al modelo de solicitudes; solo se editan sus etiquetas.
    throw new AppError('Las prioridades no se pueden agregar, solo renombrar', 400);
  }
  if (await CatalogoModel.exists({ tipo: data.tipo, valor: data.valor })) {
    throw new AppError('Ese valor ya existe en el catálogo', 409);
  }
  const orden = data.orden ?? (await CatalogoModel.countDocuments({ tipo: data.tipo }));
  const doc = await CatalogoModel.create({ ...data, etiqueta: data.etiqueta || data.valor, orden });
  res.locals.recursoId = String(doc._id);
  created(res, doc);
});

export const actualizar = asyncHandler(async (req: Request, res: Response) => {
  const data = actualizarSchema.parse(req.body);
  const doc = await CatalogoModel.findById(req.params.id);
  if (!doc) throw new AppError('Elemento de catálogo no encontrado', 404);
  if (doc.tipo === 'PRIORIDAD' && data.activo === false) {
    throw new AppError('Las prioridades no se pueden desactivar', 400);
  }
  Object.assign(doc, data);
  await doc.save();
  ok(res, doc);
});
