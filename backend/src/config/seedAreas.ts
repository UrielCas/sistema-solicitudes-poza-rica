import mongoose from 'mongoose';
import { env } from './env';
import { AreaModel } from '../modules/areas/areas.model';

const DEPENDENCIAS = [
  { nombre: 'Presidencia Municipal', siglas: 'PM' },
  { nombre: 'Contraloría Municipal', siglas: 'CM' },
  { nombre: 'Tesorería Municipal', siglas: 'TM' },
  { nombre: 'Secretaría del Ayuntamiento', siglas: 'SA' },
  { nombre: 'Dirección de Protección Civil', siglas: 'PC' },
  { nombre: 'Cultura y Turismo', siglas: 'CT' },
  { nombre: 'Educación', siglas: 'EDU' },
  { nombre: 'Instituto Municipal de las Mujeres', siglas: 'IMM' },
  { nombre: 'Prevención del Delito y Seguridad Pública', siglas: 'PDSP' },
  { nombre: 'Ecología y Medio Ambiente', siglas: 'EMA' },
  { nombre: 'Dirección Municipal de la Juventud', siglas: 'DMJ' },
  { nombre: 'Servicios Públicos', siglas: 'SP' },
  { nombre: 'Obra Pública y Desarrollo Urbano', siglas: 'OPDU' },
  { nombre: 'Deporte', siglas: 'DEP' },
  { nombre: 'SIPINNA Municipal', siglas: 'SIPINNA' },
  { nombre: 'Enlace con el Sector Petrolero', siglas: 'ESP' },
  { nombre: 'Participación Social', siglas: 'PS' },
  { nombre: 'Derechos Humanos', siglas: 'DH' },
  { nombre: 'Secretario Particular', siglas: 'SPART' },
  { nombre: 'DIF Municipal', siglas: 'DIF' },
  { nombre: 'Desarrollo Económico', siglas: 'DE' },
];

async function run() {
  await mongoose.connect(env.MONGO_URI);
  for (const dep of DEPENDENCIAS) {
    await AreaModel.updateOne({ nombre: dep.nombre }, { $set: dep }, { upsert: true });
  }
  console.log(`21 dependencias oficiales sincronizadas en MongoDB`);
  process.exit(0);
}

run();