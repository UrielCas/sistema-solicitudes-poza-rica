import { useState, FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { AppLayout } from '../../../../shared/components/AppLayout';
import { Alert, Button, Input, Select, Textarea } from '../../../../shared/components/ui';
import { mensajeDeError } from '../../../../core/errors/AppFailure';
import { etiquetaEstatus } from '../../../../core/constants/estatus';
import { TEXTOS } from '../../../../core/constants/strings';
import { hoyISO, normalizar } from '../../../../core/utils/formatters';
import { useAuthStore } from '../../../auth/presentation/store/useAuthStore';
import { esAdmin } from '../../../auth/domain/entities/User';
import { useAreas, useCatalogos } from '../../../catalogos/presentation/hooks/useCatalogos';
import { consultarSolicitudesUseCase, crearSolicitudUseCase } from '../../di';
import { CoincidenciaOficio, NuevaSolicitud } from '../../domain/entities/Solicitud';
import { UbicacionMapa } from '../components/mapa/UbicacionMapa';
import { AdjuntosSelector } from '../components/AdjuntosSelector';
import { EstatusChip } from '../components/EstatusChip';
import { useRefrescarSolicitudes } from '../hooks/useSolicitudes';

const formularioVacio = (): NuevaSolicitud => ({
  fechaRecepcion: hoyISO(),
  folioOficialia: '',
  enlaceOficioDrive: '',
  solicitante: '',
  contacto: '',
  areaActual: '',
  areasCorresponsables: [],
  tipoSolicitud: '',
  tipoPeticion: '',
  prioridad: 'MEDIA',
  estatus: 'PENDIENTE',
  personaEncargada: '',
  fechaAtencion: '',
  descripcion: '',
  domicilio: { callePrincipal: '', numeroExterior: '', entreCalle: '', yCalle: '', colonia: '', codigoPostal: '', referencias: '' },
  enlaceEvidenciaDrive: '',
  geo: null,
});

const Seccion = ({ numero, titulo, children }: { numero: number; titulo: string; children: ReactNode }) => (
  <section className="border border-borde rounded-xl p-5 space-y-4">
    <h2 className="text-base font-bold text-guinda">
      {numero} · {titulo}
    </h2>
    {children}
  </section>
);

/** Captura de solicitudes (áreas municipales y Administrador). */
export const NuevaSolicitudPage = () => {
  const navigate = useNavigate();
  const refrescar = useRefrescarSolicitudes();
  const user = useAuthStore((s) => s.user);
  const admin = esAdmin(user);
  const { areas } = useAreas();
  const { catalogos, isError: errorCatalogos } = useCatalogos();

  const [form, setForm] = useState<NuevaSolicitud>(formularioVacio);
  const [adjuntos, setAdjuntos] = useState<File[]>([]);
  const [busquedaArea, setBusquedaArea] = useState('');
  const [coincidencias, setCoincidencias] = useState<CoincidenciaOficio[] | null>(null);
  const [buscandoOficio, setBuscandoOficio] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [exito, setExito] = useState<{ texto: string; fallidos: string[] } | null>(null);

  const set = <K extends keyof NuevaSolicitud>(k: K, v: NuevaSolicitud[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setDom = (k: keyof NuevaSolicitud['domicilio'], v: string) =>
    setForm((f) => ({ ...f, domicilio: { ...f.domicilio, [k]: v } }));

  const limpiar = () => {
    setForm(formularioVacio());
    setAdjuntos([]);
    setCoincidencias(null);
  };

  const crear = useMutation({
    mutationFn: () => crearSolicitudUseCase.execute(form, admin, adjuntos),
    onSuccess: ({ solicitud, adjuntosFallidos }) => {
      refrescar();
      if (admin && adjuntosFallidos.length === 0) {
        navigate(`/solicitudes/${solicitud._id}`);
        return;
      }
      // Las áreas no consultan expedientes: se confirma el folio y el formulario queda listo para otra captura.
      setExito({
        texto: `Solicitud registrada con folio ${solicitud.folio}. Quedó enviada al Administrador para su seguimiento.`,
        fallidos: adjuntosFallidos,
      });
      limpiar();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    onError: (err) => {
      setErrorMsg(mensajeDeError(err, 'Error al guardar la solicitud'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const buscarOficio = async () => {
    setBuscandoOficio(true);
    try {
      setCoincidencias(await consultarSolicitudesUseCase.buscarOficio(form.folioOficialia));
    } catch (err) {
      setErrorMsg(mensajeDeError(err));
    } finally {
      setBuscandoOficio(false);
    }
  };

  const toggleCorresponsable = (id: string) =>
    set(
      'areasCorresponsables',
      form.areasCorresponsables.includes(id) ? form.areasCorresponsables.filter((x) => x !== id) : [...form.areasCorresponsables, id]
    );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setExito(null);
    crear.mutate();
  };

  const areasCorresponsables = areas.filter(
    (a) =>
      normalizar(a.nombre).includes(normalizar(busquedaArea)) &&
      a._id !== (admin ? form.areaActual : user?.area?._id)
  );

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-borde shadow-sm p-6 md:p-8 space-y-6">
        <div className="border-b border-borde pb-4">
          <p className="text-sm font-bold text-guinda">Acceso verificado</p>
          <p className="text-xs text-texto-suave">Cuenta validada ({admin ? 'Administrador' : user?.area?.nombre || user?.nombre}).</p>
          <h1 className="text-2xl font-bold text-guinda mt-3">Registro de solicitudes · {TEXTOS.periodoSistema}</h1>
          <p className="text-sm text-texto-suave">Registra la información de la solicitud y revisa los datos antes de continuar.</p>
        </div>

        {exito && (
          <Alert tipo="exito">
            {exito.texto}
            {exito.fallidos.length > 0 && (
              <span className="block mt-2 text-amber-900">
                No se pudieron adjuntar: {exito.fallidos.join(' · ')}. Pide al Administrador que los agregue al expediente.
              </span>
            )}
          </Alert>
        )}
        {errorMsg && <Alert tipo="error">{errorMsg}</Alert>}
        {errorCatalogos && <Alert tipo="aviso">No se pudieron cargar los catálogos. Recarga la página antes de capturar.</Alert>}

        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          <Seccion numero={1} titulo="Datos generales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Fecha de recepción *" type="date" value={form.fechaRecepcion} onChange={(e) => set('fechaRecepcion', e.target.value)} />
              <Input
                label="Folio de Oficialía / número de oficio (si existe)"
                placeholder="Ej. OF-2027-0125"
                value={form.folioOficialia}
                onChange={(e) => set('folioOficialia', e.target.value)}
                ayuda="Antes de crear una solicitud, comprueba si ya existe un expediente con ese oficio."
              />
              <div>
                <span className="block text-xs font-semibold mb-1">Revisión de coincidencias</span>
                <Button
                  variante="secundario"
                  className="w-full"
                  onClick={buscarOficio}
                  cargando={buscandoOficio}
                  textoCargando="Buscando..."
                  disabled={form.folioOficialia.trim().length < 2}
                >
                  Buscar oficio o expediente
                </Button>
                {coincidencias !== null && (
                  <div className="mt-2 p-2.5 rounded-lg bg-[#f9f4f6] border border-[#e3cfd7] text-xs">
                    {coincidencias.length === 0 ? (
                      <span className="text-emerald-700 font-medium">Sin coincidencias. Puedes registrar este oficio.</span>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-bold text-guinda">Se encontraron {coincidencias.length} coincidencia(s):</p>
                        {coincidencias.map((c) => (
                          <div key={c._id} className="flex flex-wrap items-center gap-1.5">
                            • <strong>{c.folio}</strong> ({c.folioOficialia}){c.solicitante ? ` — ${c.solicitante}` : ''}{' '}
                            <EstatusChip estatus={c.estatus} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <Input
                label="Enlace al oficio (Drive)"
                type="url"
                placeholder="https://drive.google.com/..."
                value={form.enlaceOficioDrive}
                onChange={(e) => set('enlaceOficioDrive', e.target.value)}
              />
              <Input label="Nombre del solicitante *" value={form.solicitante} onChange={(e) => set('solicitante', e.target.value)} />
              <Input
                label="Contacto *"
                placeholder="Teléfono u otro medio de contacto"
                value={form.contacto}
                onChange={(e) => set('contacto', e.target.value)}
              />
            </div>
          </Seccion>

          <Seccion numero={2} titulo="Clasificación y seguimiento">
            {admin ? (
              <Select label="Área responsable principal *" value={form.areaActual} onChange={(e) => set('areaActual', e.target.value)}>
                <option value="">Seleccionar dependencia...</option>
                {areas.map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.nombre}
                  </option>
                ))}
              </Select>
            ) : (
              <div>
                <span className="block text-xs font-semibold mb-1">Área responsable principal *</span>
                <div className="w-full px-3 py-2 border border-borde rounded-lg text-sm bg-[#f9f4f6] text-guinda font-semibold">
                  {user?.area?.nombre || 'Tu área'}
                  <span className="block text-[11px] font-normal text-texto-suave">La solicitud queda vinculada automáticamente a tu área.</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <span className="block text-xs font-semibold">Áreas corresponsables (opcional)</span>
              <p className="text-[11px] text-texto-suave">Marca las casillas de las dependencias que también atenderán el expediente.</p>
              <Input type="search" placeholder="Buscar dependencia..." value={busquedaArea} onChange={(e) => setBusquedaArea(e.target.value)} aria-label="Buscar dependencia" />
              <div className="p-2.5 rounded-lg bg-[#f9f4f6] text-xs text-guinda">
                {form.areasCorresponsables.length === 0
                  ? 'Ninguna seleccionada'
                  : `${form.areasCorresponsables.length} dependencia(s) seleccionada(s)`}
              </div>
              <div className="max-h-48 overflow-y-auto scroll-guinda border border-borde rounded-lg divide-y divide-[#f0f0f2]">
                {areasCorresponsables.map((a) => (
                  <label key={a._id} className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.areasCorresponsables.includes(a._id)}
                      onChange={() => toggleCorresponsable(a._id)}
                      className="accent-guinda w-4 h-4"
                    />
                    <span>{a.nombre}</span>
                  </label>
                ))}
              </div>
              {form.areasCorresponsables.length > 0 && (
                <Button tamano="sm" variante="secundario" onClick={() => set('areasCorresponsables', [])}>
                  Quitar todas las corresponsables
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <Select label="Tipo de solicitud *" value={form.tipoSolicitud} onChange={(e) => set('tipoSolicitud', e.target.value)}>
                <option value="">Seleccionar del catálogo homologado</option>
                {catalogos.TIPO_SOLICITUD.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.etiqueta}
                  </option>
                ))}
              </Select>
              <Select label="Tipo de petición *" value={form.tipoPeticion} onChange={(e) => set('tipoPeticion', e.target.value)}>
                <option value="">Seleccionar</option>
                {catalogos.TIPO_PETICION.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.etiqueta}
                  </option>
                ))}
              </Select>
              <Select label="Prioridad *" value={form.prioridad} onChange={(e) => set('prioridad', e.target.value as NuevaSolicitud['prioridad'])}>
                {(catalogos.PRIORIDAD.length
                  ? catalogos.PRIORIDAD
                  : [
                      { valor: 'BAJA', etiqueta: 'Baja' },
                      { valor: 'MEDIA', etiqueta: 'Media' },
                      { valor: 'ALTA', etiqueta: 'Alta' },
                      { valor: 'URGENTE', etiqueta: 'Urgente' },
                    ]
                ).map((p) => (
                  <option key={p.valor} value={p.valor}>
                    {p.etiqueta}
                  </option>
                ))}
              </Select>
              {admin && (
                <div>
                  <Select label="Estatus *" value={form.estatus} onChange={(e) => set('estatus', e.target.value as NuevaSolicitud['estatus'])}>
                    {(['PENDIENTE', 'EN_PROCESO', 'ATENDIDA'] as const).map((e) => (
                      <option key={e} value={e}>
                        {etiquetaEstatus(e)}
                      </option>
                    ))}
                  </Select>
                  <div className="mt-2">
                    <EstatusChip estatus={form.estatus} />
                  </div>
                </div>
              )}
              <Input label="Persona encargada" value={form.personaEncargada} onChange={(e) => set('personaEncargada', e.target.value)} />
              <Input label="Fecha de atención" type="date" value={form.fechaAtencion} onChange={(e) => set('fechaAtencion', e.target.value)} />
            </div>

            <Textarea
              label="Descripción y observaciones de la solicitud *"
              rows={4}
              value={form.descripcion}
              onChange={(e) => set('descripcion', e.target.value)}
            />
          </Seccion>

          <Seccion numero={3} titulo="Domicilio de la solicitud (una sola ubicación)">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Calle principal *" placeholder="Nombre de la calle" value={form.domicilio.callePrincipal} onChange={(e) => setDom('callePrincipal', e.target.value)} />
              <Input label="Número exterior *" placeholder="Número o S/N" value={form.domicilio.numeroExterior} onChange={(e) => setDom('numeroExterior', e.target.value)} />
              <Input label="Entre calle (opcional)" value={form.domicilio.entreCalle} onChange={(e) => setDom('entreCalle', e.target.value)} />
              <Input label="Y calle (opcional)" value={form.domicilio.yCalle} onChange={(e) => setDom('yCalle', e.target.value)} />
              <Input label="Colonia *" placeholder="Nombre de la colonia" value={form.domicilio.colonia} onChange={(e) => setDom('colonia', e.target.value)} />
              <Input
                label="Código postal *"
                inputMode="numeric"
                maxLength={5}
                placeholder="Cinco dígitos"
                value={form.domicilio.codigoPostal}
                onChange={(e) => setDom('codigoPostal', e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <UbicacionMapa
              domicilio={form.domicilio}
              geo={form.geo ?? null}
              onGeoChange={(geo) => set('geo', geo)}
              onDomicilioDetectado={(campos) => setForm((f) => ({ ...f, domicilio: { ...f.domicilio, ...campos } }))}
            />

            <Textarea
              label="Referencias para ubicar el sitio *"
              rows={3}
              placeholder="Ej. Frente a la escuela, esquina con..."
              value={form.domicilio.referencias}
              onChange={(e) => setDom('referencias', e.target.value)}
            />
          </Seccion>

          <Seccion numero={4} titulo="Documentos vinculados">
            <AdjuntosSelector archivos={adjuntos} onChange={setAdjuntos} />
            <Input
              label="Enlace de evidencia o PDF en Google Drive (opcional)"
              type="url"
              placeholder="https://drive.google.com/..."
              value={form.enlaceEvidenciaDrive}
              onChange={(e) => set('enlaceEvidenciaDrive', e.target.value)}
              ayuda="La evidencia es opcional y puede incorporarse durante el seguimiento."
            />
          </Seccion>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" cargando={crear.isPending} textoCargando={adjuntos.length ? 'Guardando y subiendo archivos...' : 'Guardando expediente...'}>
              Guardar solicitud
            </Button>
            <Button
              variante="secundario"
              onClick={() => {
                limpiar();
                setErrorMsg('');
                setExito(null);
              }}
            >
              Limpiar formulario
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};
