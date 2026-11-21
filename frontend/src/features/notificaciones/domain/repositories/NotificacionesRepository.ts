import { Pagina } from '../../../../shared/types/ApiResponse';
import { Notificacion } from '../entities/Notificacion';

export interface NotificacionesRepository {
  listar(page: number, limit: number): Promise<Pagina<Notificacion>>;
  contarNoLeidas(): Promise<number>;
  marcarLeida(id: string): Promise<void>;
  marcarTodas(): Promise<number>;
}
