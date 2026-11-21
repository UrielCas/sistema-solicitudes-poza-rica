import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { tiempoRelativo } from '../../../../core/utils/formatters';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { useAuthStore } from '../../../auth/presentation/store/useAuthStore';
import { notificacionesUseCase } from '../../di';
import { Notificacion } from '../../domain/entities/Notificacion';

const CADA_MS = 60_000;

/** Campana del encabezado: contador de no leídas y lista desplegable. */
export const CampanaNotificaciones = () => {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [abierta, setAbierta] = useState(false);
  const contenedor = useRef<HTMLDivElement>(null);

  const contador = useQuery({
    queryKey: ['notificaciones', 'no-leidas'],
    queryFn: () => notificacionesUseCase.noLeidas(),
    refetchInterval: CADA_MS,
    refetchIntervalInBackground: false,
  });
  const lista = useQuery({
    queryKey: ['notificaciones', 'recientes'],
    queryFn: () => notificacionesUseCase.recientes(10),
    enabled: abierta,
  });

  const refrescar = () => qc.invalidateQueries({ queryKey: ['notificaciones'] });
  const marcar = useMutation({ mutationFn: (n: Notificacion) => notificacionesUseCase.marcarLeida(n), onSuccess: refrescar });
  const marcarTodas = useMutation({ mutationFn: () => notificacionesUseCase.marcarTodas(), onSuccess: refrescar });

  useEffect(() => {
    if (!abierta) return;
    const cerrar = (e: MouseEvent) => {
      if (contenedor.current && !contenedor.current.contains(e.target as Node)) setAbierta(false);
    };
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setAbierta(false);
    document.addEventListener('mousedown', cerrar);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', cerrar);
      document.removeEventListener('keydown', esc);
    };
  }, [abierta]);

  const abrir = (n: Notificacion) => {
    marcar.mutate(n);
    const destino = notificacionesUseCase.destino(n, user);
    if (destino) {
      setAbierta(false);
      navigate(destino);
    }
  };

  const total = contador.data ?? 0;

  return (
    <div ref={contenedor} className="relative">
      <button
        type="button"
        onClick={() => setAbierta((a) => !a)}
        className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/25 transition cursor-pointer"
        aria-label={total ? `Notificaciones: ${total} sin leer` : 'Notificaciones'}
        aria-expanded={abierta}
      >
        <Bell size={17} />
        {total > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-dorado text-[11px] font-bold leading-5 text-center text-white ring-2 ring-guinda">
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {abierta && (
        <div className="absolute right-0 mt-2 w-[min(92vw,360px)] bg-white text-texto rounded-xl shadow-xl border border-borde z-[1000] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-borde">
            <strong className="text-sm">Notificaciones</strong>
            {total > 0 && (
              <button
                type="button"
                onClick={() => marcarTodas.mutate()}
                className="inline-flex items-center gap-1 text-xs font-semibold text-guinda hover:underline cursor-pointer"
              >
                <CheckCheck size={14} /> Marcar todas
              </button>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto scroll-guinda divide-y divide-borde">
            {lista.isLoading && <li className="p-4 text-sm text-texto-suave text-center">Cargando...</li>}
            {lista.isError && <li className="p-4 text-sm text-red-700 text-center">{mensajeDeError(lista.error)}</li>}
            {lista.data?.items.length === 0 && <li className="p-6 text-sm text-texto-suave text-center">No tienes notificaciones.</li>}
            {lista.data?.items.map((n) => (
              <li key={n._id}>
                <button
                  type="button"
                  onClick={() => abrir(n)}
                  className={`w-full text-left px-4 py-3 hover:bg-fondo cursor-pointer flex gap-3 ${n.leida ? '' : 'bg-guinda-claro/40'}`}
                >
                  <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${n.leida ? 'bg-transparent' : 'bg-guinda'}`} aria-hidden="true" />
                  <span className="min-w-0">
                    <span className={`block text-sm ${n.leida ? '' : 'font-semibold'}`}>{n.titulo}</span>
                    <span className="block text-xs text-texto-suave line-clamp-2">{n.mensaje}</span>
                    <span className="block text-[11px] text-slate-400 mt-0.5">{tiempoRelativo(n.createdAt)}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
