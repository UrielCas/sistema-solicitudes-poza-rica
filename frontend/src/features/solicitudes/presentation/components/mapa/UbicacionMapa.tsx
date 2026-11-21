import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { pinIcon } from '../../../../../core/leafletIcon';
import { POZA_RICA_CENTRO } from '../../../../../core/constants/strings';
import { COLORES } from '../../../../../core/constants/colores';
import { mensajeDeError } from '../../../../../core/errors/AppFailure';
import { Button } from '../../../../../shared/components/ui';
import { geolocalizarUseCase } from '../../../di';
import { GeoSolicitud } from '../../../domain/entities/Solicitud';
import { DomicilioBusqueda } from '../../../domain/entities/Ubicacion';

interface Props {
  domicilio: DomicilioBusqueda;
  geo: GeoSolicitud | null;
  onGeoChange: (geo: GeoSolicitud | null) => void;
  /** Solo trae los campos que se encontraron; los demás se conservan como el usuario los escribió. */
  onDomicilioDetectado: (campos: Partial<DomicilioBusqueda>) => void;
}

type Aviso = { tipo: 'info' | 'ok' | 'warn' | 'error'; texto: string } | null;

const COLOR_AVISO: Record<NonNullable<Aviso>['tipo'], string> = {
  info: 'bg-slate-50 border-slate-200 text-slate-700',
  ok: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  warn: 'bg-amber-50 border-amber-200 text-amber-900',
  error: 'bg-red-50 border-red-200 text-red-700',
};

const ClickEnMapa = ({ onClick }: { onClick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

/** Centra el mapa cuando el pin llega desde la búsqueda por texto. */
const SeguirPin = ({ destino }: { destino: { lat: number; lng: number; zoom: number; n: number } | null }) => {
  const map = useMap();
  useEffect(() => {
    if (destino) map.flyTo([destino.lat, destino.lng], destino.zoom, { duration: 0.8 });
  }, [destino, map]);
  return null;
};

const claveDireccion = (d: DomicilioBusqueda) =>
  [d.callePrincipal, d.numeroExterior, d.colonia, d.codigoPostal].map((v) => v.trim().toLowerCase()).join('|');

/** Mapa del punto 3: clic/arrastre llena la dirección; la dirección escrita mueve el pin. */
export const UbicacionMapa = ({ domicilio, geo, onGeoChange, onDomicilioDetectado }: Props) => {
  const { data: zonas = null, isFetched: zonasCargadas } = useQuery({
    queryKey: ['geo', 'zonas'],
    queryFn: () => geolocalizarUseCase.zonas(),
    staleTime: Infinity,
  });
  const [aviso, setAviso] = useState<Aviso>({
    tipo: 'info',
    texto: 'Haz clic en el mapa o arrastra el pin para llenar la dirección, o escribe la dirección y presiona "Ubicar dirección en mapa".',
  });
  const [buscando, setBuscando] = useState(false);
  const [destino, setDestino] = useState<{ lat: number; lng: number; zoom: number; n: number } | null>(null);
  const peticionReverse = useRef(0);
  const ultimaBusqueda = useRef('');

  // Si el GeoJSON termina de cargar después de colocar el pin, completa la zona.
  useEffect(() => {
    if (zonas && geo && !geo.zona) {
      const conZona = geolocalizarUseCase.construirGeo(geo.latitud, geo.longitud, geo.fuente, zonas);
      if (conZona.zona) onGeoChange(conZona);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zonas]);

  /** Mapa → formulario (reverse geocoding). */
  const colocarPinManual = async (lat: number, lng: number) => {
    onGeoChange(geolocalizarUseCase.construirGeo(lat, lng, 'MAPA', zonas));
    const id = ++peticionReverse.current;
    setAviso({ tipo: 'info', texto: 'Buscando la dirección de este punto...' });
    try {
      const d = await geolocalizarUseCase.direccionDePunto(lat, lng);
      if (id !== peticionReverse.current) return; // el usuario ya movió el pin otra vez
      if (d.zona && !zonas) onGeoChange(geolocalizarUseCase.construirGeo(lat, lng, 'MAPA', zonas, d.zona));
      const campos: Partial<DomicilioBusqueda> = {};
      if (d.callePrincipal) campos.callePrincipal = d.callePrincipal;
      if (d.numeroExterior) campos.numeroExterior = d.numeroExterior;
      if (d.colonia) campos.colonia = d.colonia;
      if (d.codigoPostal) campos.codigoPostal = d.codigoPostal;
      onDomicilioDetectado(campos);
      ultimaBusqueda.current = claveDireccion({ ...domicilio, ...campos });

      const faltantes = [!d.callePrincipal && 'calle', !d.colonia && 'colonia', !d.codigoPostal && 'código postal'].filter(Boolean);
      setAviso(
        faltantes.length
          ? {
              tipo: 'warn',
              texto: `OpenStreetMap no reporta ${faltantes.join(', ')} en este punto. Escríbelo a mano; la ubicación del pin se guarda de todos modos.`,
            }
          : { tipo: 'ok', texto: 'Dirección completada desde el mapa. Revísala y corrígela si hace falta.' }
      );
    } catch (err) {
      if (id !== peticionReverse.current) return;
      setAviso({ tipo: 'warn', texto: `${mensajeDeError(err)}. El pin se guarda; llena los campos a mano.` });
    }
  };

  /** Formulario → mapa (forward geocoding). */
  const ubicarDireccion = async () => {
    ultimaBusqueda.current = claveDireccion(domicilio);
    peticionReverse.current++; // descarta reverse pendientes
    setBuscando(true);
    setAviso({ tipo: 'info', texto: 'Buscando la dirección en el mapa...' });
    try {
      const r = await geolocalizarUseCase.puntoDeDireccion(domicilio);
      if (!r) {
        setAviso({
          tipo: 'warn',
          texto: 'No se encontró esa dirección en OpenStreetMap. Coloca el pin a mano haciendo clic en el mapa; lo que escribiste se conserva.',
        });
        return;
      }
      onGeoChange(geolocalizarUseCase.construirGeo(r.latitud, r.longitud, 'GEOCODIFICACION', zonas, r.zona));
      setDestino({ lat: r.latitud, lng: r.longitud, zoom: r.precision === 'DIRECCION' ? 17 : 15, n: Date.now() });
      setAviso(
        r.precision === 'DIRECCION'
          ? { tipo: 'ok', texto: 'Ubicación aproximada encontrada. Si el pin quedó desfasado, arrástralo al punto exacto.' }
          : { tipo: 'warn', texto: 'Solo se ubicó la colonia. Arrastra el pin al punto exacto de la solicitud.' }
      );
    } catch (err) {
      setAviso({ tipo: 'error', texto: `${mensajeDeError(err)}. Coloca el pin a mano; el formulario se puede enviar igual.` });
    } finally {
      setBuscando(false);
    }
  };

  // Búsqueda automática al terminar de escribir calle + colonia + CP (no en cada tecla),
  // solo si el pin no fue colocado a mano.
  useEffect(() => {
    const listo =
      domicilio.callePrincipal.trim().length >= 3 &&
      domicilio.colonia.trim().length >= 3 &&
      /^\d{5}$/.test(domicilio.codigoPostal.trim());
    if (!listo || geo?.fuente === 'MAPA' || claveDireccion(domicilio) === ultimaBusqueda.current) return;
    const t = setTimeout(ubicarDireccion, 1500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domicilio.callePrincipal, domicilio.numeroExterior, domicilio.colonia, domicilio.codigoPostal]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="block text-xs font-semibold">Ubicación en el mapa</span>
        <div className="flex flex-wrap gap-2">
          <Button tamano="sm" onClick={ubicarDireccion} cargando={buscando} textoCargando="Buscando...">
            <MapPin size={14} /> Ubicar dirección en mapa
          </Button>
          {geo && (
            <Button
              tamano="sm"
              variante="secundario"
              onClick={() => {
                peticionReverse.current++;
                onGeoChange(null);
                setAviso({ tipo: 'info', texto: 'Pin eliminado. La solicitud se guardará sin coordenadas.' });
              }}
            >
              Quitar pin
            </Button>
          )}
        </div>
      </div>

      <div className="h-[340px] md:h-[400px] rounded-lg overflow-hidden border border-borde relative z-0">
        <MapContainer center={POZA_RICA_CENTRO} zoom={14} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {zonas && (
            <GeoJSON
              data={zonas as any}
              interactive={false}
              style={{ color: COLORES.guinda, weight: 1, opacity: 0.45, fillOpacity: 0.04 }}
            />
          )}
          <ClickEnMapa onClick={colocarPinManual} />
          <SeguirPin destino={destino} />
          {geo && (
            <Marker
              position={[geo.latitud, geo.longitud]}
              icon={pinIcon}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = (e.target as L.Marker).getLatLng();
                  colocarPinManual(lat, lng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      {aviso && (
        <div role="status" className={`p-2.5 rounded-lg border text-xs ${COLOR_AVISO[aviso.tipo]}`}>
          {aviso.texto}
        </div>
      )}

      <p className="text-[11px] text-texto-suave">
        {geo ? (
          <>
            Coordenada: {geo.latitud.toFixed(6)}, {geo.longitud.toFixed(6)} · Zona:{' '}
            <strong>{geo.zona || (zonas ? 'fuera de las zonas registradas' : 'sin catálogo de zonas')}</strong>
          </>
        ) : (
          'Sin pin. La ubicación en mapa es opcional, pero ayuda a ubicar la solicitud en el mapa consolidado.'
        )}
        {zonasCargadas && !zonas && ' (Aún no se carga el archivo de las 110 zonas.)'}
      </p>
    </div>
  );
};
