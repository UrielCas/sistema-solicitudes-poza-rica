import { Schema, model, Document, Types } from 'mongoose';

export interface ITurnado extends Document {
  solicitud: Types.ObjectId;
  areaOrigen?: Types.ObjectId;
  areaDestino: Types.ObjectId;
  usuarioTurna: Types.ObjectId;
  instrucciones: string;
}

const turnadoSchema = new Schema<ITurnado>(
  {
    solicitud: { type: Schema.Types.ObjectId, ref: 'Solicitud', required: true, index: true },
    areaOrigen: { type: Schema.Types.ObjectId, ref: 'Area' },
    areaDestino: { type: Schema.Types.ObjectId, ref: 'Area', required: true },
    usuarioTurna: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instrucciones: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const TurnadoModel = model<ITurnado>('Turnado', turnadoSchema);