import { NotificacionesRepository } from '../repositories/NotificacionesRepository';
import { Notificacion } from '../entities/Notificacion';
import { User, esAdmin } from '../../../auth/domain/entities/User';

/** Avisos dentro del sistema: lista, contador, marcar leídas y a dónde lleva cada aviso. */
export class NotificacionesUseCase {
  constructor(private readonly repo: NotificacionesRepository) {}

  recientes(limit = 10) {
    return this.repo.listar(1, limit);
  }

  noLeidas() {
    return this.repo.contarNoLeidas();
  }

  marcarLeida(n: Notificacion) {
    return n.leida ? Promise.resolve() : this.repo.marcarLeida(n._id);
  }

  marcarTodas() {
    return this.repo.marcarTodas();
  }

  /** El Administrador abre el expediente; un área no consulta expedientes, se queda en su captura. */
  destino(n: Notificacion, user: User | null) {
    return esAdmin(user) && n.solicitud?._id ? `/solicitudes/${n.solicitud._id}` : null;
  }
}
