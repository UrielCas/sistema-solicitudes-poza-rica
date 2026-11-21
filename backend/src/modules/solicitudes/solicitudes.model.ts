import { Schema, model, Document, Types } from 'mongoose';

export type EstatusSolicitud =
  | 'PENDIENTE'
  | 'RECIBIDA'
  | 'TURNADA'
  | 'EN_PROCESO'
  | 'ATENDIDA'
  | 'RECHAZADA'
  | 'CERRADA';

export interface ISolicitud extends Document {
  folio: string;
  fechaRecepcion: Date;
  folioOficialia?: string;
  enlaceOficioDrive?: string;
  solicitante: string;
  contacto: string;
  areaActual: Types.ObjectId;
  areasCorresponsables: Types.ObjectId[];
  tipoSolicitud: string;
  tipoPeticion: string;
  prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  estatus: EstatusSolicitud;
  personaEncargada?: string;
  fechaAtencion?: Date;
  descripcion: string;
  domicilio: {
    callePrincipal: string;
    numeroExterior: string;
    entreCalle?: string;
    yCalle?: string;
    colonia: string;
    codigoPostal: string;
    referencias: string;
  };
  enlaceEvidenciaDrive?: string;
  anio: number;
  zona?: string;
  creadoPor: Types.ObjectId;
  coordenadas?: { lat: number; lng: number };
  geo?: {
    latitud: number;
    longitud: number;
    zona?: string;
    validacionManual: boolean;
    fuente?: 'MAPA' | 'GEOCODIFICACION';
  };
  evidencias: Types.DocumentArray<IEvidencia>;
}

/** Documento de soporte: archivo subido al servidor o enlace externo (Drive, etc.). */
export interface IEvidencia {
  _id: Types.ObjectId;
  tipo: 'ARCHIVO' | 'ENLACE';
  nombre: string;
  descripcion?: string;
  archivo?: string; // ruta relativa dentro de UPLOADS_DIR
  mimetype?: string;
  tamano?: number;
  enlace?: string;
  subidoPor: Types.ObjectId;
  createdAt?: Date;
}

const evidenciaSchema = new Schema<IEvidencia>(
  {
    tipo: { type: String, enum: ['ARCHIVO', 'ENLACE'], required: true },
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true },
    archivo: { type: String },
    mimetype: { type: String },
    tamano: { type: Number },
    enlace: { type: String, trim: true },
    subidoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const solicitudSchema = new Schema<ISolicitud>(
  {
    folio: { type: String, required: true, unique: true },
    fechaRecepcion: { type: Date, default: Date.now },
    folioOficialia: { type: String, trim: true, index: true },
    enlaceOficioDrive: { type: String, trim: true },
    solicitante: { type: String, required: true, trim: true },
    contacto: { type: String, required: true, trim: true },
    areaActual: { type: Schema.Types.ObjectId, ref: 'Area', required: true },
    areasCorresponsables: [{ type: Schema.Types.ObjectId, ref: 'Area' }],
    tipoSolicitud: { type: String, required: true, trim: true },
    tipoPeticion: { type: String, required: true, trim: true },
    prioridad: {
      type: String,
      enum: ['BAJA', 'MEDIA', 'ALTA', 'URGENTE'],
      default: 'MEDIA',
    },
    estatus: {
      type: String,
      enum: ['PENDIENTE', 'RECIBIDA', 'TURNADA', 'EN_PROCESO', 'ATENDIDA', 'RECHAZADA', 'CERRADA'],
      default: 'PENDIENTE',
      index: true,
    },
    personaEncargada: { type: String, trim: true },
    fechaAtencion: { type: Date },
    descripcion: { type: String, required: true },
    domicilio: {
      callePrincipal: { type: String, required: true, trim: true },
      numeroExterior: { type: String, required: true, trim: true },
      entreCalle: { type: String, trim: true },
      yCalle: { type: String, trim: true },
      colonia: { type: String, required: true, trim: true },
      codigoPostal: { type: String, required: true, trim: true },
      referencias: { type: String, required: true, trim: true },
    },
    enlaceEvidenciaDrive: { type: String, trim: true },
    anio: { type: Number, default: () => new Date().getFullYear(), index: true },
    zona: { type: String, trim: true, index: true },
    creadoPor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coordenadas: {
      lat: { type: Number },
      lng: { type: Number },
    },
    geo: {
      latitud: { type: Number, min: -90, max: 90 },
      longitud: { type: Number, min: -180, max: 180 },
      zona: { type: String, trim: true },
      validacionManual: { type: Boolean, default: false },
      fuente: { type: String, enum: ['MAPA', 'GEOCODIFICACION'] },
    },
    evidencias: { type: [evidenciaSchema], default: [] },
  },
  { timestamps: true }
);

export const SolicitudModel = model<ISolicitud>('Solicitud', solicitudSchema);