import { Schema, model, Document, Types } from 'mongoose';

export type TipoNotificacion = 'NUEVA_SOLICITUD' | 'CAMBIO_ESTATUS' | 'TURNADO' | 'EVIDENCIA' | 'SISTEMA';

/**
 * Notificación dentro del sistema. Se dirige a un usuario, a toda un área
 * o a todas las cuentas de un rol (p. ej. todos los Administradores).
 * `leidaPor` permite que cada integrante del área la marque por separado.
 */
export interface INotificacion extends Document {
  destinatario?: Types.ObjectId;
  area?: Types.ObjectId;
  rol?: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  solicitud?: Types.ObjectId;
  leidaPor: Types.ObjectId[];
}

const notificacionSchema = new Schema<INotificacion>(
  {
    destinatario: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    area: { type: Schema.Types.ObjectId, ref: 'Area', index: true },
    rol: { type: String, index: true },
    tipo: {
      type: String,
      enum: ['NUEVA_SOLICITUD', 'CAMBIO_ESTATUS', 'TURNADO', 'EVIDENCIA', 'SISTEMA'],
      required: true,
    },
    titulo: { type: String, required: true, trim: true },
    mensaje: { type: String, required: true, trim: true },
    solicitud: { type: Schema.Types.ObjectId, ref: 'Solicitud' },
    leidaPor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

notificacionSchema.index({ createdAt: -1 });

export const NotificacionModel = model<INotificacion>('Notificacion', notificacionSchema);
