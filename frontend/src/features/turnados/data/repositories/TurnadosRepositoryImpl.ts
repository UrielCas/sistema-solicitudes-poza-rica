import { conFallo } from '../../../../core/errors/AppFailure';
import { TurnadosRepository } from '../../domain/repositories/TurnadosRepository';
import { TurnadosRemoteDataSource } from '../datasources/TurnadosRemoteDataSource';

export class TurnadosRepositoryImpl implements TurnadosRepository {
  constructor(private readonly remoto: TurnadosRemoteDataSource) {}

  turnar(solicitudId: string, areaDestino: string, instrucciones: string) {
    return conFallo(() => this.remoto.turnar({ solicitudId, areaDestino, instrucciones }), 'No se pudo turnar la solicitud');
  }

  historial(solicitudId: string) {
    return conFallo(() => this.remoto.historial(solicitudId), 'No se pudo cargar el historial de turnados');
  }
}
