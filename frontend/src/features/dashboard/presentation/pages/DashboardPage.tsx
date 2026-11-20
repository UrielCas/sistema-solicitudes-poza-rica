import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { axiosClient } from '../../../../core/network/axiosClient';
import { AppLayout } from '../../../../shared/components/AppLayout';

const POZA_RICA_COORDS: [number, number] = [20.538, -97.457];

export const DashboardPage = () => {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => (await axiosClient.get('/reportes/dashboard')).data.data,
  });

  const { data: solicitudes = [] } = useQuery({
    queryKey: ['solicitudes-mapa'],
    queryFn: async () => (await axiosClient.get('/solicitudes')).data.data,
  });

  const handleDownloadExcel = async () => {
    const response = await axiosClient.get('/reportes/excel', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'solicitudes_poza_rica.xlsx');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const estatus = stats?.porEstatus || {};

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#292b34]">Mapa consolidado</h1>
            <p className="text-sm text-[#707784]">Consulta institucional · histórico 2026 y operación 2027</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-lg cursor-pointer"
            >
              Exportar Excel (.xlsx)
            </button>
            <Link
              to="/solicitudes/nueva"
              className="px-4 py-2 bg-[#731936] hover:bg-[#4b1027] text-white text-sm font-semibold rounded-lg"
            >
              + Nueva Solicitud
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-[#e3e5e9]">
            <div className="text-xs text-[#707784]">Total registradas</div>
            <strong className="block text-2xl mt-1">{stats?.total ?? 0}</strong>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e3e5e9]">
            <div className="text-xs text-[#707784]">Atendidas</div>
            <strong className="block text-2xl mt-1 text-emerald-700">
              {(estatus.ATENDIDA ?? 0) + (estatus.CERRADA ?? 0)}
            </strong>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e3e5e9]">
            <div className="text-xs text-[#707784]">En proceso / Turnadas</div>
            <strong className="block text-2xl mt-1 text-amber-600">
              {(estatus.EN_PROCESO ?? 0) + (estatus.TURNADA ?? 0)}
            </strong>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#e3e5e9]">
            <div className="text-xs text-[#707784]">Pendientes</div>
            <strong className="block text-2xl mt-1 text-[#731936]">
              {(estatus.PENDIENTE ?? 0) + (estatus.RECIBIDA ?? 0)}
            </strong>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-[#e3e5e9]">
            <h2 className="font-bold text-base mb-3">Visualizador territorial</h2>
            <div className="h-[460px] rounded-lg overflow-hidden border border-[#e3e5e9]">
              <MapContainer center={POZA_RICA_COORDS} zoom={13} className="h-full w-full">
                <TileLayer
                  attribution="&copy; OpenStreetMap"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {solicitudes
                  .filter((s: any) => s.coordenadas?.lat && s.coordenadas?.lng)
                  .map((s: any) => (
                    <Marker key={s._id} position={[s.coordenadas.lat, s.coordenadas.lng]}>
                      <Popup>
                        <strong>{s.folio}</strong><br />
                        {s.tipoSolicitud || s.asunto}<br />
                        <span className="text-xs">{s.estatus}</span>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#e3e5e9] space-y-3">
            <h2 className="font-bold text-base">Solicitudes por dependencia</h2>
            {!stats?.porArea?.length ? (
              <p className="text-sm text-[#707784]">Sin registros todavía.</p>
            ) : (
              <ul className="space-y-2.5">
                {stats.porArea.map((item: any) => (
                  <li key={item._id} className="flex items-center justify-between text-sm border-b border-[#f0f0f2] pb-2">
                    <span className="font-medium">{item._id}</span>
                    <span className="px-2.5 py-0.5 bg-[#f2e7ed] text-[#731936] font-bold rounded-full text-xs">
                      {item.total}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};