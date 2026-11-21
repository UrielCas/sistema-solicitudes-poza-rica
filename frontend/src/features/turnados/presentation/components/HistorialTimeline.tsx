import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import { formatearFechaHora } from '../../../../core/utils/formatters';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { Alert, Card, EstadoLista } from '../../../../shared/components/ui';
import { obtenerHistorialUseCase } from '../../di';

/** Línea de tiempo con los turnados de la solicitud. */
export const HistorialTimeline = ({ solicitudId }: { solicitudId: string }) => {
  const { data: historial = [], isLoading, isError, error } = useQuery({
    queryKey: ['turnados', solicitudId],
    queryFn: () => obtenerHistorialUseCase.execute(solicitudId),
  });

  return (
    <Card titulo="Historial de turnados">
      {isLoading ? (
        <EstadoLista>Cargando historial...</EstadoLista>
      ) : isError ? (
        <Alert tipo="error">{mensajeDeError(error)}</Alert>
      ) : historial.length === 0 ? (
        <EstadoLista>Aún no ha sido turnada a ningún área.</EstadoLista>
      ) : (
        <ol className="space-y-4 border-l-2 border-guinda-claro pl-4">
          {historial.map((t) => (
            <li key={t._id} className="relative text-sm">
              <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-guinda ring-4 ring-white" aria-hidden="true" />
              <p className="font-semibold flex flex-wrap items-center gap-1.5">
                {t.areaOrigen?.nombre || 'Ventanilla'} <ArrowRight size={14} className="text-guinda" /> {t.areaDestino?.nombre}
              </p>
              <p className="text-texto-suave text-xs mt-0.5 whitespace-pre-line">{t.instrucciones}</p>
              <p className="text-slate-400 text-[11px] mt-1">
                Por {t.usuarioTurna?.nombre || '—'} · {formatearFechaHora(t.createdAt)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
};
