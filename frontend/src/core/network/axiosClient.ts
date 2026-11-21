import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';

/**
 * Puente con la sesión. `core` no conoce el store de auth: la feature de auth
 * registra aquí cómo leer y renovar los tokens (ver features/auth/di.ts).
 */
export interface ProveedorSesion {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  onSesionExpirada: () => void;
}

let sesion: ProveedorSesion | null = null;
export const configurarSesion = (proveedor: ProveedorSesion) => {
  sesion = proveedor;
};

export const axiosClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = sesion?.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Si varias peticiones reciben 401 a la vez, se hace una sola renovación del token.
let renovacionEnCurso: Promise<string> | null = null;

const renovarToken = async () => {
  const refreshToken = sesion?.getRefreshToken();
  if (!refreshToken) throw new Error('Sin refresh token');
  const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
  sesion?.setTokens(data.data.accessToken, data.data.refreshToken);
  return data.data.accessToken as string;
};

const RUTAS_SIN_RENOVACION = ['/auth/login', '/auth/refresh'];

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const esRutaDeLogin = RUTAS_SIN_RENOVACION.some((r) => original?.url?.includes(r));

    if (error.response?.status === 401 && original && !original._retry && !esRutaDeLogin) {
      original._retry = true;
      try {
        renovacionEnCurso ??= renovarToken().finally(() => {
          renovacionEnCurso = null;
        });
        const token = await renovacionEnCurso;
        original.headers.Authorization = `Bearer ${token}`;
        return axiosClient(original);
      } catch {
        sesion?.onSesionExpirada();
      }
    }
    return Promise.reject(error);
  }
);
