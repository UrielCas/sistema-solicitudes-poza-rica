import { AreaRef } from '../../../auth/domain/entities/User';

export interface Turnado {
  _id: string;
  solicitud: string;
  areaOrigen?: AreaRef | null;
  areaDestino?: AreaRef | null;
  usuarioTurna?: { _id: string; nombre: string } | null;
  instrucciones: string;
  createdAt: string;
}
