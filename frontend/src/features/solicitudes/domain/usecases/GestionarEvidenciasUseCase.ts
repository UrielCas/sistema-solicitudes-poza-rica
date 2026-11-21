import { AppFailure } from '../../../../core/errors/AppFailure';
import { validarArchivoEvidencia, validarEnlaceHttps } from '../../../../core/utils/validators';
import { EvidenciasRepository } from '../repositories/SolicitudesRepository';
import { Evidencia } from '../entities/Evidencia';

/** Documentos de soporte de una solicitud: archivos (PDF, imagen, Word, Excel) o enlaces de Drive. */
export class GestionarEvidenciasUseCase {
  constructor(private readonly repo: EvidenciasRepository) {}

  listar(solicitudId: string) {
    return this.repo.listar(solicitudId);
  }

  subir(solicitudId: string, archivo: File, descripcion?: string) {
    const error = validarArchivoEvidencia(archivo);
    if (error) throw new AppFailure(error);
    return this.repo.subirArchivo(solicitudId, archivo, descripcion?.trim() || undefined);
  }

  enlazar(solicitudId: string, enlace: string, nombre?: string) {
    const error = validarEnlaceHttps(enlace);
    if (error) throw new AppFailure(error);
    return this.repo.agregarEnlace(solicitudId, enlace.trim(), nombre?.trim() || undefined);
  }

  descargar(solicitudId: string, evidencia: Evidencia) {
    if (evidencia.tipo === 'ENLACE' && evidencia.enlace) {
      window.open(evidencia.enlace, '_blank', 'noopener,noreferrer');
      return Promise.resolve();
    }
    return this.repo.descargar(solicitudId, evidencia);
  }

  eliminar(solicitudId: string, evidenciaId: string) {
    return this.repo.eliminar(solicitudId, evidenciaId);
  }
}
