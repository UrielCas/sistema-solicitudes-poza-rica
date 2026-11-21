import { conFallo } from '../../../../core/errors/AppFailure';
import { NotificacionesRepository } from '../../domain/repositories/NotificacionesRepository';
import { NotificacionesRemoteDataSource } from '../datasources/NotificacionesRemoteDataSource';

export class NotificacionesRepositoryImpl implements NotificacionesRepository {
  constructor(private readonly remoto: NotificacionesRemoteDataSource) {}

  listar(page: number, limit: number) {
    return conFallo(async () => {
      const r = await this.remoto.listar(page, limit);
      return { items: r.data, meta: r.meta ?? { total: r.data.length, page, limit, totalPages: 1 } };
    }, 'No se pudieron cargar las notificaciones');
  }

  contarNoLeidas() {
    return conFallo(() => this.remoto.noLeidas(), 'No se pudo consultar las notificaciones');
  }

  marcarLeida(id: string) {
    return conFallo(() => this.remoto.marcarLeida(id), 'No se pudo marcar la notificación');
  }

  marcarTodas() {
    return conFallo(() => this.remoto.marcarTodas(), 'No se pudieron marcar las notificaciones');
  }
}
