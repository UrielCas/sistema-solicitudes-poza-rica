import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { Alert, EstadoLista, PageHeader, Paginacion, Select } from '../../../../shared/components/ui';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { formatearFechaHora } from '../../../../core/utils/formatters';
import { consultarAuditoriaUseCase } from '../../di';
import { ETIQUETA_ACCION } from '../../domain/entities/Reporte';
import { FiltrosAuditoria } from '../../domain/repositories/ReportesRepository';

/** Bitácora de acciones críticas (solo Administrador). */
export const AuditoriaPage = () => {
  const [filtros, setFiltros] = useState<FiltrosAuditoria>({ page: 1 });
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['reportes', 'auditoria', filtros],
    queryFn: () => consultarAuditoriaUseCase.execute(filtros),
    placeholderData: keepPreviousData,
  });
  const registros = data?.items ?? [];

  return (
    <AppLayout>
      <div className="space-y-5">
        <PageHeader titulo="Bitácora" subtitulo="Quién hizo qué y cuándo: accesos, capturas, cambios de estatus, turnados y descargas" />

        <div className="bg-white p-4 rounded-xl border border-borde max-w-sm">
          <Select
            label="Acción"
            value={filtros.accion ?? ''}
            onChange={(e) => setFiltros({ accion: e.target.value || undefined, page: 1 })}
          >
            <option value="">Todas las acciones</option>
            {Object.entries(ETIQUETA_ACCION).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </div>

        {isError && <Alert tipo="error">{mensajeDeError(error)}</Alert>}

        <div className="bg-white rounded-xl border border-borde overflow-x-auto shadow-sm">
          {isLoading ? (
            <EstadoLista>Cargando bitácora...</EstadoLista>
          ) : registros.length === 0 ? (
            <EstadoLista>No hay registros con este filtro.</EstadoLista>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] border-b border-borde text-texto-suave text-xs">
                <tr>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Acción</th>
                  <th className="p-3">Cuenta</th>
                  <th className="p-3">Detalle</th>
                  <th className="p-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {registros.map((r) => (
                  <tr key={r._id} className={r.accion === 'LOGIN_FALLIDO' ? 'bg-red-50/50' : ''}>
                    <td className="p-3 text-xs whitespace-nowrap">{formatearFechaHora(r.createdAt)}</td>
                    <td className="p-3 font-medium">{ETIQUETA_ACCION[r.accion] || r.accion}</td>
                    <td className="p-3 text-xs">
                      {r.usuario?.nombre || '—'}
                      {r.area?.siglas && <span className="text-texto-suave"> · {r.area.siglas}</span>}
                    </td>
                    <td className="p-3 text-xs text-texto-suave max-w-[320px] truncate" title={r.detalle ? JSON.stringify(r.detalle) : ''}>
                      {r.detalle
                        ? Object.entries(r.detalle)
                            .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`)
                            .join(' · ')
                        : r.ruta}
                    </td>
                    <td className="p-3 text-xs text-texto-suave">{r.ip?.replace('::ffff:', '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Paginacion meta={data?.meta} onCambiar={(page) => setFiltros((f) => ({ ...f, page }))} />
      </div>
    </AppLayout>
  );
};
