import { SolicitudesRepository } from '../repositories/SolicitudesRepository';
import { FiltrosSolicitudes } from '../entities/Solicitud';

/** Consultas del Administrador: bandeja paginada, expediente y datos para el mapa. */
export class ConsultarSolicitudesUseCase {
  constructor(private readonly repo: SolicitudesRepository) {}

  pagina(filtros: FiltrosSolicitudes) {
    return this.repo.listar({ limit: 20, ...filtros, page: filtros.page ?? 1 });
  }

  /** Todas (sin paginar) — para el mapa consolidado. */
  todas(filtros?: FiltrosSolicitudes) {
    return this.repo.listarTodas(filtros);
  }

  expediente(id: string) {
    return this.repo.obtener(id);
  }

  /** Revisión de oficio duplicado antes de capturar. */
  async buscarOficio(q: string) {
    return q.trim().length < 2 ? [] : this.repo.buscarOficio(q.trim());
  }
}
