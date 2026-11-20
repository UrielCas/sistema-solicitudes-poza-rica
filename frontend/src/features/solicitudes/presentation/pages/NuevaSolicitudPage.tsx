import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosClient } from '../../../../core/network/axiosClient';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { useAuthStore } from '../../../auth/presentation/store/useAuthStore';

const TIPOS_SOLICITUD = [
  'Alumbrado público',
  'Bacheo y pavimentación',
  'Agua potable y drenaje',
  'Limpieza y recolección',
  'Seguridad y vigilancia',
  'Apoyo social / DIF',
  'Obra pública',
  'Ecología y medio ambiente',
  'Otro',
];

const TIPOS_PETICION = [
  'Gestión ciudadana',
  'Oficio institucional',
  'Audiencia pública',
  'Reporte urgente',
  'Seguimiento',
];

const INITIAL_FORM = {
  fechaRecepcion: new Date().toISOString().split('T')[0],
  folioOficialia: '',
  enlaceOficioDrive: '',
  solicitante: '',
  contacto: '',
  areaActual: '',
  areasCorresponsables: [] as string[],
  tipoSolicitud: '',
  tipoPeticion: '',
  prioridad: 'MEDIA',
  estatus: 'PENDIENTE',
  personaEncargada: '',
  fechaAtencion: '',
  descripcion: '',
  zona: 'ZONA CENTRO 1',
  domicilio: {
    callePrincipal: '',
    numeroExterior: '',
    entreCalle: '',
    yCalle: '',
    colonia: '',
    codigoPostal: '',
    referencias: '',
  },
  enlaceEvidenciaDrive: '',
};

export const NuevaSolicitudPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [form, setForm] = useState(INITIAL_FORM);
  const [busquedaArea, setBusquedaArea] = useState('');
  const [coincidencias, setCoincidencias] = useState<any[] | null>(null);
  const [buscandoOficio, setBuscandoOficio] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { data: areas = [] } = useQuery({
    queryKey: ['areas'],
    queryFn: async () => (await axiosClient.get('/areas')).data.data,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => axiosClient.post('/solicitudes', payload),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['solicitudes'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate(`/solicitudes/${res.data.data._id}`);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Error al guardar la solicitud');
    },
  });

  const handleBuscarCoincidencias = async () => {
    if (!form.folioOficialia.trim()) return;
    setBuscandoOficio(true);
    try {
      const { data } = await axiosClient.get('/solicitudes/check-oficio', {
        params: { q: form.folioOficialia },
      });
      setCoincidencias(data.data);
    } finally {
      setBuscandoOficio(false);
    }
  };

  const toggleCorresponsable = (id: string) => {
    setForm((prev) => ({
      ...prev,
      areasCorresponsables: prev.areasCorresponsables.includes(id)
        ? prev.areasCorresponsables.filter((item) => item !== id)
        : [...prev.areasCorresponsables, id],
    }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!form.areaActual) {
      setErrorMsg('Selecciona un área responsable principal');
      return;
    }
    const payload = {
      ...form,
      fechaAtencion: form.fechaAtencion || undefined,
    };
    createMutation.mutate(payload);
  };

  const areasFiltradas = areas.filter((a: any) =>
    a.nombre.toLowerCase().includes(busquedaArea.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-[#e3e5e9] shadow-sm p-6 md:p-8 space-y-6">
        <div className="border-b border-[#e3e5e9] pb-4">
          <p className="text-sm font-bold text-[#731936]">Acceso verificado</p>
          <p className="text-xs text-[#707784]">
            Cuenta validada ({user?.nombre} · {user?.rol}).
          </p>
          <h1 className="text-2xl font-bold text-[#731936] mt-3">
            Registro de solicitudes · 2027–2029
          </h1>
          <p className="text-sm text-[#707784]">
            Registra la información de la solicitud y revisa los datos antes de continuar.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Datos generales */}
          <section className="border border-[#e3e5e9] rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-[#731936]">1 · Datos generales</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Fecha de recepción *</label>
                <input
                  type="date"
                  required
                  value={form.fechaRecepcion}
                  onChange={(e) => setForm({ ...form, fechaRecepcion: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  Folio de Oficialía / número de oficio (si existe)
                </label>
                <input
                  type="text"
                  placeholder="Ej. OF-2027-0125"
                  value={form.folioOficialia}
                  onChange={(e) => setForm({ ...form, folioOficialia: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
                <p className="text-[11px] text-[#707784] mt-1">
                  Antes de crear una solicitud, comprueba si ya existe un expediente con ese oficio.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Revisión de coincidencias</label>
                <button
                  type="button"
                  onClick={handleBuscarCoincidencias}
                  disabled={buscandoOficio || !form.folioOficialia.trim()}
                  className="w-full py-2 px-4 border border-[#731936] text-[#731936] hover:bg-[#731936]/5 font-semibold text-sm rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {buscandoOficio ? 'Buscando...' : 'Buscar oficio o expediente'}
                </button>
                {coincidencias !== null && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#f9f4f6] border border-[#e3cfd7] text-xs">
                    {coincidencias.length === 0 ? (
                      <span className="text-emerald-700 font-medium">
                        Sin coincidencias. Puedes registrar este oficio.
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-bold text-[#731936]">
                          Se encontraron {coincidencias.length} coincidencia(s):
                        </p>
                        {coincidencias.map((c) => (
                          <div key={c._id}>
                            • <strong>{c.folio}</strong> ({c.folioOficialia}) — {c.solicitante} [{c.estatus}]
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Enlace al oficio (Drive)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={form.enlaceOficioDrive}
                  onChange={(e) => setForm({ ...form, enlaceOficioDrive: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Nombre del solicitante *</label>
                <input
                  type="text"
                  required
                  value={form.solicitante}
                  onChange={(e) => setForm({ ...form, solicitante: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Contacto *</label>
                <input
                  type="text"
                  required
                  placeholder="Teléfono u otro medio de contacto"
                  value={form.contacto}
                  onChange={(e) => setForm({ ...form, contacto: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>
            </div>
          </section>

          {/* 2. Clasificación y seguimiento */}
          <section className="border border-[#e3e5e9] rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-[#731936]">2 · Clasificación y seguimiento</h2>

            <div>
              <label className="block text-xs font-semibold mb-1">Área responsable principal *</label>
              <select
                required
                value={form.areaActual}
                onChange={(e) => setForm({ ...form, areaActual: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white"
              >
                <option value="">Seleccionar dependencia...</option>
                {areas.map((a: any) => (
                  <option key={a._id} value={a._id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Áreas corresponsables */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold">Áreas corresponsables (opcional)</label>
              <p className="text-[11px] text-[#707784]">
                Marca las casillas de las dependencias que también atenderán el expediente.
              </p>
              <input
                type="search"
                placeholder="Buscar dependencia..."
                value={busquedaArea}
                onChange={(e) => setBusquedaArea(e.target.value)}
                className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
              />
              <div className="p-2.5 rounded-lg bg-[#f9f4f6] text-xs text-[#731936]">
                {form.areasCorresponsables.length === 0
                  ? 'Ninguna seleccionada'
                  : `${form.areasCorresponsables.length} dependencia(s) seleccionada(s)`}
              </div>
              <div className="max-h-48 overflow-y-auto border border-[#e3e5e9] rounded-lg divide-y divide-[#f0f0f2]">
                {areasFiltradas.map((a: any) => (
                  <label
                    key={a._id}
                    className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.areasCorresponsables.includes(a._id)}
                      onChange={() => toggleCorresponsable(a._id)}
                      className="accent-[#731936] w-4 h-4"
                    />
                    <span>{a.nombre}</span>
                  </label>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, areasCorresponsables: [] })}
                className="px-3 py-1.5 text-xs border border-[#731936] text-[#731936] rounded-lg font-semibold hover:bg-[#731936]/5 cursor-pointer"
              >
                Quitar todas las corresponsables
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold mb-1">Tipo de solicitud *</label>
                <select
                  required
                  value={form.tipoSolicitud}
                  onChange={(e) => setForm({ ...form, tipoSolicitud: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white"
                >
                  <option value="">Seleccionar del catálogo homologado</option>
                  {TIPOS_SOLICITUD.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tipo de petición *</label>
                <select
                  required
                  value={form.tipoPeticion}
                  onChange={(e) => setForm({ ...form, tipoPeticion: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white"
                >
                  <option value="">Seleccionar</option>
                  {TIPOS_PETICION.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Prioridad *</label>
                <select
                  value={form.prioridad}
                  onChange={(e) => setForm({ ...form, prioridad: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white"
                >
                  <option value="BAJA">Baja</option>
                  <option value="MEDIA">Media</option>
                  <option value="ALTA">Alta</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Estatus *</label>
                <select
                  value={form.estatus}
                  onChange={(e) => setForm({ ...form, estatus: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm bg-white"
                >
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="TURNADA">TURNADA</option>
                  <option value="EN_PROCESO">EN PROCESO</option>
                  <option value="ATENDIDA">ATENDIDA</option>
                </select>
                <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#b91c1c] text-white">
                  {form.estatus.replace('_', ' ')}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Persona encargada</label>
                <input
                  type="text"
                  value={form.personaEncargada}
                  onChange={(e) => setForm({ ...form, personaEncargada: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Fecha de atención</label>
                <input
                  type="date"
                  value={form.fechaAtencion}
                  onChange={(e) => setForm({ ...form, fechaAtencion: e.target.value })}
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">
                Descripción y observaciones de la solicitud *
              </label>
              <textarea
                required
                rows={4}
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
              />
            </div>
          </section>

          {/* 3. Domicilio de la solicitud */}
          <section className="border border-[#e3e5e9] rounded-xl p-5 space-y-4">
            <h2 className="text-base font-bold text-[#731936]">
              3 · Domicilio de la solicitud (una sola ubicación)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Calle principal *</label>
                <input
                  required
                  placeholder="Nombre de la calle"
                  value={form.domicilio.callePrincipal}
                  onChange={(e) =>
                    setForm({ ...form, domicilio: { ...form.domicilio, callePrincipal: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Número exterior *</label>
                <input
                  required
                  placeholder="Número o S/N"
                  value={form.domicilio.numeroExterior}
                  onChange={(e) =>
                    setForm({ ...form, domicilio: { ...form.domicilio, numeroExterior: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Entre calle (opcional)</label>
                <input
                  value={form.domicilio.entreCalle}
                  onChange={(e) =>
                    setForm({ ...form, domicilio: { ...form.domicilio, entreCalle: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Y calle (opcional)</label>
                <input
                  value={form.domicilio.yCalle}
                  onChange={(e) =>
                    setForm({ ...form, domicilio: { ...form.domicilio, yCalle: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Colonia *</label>
                <input
                  required
                  placeholder="Nombre de la colonia"
                  value={form.domicilio.colonia}
                  onChange={(e) =>
                    setForm({ ...form, domicilio: { ...form.domicilio, colonia: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Código postal *</label>
                <input
                  required
                  maxLength={5}
                  placeholder="Cinco dígitos"
                  value={form.domicilio.codigoPostal}
                  onChange={(e) =>
                    setForm({ ...form, domicilio: { ...form.domicilio, codigoPostal: e.target.value } })
                  }
                  className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Referencias para ubicar el sitio *</label>
              <textarea
                required
                rows={3}
                placeholder="Ej. Frente a la escuela, esquina con..."
                value={form.domicilio.referencias}
                onChange={(e) =>
                  setForm({ ...form, domicilio: { ...form.domicilio, referencias: e.target.value } })
                }
                className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
              />
            </div>
          </section>

          {/* 4. Documentos vinculados */}
          <section className="border border-[#e3e5e9] rounded-xl p-5 space-y-3">
            <h2 className="text-base font-bold text-[#731936]">4 · Documentos vinculados</h2>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Enlace de evidencia o PDF en Google Drive
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={form.enlaceEvidenciaDrive}
                onChange={(e) => setForm({ ...form, enlaceEvidenciaDrive: e.target.value })}
                className="w-full px-3 py-2 border border-[#cbd0d6] rounded-lg text-sm"
              />
              <p className="text-[11px] text-[#707784] mt-1">
                La evidencia es opcional y puede incorporarse durante el seguimiento.
              </p>
            </div>
          </section>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-6 py-2.5 bg-[#731936] hover:bg-[#4b1027] text-white font-semibold text-sm rounded-lg cursor-pointer transition disabled:opacity-50"
            >
              {createMutation.isPending ? 'Guardando expediente...' : 'Guardar solicitud'}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(INITIAL_FORM);
                setCoincidencias(null);
              }}
              className="px-5 py-2.5 border border-[#731936] text-[#731936] hover:bg-[#731936]/5 font-semibold text-sm rounded-lg cursor-pointer"
            >
              Limpiar formulario
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};