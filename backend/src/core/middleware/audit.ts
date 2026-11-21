import { Request, Response, NextFunction } from 'express';
import { Schema, model, Types } from 'mongoose';

/**
 * Bitácora de acciones críticas (quién, qué, cuándo, desde dónde).
 * Se guarda en la colección "auditorias"; la consulta el Administrador en GET /reportes/auditoria.
 */
const auditSchema = new Schema(
  {
    accion: { type: String, required: true, index: true },
    usuario: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    rol: { type: String },
    area: { type: Schema.Types.ObjectId, ref: 'Area' },
    metodo: { type: String },
    ruta: { type: String },
    recursoId: { type: String, index: true },
    status: { type: Number },
    ip: { type: String },
    detalle: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditModel = model('Auditoria', auditSchema);

export interface RegistroAuditoria {
  accion: string;
  usuario?: string | Types.ObjectId;
  rol?: string;
  area?: string | Types.ObjectId;
  metodo?: string;
  ruta?: string;
  recursoId?: string;
  status?: number;
  ip?: string;
  detalle?: Record<string, unknown>;
}

/** Registro manual (p. ej. intentos de login). Nunca rompe la petición si falla. */
export const registrarAuditoria = (registro: RegistroAuditoria) =>
  AuditModel.create(registro).catch((err) => console.error('No se pudo registrar auditoría:', err.message));

/**
 * Middleware: registra la acción cuando la respuesta termina con éxito (< 400).
 * `detalle` permite guardar campos puntuales del body (nunca contraseñas).
 */
export const auditar =
  (accion: string, detalle?: (req: Request) => Record<string, unknown>) =>
  (req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 400) return;
      registrarAuditoria({
        accion,
        usuario: req.user?.id,
        rol: req.user?.rol,
        area: req.user?.areaId,
        metodo: req.method,
        ruta: req.originalUrl.split('?')[0],
        recursoId: req.params.id || req.params.solicitudId || res.locals.recursoId,
        status: res.statusCode,
        ip: req.ip,
        detalle: detalle?.(req),
      });
    });
    next();
  };
