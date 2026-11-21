import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { Alert, Button, EstadoLista, Input, PageHeader, Paginacion, Select } from '../../../../shared/components/ui';
import { ESTATUS_BANDEJA, etiquetaEstatus } from '../../../../core/constants/estatus';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { formatearFecha } from '../../../../core/utils/formatters';
import { useAreas } from '../../../catalogos/presentation/hooks/useCatalogos';
import { BotonesExportar } from '../../../reportes/presentation/components/BotonesExportar';
import { FiltrosSolicitudes } from '../../domain/entities/Solicitud';
import { EstatusChip } from '../components/EstatusChip';
import { SolicitudCard } from '../components/SolicitudCard';
import { useSolicitudesPaginadas } from '../hooks/useSolicitudes';

const anioActual = new Date().getFullYear();
const ANIOS = Array.from({ length: Math.max(1, anioActual - 2026 + 2) }, (_, i) => String(2026 + i));

/** Bandeja de seguimiento del Administrador (SolicitudListScreen). */
export const SolicitudListPage = () => {
  const { areas } = useAreas();
  const [filtros, setFiltros] = useState<FiltrosSolicitudes>({ page: 1 });
  const [busqueda, setBusqueda] = useState('');

  // La búsqueda por texto espera a que se deje de escribir.
  useEffect(() => {
    const t = setTimeout(() => setFiltros((f) => ({ ...f, search: busqueda.trim() || undefined, page: 1 })), 400);
    return () => clearTimeout(t);
  }, [busqueda]);

  const { data, isLoading, isError, error, isFetching } = useSolicitudesPaginadas(filtros);
  const filtrar = (k: keyof FiltrosSolicitudes, v: string) => setFiltros((f) => ({ ...f, [k]: v || undefined, page: 1 }));
  const solicitudes = data?.items ?? [];
  const { page: _p, ...filtrosExportar } = filtros;

  return (
    <AppLayout>
      <div className="space-y-5">
        <PageHeader
          titulo="Registro y seguimiento"
          subtitulo={`Consulta de expedientes registrados en el sistema${data ? ` · ${data.meta.total} en total` : ''}`}
          acciones={
            <>
              <BotonesExportar filtros={filtrosExportar} />
              <Link
                to="/solicitudes/nueva"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-guinda hover:bg-guinda-oscuro text-white text-sm font-semibold rounded-lg"
              >
                <Plus size={16} /> Nueva solicitud
              </Link>
            </>
          }
        />

        <div className="bg-white p-4 rounded-xl border border-borde grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          <Input type="search" placeholder="Folio, oficio, solicitante o colonia..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} aria-label="Buscar" />
          <Select value={filtros.areaActual ?? ''} onChange={(e) => filtrar('areaActual', e.target.value)} aria-label="Dependencia">
            <option value="">Todas las dependencias</option>
            {areas.map((a) => (
              <option key={a._id} value={a._id}>
                {a.nombre}
              </option>
            ))}
          </Select>
          <Select value={filtros.anio ?? ''} onChange={(e) => filtrar('anio', e.target.value)} aria-label="Año">
            <option value="">Todos los años</option>
            {ANIOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Select>
          <Select value={filtros.estatus ?? ''} onChange={(e) => filtrar('estatus', e.target.value)} aria-label="Estatus">
            <option value="">Todos los estatus</option>
            {[...ESTATUS_BANDEJA, 'TURNADA' as const].map((e) => (
              <option key={e} value={e}>
                {etiquetaEstatus(e)}
              </option>
            ))}
          </Select>
          <Button
            variante="secundario"
            onClick={() => {
              setBusqueda('');
              setFiltros({ page: 1 });
            }}
          >
            Limpiar filtros
          </Button>
        </div>

        {isError && <Alert tipo="error">{mensajeDeError(error)}</Alert>}

        {/* Celular: tarjetas */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <EstadoLista>Cargando expedientes...</EstadoLista>
          ) : solicitudes.length === 0 ? (
            <EstadoLista>No hay solicitudes registradas con estos filtros.</EstadoLista>
          ) : (
            solicitudes.map((s) => <SolicitudCard key={s._id} solicitud={s} />)
          )}
        </div>

        {/* Escritorio: tabla */}
        <div className={`hidden md:block bg-white rounded-xl border border-borde overflow-x-auto shadow-sm ${isFetching && !isLoading ? 'opacity-70' : ''}`}>
          {isLoading ? (
            <EstadoLista>Cargando expedientes...</EstadoLista>
          ) : solicitudes.length === 0 ? (
            <EstadoLista>No hay solicitudes registradas con estos filtros.</EstadoLista>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] border-b border-borde text-texto-suave text-xs">
                <tr>
                  <th className="p-3">Folio</th>
                  <th className="p-3">Recepción</th>
                  <th className="p-3">Oficio</th>
                  <th className="p-3">Dependencia</th>
                  <th className="p-3">Tipo / Solicitante</th>
                  <th className="p-3">Colonia</th>
                  <th className="p-3">Estatus</th>
                  <th className="p-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-borde">
                {solicitudes.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-guinda">{s.folio}</td>
                    <td className="p-3 text-xs">{formatearFecha(s.fechaRecepcion)}</td>
                    <td className="p-3 text-xs text-texto-suave">{s.folioOficialia || '—'}</td>
                    <td className="p-3 font-medium">{s.areaActual?.nombre || 'Sin asignar'}</td>
                    <td className="p-3">
                      <div className="font-medium">{s.tipoSolicitud}</div>
                      <div className="text-xs text-texto-suave">{s.solicitante}</div>
                    </td>
                    <td className="p-3">
                      {s.domicilio?.colonia || '—'}
                      {s.zona && <div className="text-[11px] text-texto-suave">{s.zona}</div>}
                    </td>
                    <td className="p-3">
                      <EstatusChip estatus={s.estatus} />
                    </td>
                    <td className="p-3">
                      <Link to={`/solicitudes/${s._id}`} className="text-guinda hover:underline font-semibold">
                        Ver / Turnar
                      </Link>
                    </td>
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
