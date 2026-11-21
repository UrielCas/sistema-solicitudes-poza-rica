import { Schema, model, Document } from 'mongoose';

export const TIPOS_CATALOGO = ['TIPO_SOLICITUD', 'TIPO_PETICION', 'PRIORIDAD'] as const;
export type TipoCatalogo = (typeof TIPOS_CATALOGO)[number];

export interface ICatalogo extends Document {
  tipo: TipoCatalogo;
  valor: string;
  etiqueta: string;
  orden: number;
  activo: boolean;
}

const catalogoSchema = new Schema<ICatalogo>(
  {
    tipo: { type: String, enum: TIPOS_CATALOGO, required: true, index: true },
    valor: { type: String, required: true, trim: true },
    etiqueta: { type: String, required: true, trim: true },
    orden: { type: Number, default: 0 },
    activo: { type: Boolean, default: true },
  },
  { timestamps: true }
);

catalogoSchema.index({ tipo: 1, valor: 1 }, { unique: true });

export const CatalogoModel = model<ICatalogo>('Catalogo', catalogoSchema);

/** Valores iniciales: los mismos que usa hoy el formulario de captura. */
const lista = (tipo: TipoCatalogo, valores: [string, string][]) =>
  valores.map(([valor, etiqueta], orden) => ({ tipo, valor, etiqueta, orden }));

export const CATALOGOS_INICIALES = [
  ...lista('TIPO_SOLICITUD', [
    ['Alumbrado público', 'Alumbrado público'],
    ['Bacheo y pavimentación', 'Bacheo y pavimentación'],
    ['Agua potable y drenaje', 'Agua potable y drenaje'],
    ['Limpieza y recolección', 'Limpieza y recolección'],
    ['Seguridad y vigilancia', 'Seguridad y vigilancia'],
    ['Apoyo social / DIF', 'Apoyo social / DIF'],
    ['Obra pública', 'Obra pública'],
    ['Ecología y medio ambiente', 'Ecología y medio ambiente'],
    ['Otro', 'Otro'],
  ]),
  ...lista('TIPO_PETICION', [
    ['Gestión ciudadana', 'Gestión ciudadana'],
    ['Oficio institucional', 'Oficio institucional'],
    ['Audiencia pública', 'Audiencia pública'],
    ['Reporte urgente', 'Reporte urgente'],
    ['Seguimiento', 'Seguimiento'],
  ]),
  ...lista('PRIORIDAD', [
    ['BAJA', 'Baja'],
    ['MEDIA', 'Media'],
    ['ALTA', 'Alta'],
    ['URGENTE', 'Urgente'],
  ]),
];

/** Inserta los valores iniciales que falten; no modifica los que el Administrador ya editó. */
export const sincronizarCatalogos = async () => {
  const ops = CATALOGOS_INICIALES.map((c) => ({
    updateOne: { filter: { tipo: c.tipo, valor: c.valor }, update: { $setOnInsert: c }, upsert: true },
  }));
  const r = await CatalogoModel.bulkWrite(ops);
  return r.upsertedCount;
};

/**
 * ¿El valor existe y está activo en el catálogo? Si el catálogo de ese tipo está vacío
 * no se bloquea la captura.
 */
export const valorPermitido = async (tipo: TipoCatalogo, valor: string) => {
  const total = await CatalogoModel.countDocuments({ tipo });
  if (total === 0) return true;
  return !!(await CatalogoModel.exists({ tipo, valor, activo: true }));
};
