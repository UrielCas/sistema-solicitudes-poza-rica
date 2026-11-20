import { useState, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../../../core/network/axiosClient';
import { Navbar } from '../../../../shared/components/Navbar';
import { EstatusBadge } from '../components/EstatusBadge';

export const SolicitudDetailPage = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [areaDestino, setAreaDestino] = useState('');
  const [instrucciones, setInstrucciones] = useState('');
  const [nuevaArea, setNuevaArea] = useState({ nombre: '', siglas: '' });

  const { data: solicitud, isLoading } = useQuery({
    queryKey: ['solicitud', id],
    queryFn: async () => (await axiosClient.get(`/solicitudes/${id}`)).data.data,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => (await axiosClient.get('/areas')).data.data,
  });

  const { data: historial = [] } = useQuery({
    queryKey: ['turnados', id],
    queryFn: async () => (await axiosClient.get(`/turnados/solicitud/${id}`)).data.data,
  });

  const turnarMutation = useMutation({
    mutationFn: () => axiosClient.post('/turnados', { solicitudId: id, areaDestino, instrucciones }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitud', id] });
      queryClient.invalidateQueries({ queryKey: ['turnados', id] });
      setInstrucciones('');
    },
  });

  const estatusMutation = useMutation({
    mutationFn: (estatus: string) => axiosClient.patch(`/solicitudes/${id}/estatus`, { estatus }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['solicitud', id] }),
  });

  const areaMutation = useMutation({
    mutationFn: () => axiosClient.post('/areas', nuevaArea),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['areas'] });
      setNuevaArea({ nombre: '', siglas: '' });
    },
  });

  const handleTurnar = (e: FormEvent) => {
    e.preventDefault();
    if (!areaDestino) return;
    turnarMutation.mutate();
  };

  if (isLoading) return <div className="p-6">Cargando...</div>;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="p-6 max-w-5xl mx-auto space-y-6">
        <Link to="/solicitudes" className="text-sm text-blue-600 hover:underline">← Volver al listado</Link>

        {/* Encabezado */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-mono text-sm text-blue-700 font-bold">{solicitud.folio}</span>
              <h2 className="text-xl font-bold text-slate-800">{solicitud.asunto}</h2>
            </div>
            <EstatusBadge estatus={solicitud.estatus} />
          </div>
          <p className="text-slate-600 text-sm">{solicitud.descripcion}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs text-slate-600 border-t">
            <div><strong>Solicitante:</strong> {solicitud.solicitante}</div>
            <div><strong>Zona:</strong> {solicitud.zona} ({solicitud.anio})</div>
            <div><strong>Prioridad:</strong> {solicitud.prioridad}</div>
            <div><strong>Área actual:</strong> {solicitud.areaActual?.nombre || 'Sin asignar'}</div>
          </div>

          {/* Botones de Workflow */}
          <div className="flex flex-wrap gap-2 pt-3">
            {solicitud.estatus === 'TURNADA' && (
              <button onClick={() => estatusMutation.mutate('EN_PROCESO')} className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-lg cursor-pointer">
                Marcar En Proceso
              </button>
            )}
            {solicitud.estatus === 'EN_PROCESO' && (
              <button onClick={() => estatusMutation.mutate('ATENDIDA')} className="px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg cursor-pointer">
                Marcar Atendida
              </button>
            )}
            {solicitud.estatus === 'ATENDIDA' && (
              <button onClick={() => estatusMutation.mutate('CERRADA')} className="px-3 py-1.5 text-xs bg-purple-700 text-white rounded-lg cursor-pointer">
                Cerrar Solicitud
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario Turnar */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Turnar a un Área</h3>
            <form onSubmit={handleTurnar} className="space-y-3">
              <select required value={areaDestino} onChange={(e) => setAreaDestino(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                <option value="">Selecciona un área destino...</option>
                {areas.map((a: any) => (
                  <option key={a._id} value={a._id}>{a.nombre} ({a.siglas})</option>
                ))}
              </select>
              <textarea required rows={3} placeholder="Instrucciones para el área..." value={instrucciones} onChange={(e) => setInstrucciones(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              <button type="submit" disabled={turnarMutation.isPending} className="w-full py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg cursor-pointer">
                {turnarMutation.isPending ? 'Turnando...' : 'Turnar Solicitud'}
              </button>
            </form>

            {/* Alta rápida de Área */}
            <div className="pt-4 border-t space-y-2">
              <p className="text-xs font-semibold text-slate-500">¿Falta un área? Agrégala rápido:</p>
              <div className="flex gap-2">
                <input placeholder="Ej. Obras Públicas" value={nuevaArea.nombre} onChange={(e) => setNuevaArea({ ...nuevaArea, nombre: e.target.value })} className="flex-1 px-2.5 py-1.5 border rounded-lg text-xs" />
                <input placeholder="Siglas (OP)" value={nuevaArea.siglas} onChange={(e) => setNuevaArea({ ...nuevaArea, siglas: e.target.value })} className="w-24 px-2.5 py-1.5 border rounded-lg text-xs" />
                <button type="button" onClick={() => areaMutation.mutate()} className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg cursor-pointer">
                  + Área
                </button>
              </div>
            </div>
          </div>

          {/* Historial Timeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800">Historial de Turnados</h3>
            {historial.length === 0 ? (
              <p className="text-sm text-slate-500">Aún no ha sido turnada a ningún área.</p>
            ) : (
              <div className="space-y-4 border-l-2 border-blue-200 pl-4">
                {historial.map((t: any) => (
                  <div key={t._id} className="text-sm">
                    <p className="font-semibold text-slate-800">
                      {t.areaOrigen?.nombre || 'Ventanilla'} → {t.areaDestino?.nombre}
                    </p>
                    <p className="text-slate-600 text-xs mt-0.5">{t.instrucciones}</p>
                    <p className="text-slate-400 text-[11px] mt-1">
                      Por {t.usuarioTurna?.nombre} • {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};