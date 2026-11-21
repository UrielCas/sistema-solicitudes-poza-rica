import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Plus } from 'lucide-react';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { Alert, Card, PageHeader, StatCard } from '../../../../shared/components/ui';
import { POZA_RICA_CENTRO } from '../../../../core/constants/strings';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { obtenerDashboardUseCase } from '../../../reportes/di';
import { BotonesExportar } from '../../../reportes/presentation/components/BotonesExportar';
import { useSolicitudesMapa } from '../../../solicitudes/presentation/hooks/useSolicitudes';
import { coordenadaDe } from '../../../solicitudes/domain/entities/Solicitud';
import { EstatusChip } from '../../../solicitudes/presentation/components/EstatusChip';

/** Panel del Administrador (DashboardScreen): cifras, mapa consolidado y métricas por área. */
export const DashboardPage = () => {
  const stats = useQuery({ queryKey: ['reportes', 'dashboard'], queryFn: () => obtenerDashboardUseCase.execute() });
  const mapa = useSolicitudesMapa();
  const r = stats.data?.resumen;
  const conUbicacion = (mapa.data ?? []).map((s) => ({ s, c: coordenadaDe(s) })).filter((x) => x.c);

  return (
    <AppLayout>
      <div className="space-y-5">
        <PageHeader
          titulo="Mapa consolidado"
          subtitulo="Consulta institucional · histórico 2026 y operación 2027"
          acciones={
            <>
              <BotonesExportar />
              <Link
                to="/solicitudes/nueva"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-guinda hover:bg-guinda-oscuro text-white text-sm font-semibold rounded-lg"
              >
                <Plus size={16} /> Nueva solicitud
              </Link>
            </>
          }
        />

        {stats.isError && <Alert tipo="error">{mensajeDeError(stats.error)}</Alert>}

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <StatCard etiqueta="Total registradas" valor={stats.data?.total ?? 0} />
          <StatCard etiqueta="Pendientes" valor={r?.pendientes ?? 0} color="text-guinda" />
          <StatCard etiqueta="En proceso / Turnadas" valor={r?.enProceso ?? 0} color="text-amber-600" />
          <StatCard etiqueta="Atendidas" valor={r?.atendidas ?? 0} color="text-emerald-700" />
          <StatCard etiqueta="No procede" valor={r?.noProcede ?? 0} color="text-slate-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card
            className="lg:col-span-2 !p-4"
            titulo="Visualizador territorial"
            acciones={<span className="text-xs text-texto-suave">{conUbicacion.length} con ubicación</span>}
          >
            <div className="h-[460px] rounded-lg overflow-hidden border border-borde relative z-0">
              <MapContainer center={POZA_RICA_CENTRO} zoom={13} className="h-full w-full">
                <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                {conUbicacion.map(({ s, c }) => (
                  <Marker key={s._id} position={c!}>
                    <Popup>
                      <strong>{s.folio}</strong>
                      <br />
                      {s.tipoSolicitud}
                      <br />
                      <span className="inline-block my-1">
                        <EstatusChip estatus={s.estatus} />
                      </span>
                      <br />
                      <Link to={`/solicitudes/${s._id}`}>Ver expediente</Link>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </Card>

          <Card titulo="Solicitudes por dependencia" className="!p-4">
            {!stats.data?.porArea?.length ? (
              <p className="text-sm text-texto-suave">Sin registros todavía.</p>
            ) : (
              <ul className="space-y-2.5">
                {stats.data.porArea.map((item) => (
                  <li key={item._id} className="flex items-center justify-between gap-3 text-sm border-b border-[#f0f0f2] pb-2">
                    <span className="font-medium">{item._id}</span>
                    <span className="px-2.5 py-0.5 bg-guinda-claro text-guinda font-bold rounded-full text-xs">{item.total}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};
