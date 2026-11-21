import { conFallo } from '../../../../core/errors/AppFailure';
import { guardarBlob } from '../../../../core/network/descargas';
import { EvidenciasRepository } from '../../domain/repositories/SolicitudesRepository';
import { Evidencia } from '../../domain/entities/Evidencia';
import { EvidenciasRemoteDataSource } from '../datasources/EvidenciasRemoteDataSource';

export class EvidenciasRepositoryImpl implements EvidenciasRepository {
  constructor(private readonly remoto: EvidenciasRemoteDataSource) {}

  listar(solicitudId: string) {
    return conFallo(() => this.remoto.listar(solicitudId), 'No se pudieron cargar las evidencias');
  }

  subirArchivo(solicitudId: string, archivo: File, descripcion?: string) {
    return conFallo(() => this.remoto.subir(solicitudId, archivo, descripcion), 'No se pudo subir el archivo');
  }

  agregarEnlace(solicitudId: string, enlace: string, nombre?: string) {
    return conFallo(() => this.remoto.enlazar(solicitudId, enlace, nombre), 'No se pudo agregar el enlace');
  }

  descargar(solicitudId: string, evidencia: Evidencia) {
    return conFallo(async () => {
      guardarBlob(await this.remoto.descargar(solicitudId, evidencia._id), evidencia.nombre);
    }, 'No se pudo descargar el archivo');
  }

  eliminar(solicitudId: string, evidenciaId: string) {
    return conFallo(() => this.remoto.eliminar(solicitudId, evidenciaId), 'No se pudo eliminar la evidencia');
  }
}
