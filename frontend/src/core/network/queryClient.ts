import { QueryClient } from '@tanstack/react-query';
import { AppFailure } from '../errors/AppFailure';

/** Caché de datos del servidor (React Query), compartida por toda la app. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // No reintenta errores de permisos o validación; sí los de red/servidor (una vez).
      retry: (intentos, err) => {
        const f = AppFailure.from(err);
        return intentos < 1 && (f.esDeRed || (f.status ?? 0) >= 500);
      },
    },
  },
});
