import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import multer from 'multer';
import { Types } from 'mongoose';
import { env } from '../../config/env';
import { AppError } from '../../core/errors/AppError';
import { JwtPayload } from '../../core/middleware/auth';
import { assertAccesoArea, esAdmin } from '../../core/middleware/rbac';
import { SolicitudModel } from '../solicitudes/solicitudes.model';
import { notificarEvidencia } from '../notificaciones/notificaciones.service';

/**
 * Evidencias de una solicitud: archivos guardados en el servidor (UPLOADS_DIR/evidencias/<solicitud>/)
 * o enlaces externos (Google Drive, OneDrive…). Para S3 basta con cambiar `storage` y `rutaArchivo`.
 */

export const RAIZ_UPLOADS = path.resolve(process.cwd(), env.UPLOADS_DIR);
const DIR_EVIDENCIAS = path.join(RAIZ_UPLOADS, 'evidencias');

/** Tipos permitidos: extensión → mimetypes aceptados. */
const PERMITIDOS: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg'],
  '.jpeg': ['image/jpeg'],
  '.png': ['image/png'],
  '.webp': ['image/webp'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  '.xls': ['application/vnd.ms-excel'],
  '.xlsx': ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
};

/** Carga la solicitud y comprueba que la cuenta pueda operar sobre ella (Administrador o su área). */
export const cargarSolicitudConAcceso = async (solicitudId: string, user: JwtPayload) => {
  if (!Types.ObjectId.isValid(solicitudId)) throw new AppError('Solicitud no encontrada', 404);
  const solicitud = await SolicitudModel.findById(solicitudId);
  if (!solicitud) throw new AppError('Solicitud no encontrada', 404);
  assertAccesoArea(user, solicitud.areaActual);
  return solicitud;
};

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const dir = path.join(DIR_EVIDENCIAS, String(req.params.solicitudId));
    fs.mkdir(dir, { recursive: true }, (err) => cb(err, dir));
  },
  // Nombre aleatorio: nunca se usa el nombre que manda el cliente para escribir en disco.
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: env.EVIDENCIA_MAX_MB * 1024 * 1024, files: 1, fields: 5 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (PERMITIDOS[ext]?.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Tipo de archivo no permitido. Usa PDF, imagen (JPG, PNG, WEBP), Word o Excel.', 400));
  },
});

/** Traduce los errores de multer a mensajes en español. */
export const errorDeCarga = (err: unknown) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') return new AppError(`El archivo supera ${env.EVIDENCIA_MAX_MB} MB`, 413);
    if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
      return new AppError('Envía un solo archivo en el campo "archivo"', 400);
    }
    return new AppError('No se pudo procesar el archivo', 400);
  }
  return err;
};

const serializar = (e: any) => ({
  _id: e._id,
  tipo: e.tipo,
  nombre: e.nombre,
  descripcion: e.descripcion,
  mimetype: e.mimetype,
  tamano: e.tamano,
  enlace: e.enlace,
  subidoPor: e.subidoPor,
  createdAt: e.createdAt,
});

export const listar = async (solicitudId: string, user: JwtPayload) => {
  const s = await cargarSolicitudConAcceso(solicitudId, user);
  await s.populate('evidencias.subidoPor', 'nombre');
  return s.evidencias.map(serializar).reverse();
};

const avisarSiEsArea = (s: any, nombre: string, user: JwtPayload) => {
  if (!esAdmin(user)) notificarEvidencia(s, nombre);
};

export const agregarArchivo = async (
  solicitudId: string,
  file: Express.Multer.File,
  descripcion: string | undefined,
  user: JwtPayload
) => {
  const s = await cargarSolicitudConAcceso(solicitudId, user);
  s.evidencias.push({
    tipo: 'ARCHIVO',
    nombre: path.basename(file.originalname).slice(0, 200),
    descripcion: descripcion?.slice(0, 500),
    archivo: path.relative(RAIZ_UPLOADS, file.path).split(path.sep).join('/'),
    mimetype: file.mimetype,
    tamano: file.size,
    subidoPor: new Types.ObjectId(user.id),
  });
  await s.save();
  const nueva = s.evidencias[s.evidencias.length - 1];
  avisarSiEsArea(s, nueva.nombre, user);
  return serializar(nueva);
};

export const agregarEnlace = async (
  solicitudId: string,
  datos: { enlace: string; nombre?: string; descripcion?: string },
  user: JwtPayload
) => {
  const s = await cargarSolicitudConAcceso(solicitudId, user);
  s.evidencias.push({
    tipo: 'ENLACE',
    nombre: datos.nombre || datos.enlace,
    descripcion: datos.descripcion,
    enlace: datos.enlace,
    subidoPor: new Types.ObjectId(user.id),
  });
  await s.save();
  const nueva = s.evidencias[s.evidencias.length - 1];
  avisarSiEsArea(s, nueva.nombre, user);
  return serializar(nueva);
};

/** Ruta absoluta del archivo, verificando que no se salga de la carpeta de evidencias. */
const rutaArchivo = (relativa: string) => {
  const absoluta = path.resolve(RAIZ_UPLOADS, relativa);
  if (!absoluta.startsWith(DIR_EVIDENCIAS + path.sep)) throw new AppError('Archivo no válido', 400);
  return absoluta;
};

export const obtenerArchivo = async (solicitudId: string, evidenciaId: string, user: JwtPayload) => {
  const s = await cargarSolicitudConAcceso(solicitudId, user);
  const e = Types.ObjectId.isValid(evidenciaId) ? s.evidencias.id(evidenciaId) : null;
  if (!e) throw new AppError('Evidencia no encontrada', 404);
  if (e.tipo !== 'ARCHIVO' || !e.archivo) throw new AppError('Esta evidencia es un enlace, no un archivo', 400);
  const ruta = rutaArchivo(e.archivo);
  if (!fs.existsSync(ruta)) throw new AppError('El archivo ya no existe en el servidor', 410);
  return { ruta, nombre: e.nombre, mimetype: e.mimetype };
};

export const eliminar = async (solicitudId: string, evidenciaId: string, user: JwtPayload) => {
  const s = await cargarSolicitudConAcceso(solicitudId, user);
  const e = Types.ObjectId.isValid(evidenciaId) ? s.evidencias.id(evidenciaId) : null;
  if (!e) throw new AppError('Evidencia no encontrada', 404);
  const archivo = e.tipo === 'ARCHIVO' && e.archivo ? rutaArchivo(e.archivo) : null;
  e.deleteOne();
  await s.save();
  if (archivo) fs.promises.unlink(archivo).catch(() => undefined);
};

/** Borra un archivo recién subido cuando la operación falla después de multer. */
export const descartarArchivo = (file?: Express.Multer.File) => {
  if (file?.path) fs.promises.unlink(file.path).catch(() => undefined);
};
