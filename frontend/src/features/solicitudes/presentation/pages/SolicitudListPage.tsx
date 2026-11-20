import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { axiosClient } from '../../../../core/network/axiosClient';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { EstatusBadge } from '../components/EstatusBadge';

export const SolicitudListPage = () => {
  const [anio, setAnio] = useState('');
  const [areaActual, setAreaActual] = useState('');
  const [estatus, setEstatus] = useState('');
  const [search, setSearch] = useState('');

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => (await axiosClient.get('/areas')).data.data,
  });

  const { data: solicitudes = [], isLoading } = useQuery({
    queryKey: ['solicitudes', anio, areaActual, estatus, search],
    queryFn: async () => {
      const params: any = {};
      if (anio) params.anio = anio;
      if (areaActual) params.areaActual = areaActual;
      if (estatus) params.estatus = estatus;
      if (search) params.search = search;
      const { data } = await axiosClient.get('/solicitudes', { params });
      return data.data;
    },
  });

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#292b34]">Registro y seguimiento</h1>
            <p className="text-sm text-[#707784]">Consulta de expedientes registrados en el sistema</p>
          </div>
          <Link
            to="/solicitudes/nueva"
            className="px-4 py-2.5 bg-[#731936] hover:bg-[#4b1027] text-white text-sm font-semibold rounded-lg"
          >
            + Nueva Solicitud
          </Link>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e5e9] grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            type="search"
            placeholder="Folio, oficio o colonia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
          />
          <select
            value={areaActual}
            onChange={(e) => setAreaActual(e.target.value)}
            className="px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white"
          >
            <option value="">Todas las dependencias</option>
            {areas.map((a: any) => (
              <option key={a._id} value={a._id}>{a.nombre}</option>
            ))}
          </select>
          <select
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            className="px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white"
          >
            <option value="">Todos los años</option>
            <option value="2026">2026</option>
            <option value="2027">2027</option>
          </select>
          <select
            value={estatus}
            onChange={(e) => setEstatus(e.target.value)}
            className="px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white"
          >
            <option value="">Todos los estatus</option>
            <option value="PENDIENTE">Pendiente</option>
            <option value="TURNADA">Turnada</option>
            <option value="EN_PROCESO">En proceso</option>
            <option value="ATENDIDA">Atendida</option>
            <option value="CERRADA">Cerrada</option>
          </select>
          <button
            onClick={() => { setAnio(''); setAreaActual(''); setEstatus(''); setSearch(''); }}
            className="px-3 py-2 text-sm border border-[#e3e5e9] hover:bg-slate-50 rounded-lg font-semibold cursor-pointer"
          >
            Limpiar filtros
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#e3e5e9] overflow-x-auto shadow-sm">
          {isLoading ? (
            <p className="p-6 text-sm text-[#707784]">Cargando expedientes...</p>
          ) : solicitudes.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#707784]">
              No hay solicitudes registradas con estos filtros.
            </p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f8f9fa] border-b border-[#e3e5e9] text-[#707784] text-xs">
                <tr>
                  <th className="p-3">Folio</th>
                  <th className="p-3">Oficio</th>
                  <th className="p-3">Dependencia</th>
                  <th className="p-3">Tipo / Solicitante</th>
                  <th className="p-3">Colonia</th>
                  <th className="p-3">Año</th>
                  <th className="p-3">Estatus</th>
                  <th className="p-3">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e5e9]">
                {solicitudes.map((s: any) => (
                  <tr key={s._id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-[#731936]">{s.folio}</td>
                    <td className="p-3 text-xs text-[#707784]">{s.folioOficialia || '—'}</td>
                    <td className="p-3 font-medium">{s.areaActual?.nombre || 'Sin asignar'}</td>
                    <td className="p-3">
                      <div className="font-medium">{s.tipoSolicitud || s.asunto}</div>
                      <div className="text-xs text-[#707784]">{s.solicitante}</div>
                    </td>
                    <td className="p-3">{s.domicilio?.colonia || s.colonia || '—'}</td>
                    <td className="p-3">{s.anio}</td>
                    <td className="p-3"><EstatusBadge estatus={s.estatus} /></td>
                    <td className="p-3">
                      <Link
                        to={`/solicitudes/${s._id}`}
                        className="text-[#731936] hover:underline font-semibold"
                      >
                        Ver / Turnar
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
};