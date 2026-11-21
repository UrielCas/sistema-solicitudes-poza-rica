import { Turnado } from '../entities/Turnado';

export interface TurnadosRepository {
  turnar(solicitudId: string, areaDestino: string, instrucciones: string): Promise<Turnado>;
  historial(solicitudId: string): Promise<Turnado[]>;
}
