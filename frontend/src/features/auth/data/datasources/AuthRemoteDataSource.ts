import { AxiosInstance } from 'axios';
import { ApiResponse } from '../../../../shared/types/ApiResponse';

/** DTOs tal como llegan de la API. */
export interface UserDTO {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  area?: { _id: string; nombre: string; siglas: string } | string | null;
  debeCambiarPassword?: boolean;
}

export interface SesionDTO {
  user: UserDTO;
  accessToken: string;
  refreshToken: string;
}

export interface AreaLoginDTO {
  _id: string;
  nombre: string;
  siglas: string;
}

/** Llamadas HTTP del módulo auth (sin lógica: solo transporte). */
export class AuthRemoteDataSource {
  constructor(private readonly http: AxiosInstance) {}

  async areasLogin() {
    const { data } = await this.http.get<ApiResponse<AreaLoginDTO[]>>('/auth/areas-login');
    return data.data;
  }

  async login(body: { areaId: string; password: string } | { email: string; password: string }) {
    const { data } = await this.http.post<ApiResponse<SesionDTO>>('/auth/login', body);
    return data.data;
  }

  async credenciales(body: { passwordActual: string; nuevoEmail?: string; nuevaPassword?: string }) {
    const { data } = await this.http.patch<ApiResponse<UserDTO>>('/auth/credenciales', body);
    return data.data;
  }
}
