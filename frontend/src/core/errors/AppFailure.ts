import { isAxiosError } from 'axios';

export interface CampoInvalido {
  campo: string;
  mensaje: string;
}

/**
 * Error de la aplicación con un mensaje listo para mostrar al usuario.
 * Las capas de datos convierten cualquier error (red, HTTP, validación) en AppFailure.
 */
export class AppFailure extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly campos: CampoInvalido[] = []
  ) {
    super(message);
    this.name = 'AppFailure';
  }

  get esDeRed() {
    return this.status === undefined;
  }

  get noAutorizado() {
    return this.status === 401 || this.status === 403;
  }

  static from(err: unknown, porDefecto = 'Ocurrió un error inesperado'): AppFailure {
    if (err instanceof AppFailure) return err;
    if (isAxiosError(err)) {
      if (!err.response) {
        return new AppFailure(
          err.code === 'ECONNABORTED'
            ? 'El servidor tardó demasiado en responder. Intenta de nuevo.'
            : 'No hay conexión con el servidor. Revisa tu red e intenta de nuevo.'
        );
      }
      const data: any = err.response.data;
      // Las descargas (responseType: blob) traen el error como Blob: se muestra el genérico.
      const mensaje = typeof data?.message === 'string' ? data.message : porDefecto;
      return new AppFailure(mensaje, err.response.status, Array.isArray(data?.errors) ? data.errors : []);
    }
    if (err instanceof Error && err.message) return new AppFailure(err.message);
    return new AppFailure(porDefecto);
  }
}

/** Ejecuta una llamada de la capa de datos y convierte cualquier error en AppFailure. */
export const conFallo = async <T>(fn: () => Promise<T>, porDefecto: string): Promise<T> => {
  try {
    return await fn();
  } catch (e) {
    throw AppFailure.from(e, porDefecto);
  }
};

/** Mensaje para mostrar a partir de cualquier error. */
export const mensajeDeError = (err: unknown, porDefecto?: string) => AppFailure.from(err, porDefecto).message;
