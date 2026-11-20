import { Schema, model, Document } from 'mongoose';

export interface IArea extends Document {
  nombre: string;
  siglas: string;
  activa: boolean;
}

const areaSchema = new Schema<IArea>(
  {
    nombre: { type: String, required: true, unique: true, trim: true },
    siglas: { type: String, required: true, uppercase: true, trim: true },
    activa: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const AreaModel = model<IArea>('Area', areaSchema);