import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { AppError } from '../../core/errors/AppError';

/**
 * Validación de direcciones y coordenadas de Poza Rica.
 * - Geocodificación con Nominatim (OpenStreetMap), con caché y máximo 1 petición/segundo
 *   (política de uso: https://operations.osmfoundation.org/policies/nominatim/).
 * - Detección de la Zona (110 zonas) por point-in-polygon sobre un GeoJSON local.
 */

/** Caja del municipio (la misma que usa el mapa del frontend). */
export const BBOX_POZA_RICA = { oeste: -97.53, norte: 20.61, este: -97.39, sur: 20.47 };
const VIEWBOX = `${BBOX_POZA_RICA.oeste},${BBOX_POZA_RICA.norte},${BBOX_POZA_RICA.este},${BBOX_POZA_RICA.sur}`;
const USER_AGENT = 'SistemaSolicitudesPozaRica/1.0';

export const dentroDelMunicipio = (lat: number, lng: number) =>
  lat >= BBOX_POZA_RICA.sur && lat <= BBOX_POZA_RICA.norte && lng >= BBOX_POZA_RICA.oeste && lng <= BBOX_POZA_RICA.este;

// ── Nominatim: cola (1 req/s) + caché en memoria ─────────────────────────────

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const CACHE_MAX = 500;
const cache = new Map<string, { expira: number; valor: unknown }>();
let cola: Promise<unknown> = Promise.resolve();
let ultimaPeticion = 0;

const pedirNominatim = <T>(ruta: 'search' | 'reverse', params: Record<string, string>): Promise<T> => {
  const qs = new URLSearchParams({ format: 'jsonv2', 'accept-language': 'es', ...params });
  const url = `${env.NOMINATIM_URL.replace(/\/$/, '')}/${ruta}?${qs}`;

  const enCache = cache.get(url);
  if (enCache && enCache.expira > Date.now()) return Promise.resolve(enCache.valor as T);

  const tarea = cola.then(async () => {
    const espera = 1100 - (Date.now() - ultimaPeticion);
    if (espera > 0) await new Promise((r) => setTimeout(r, espera));
    ultimaPeticion = Date.now();
    let res: globalThis.Response;
    try {
      res = await fetch(url, {
        headers: { Accept: 'application/json', 'User-Agent': USER_AGENT },
        signal: AbortSignal.timeout(8000),
      });
    } catch {
      throw new AppError('No se pudo consultar el servicio de mapas (OpenStreetMap)', 502);
    }
    if (!res.ok) throw new AppError(`El servicio de mapas respondió ${res.status}`, 502);
    const valor = (await res.json()) as T;
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
    cache.set(url, { expira: Date.now() + CACHE_TTL_MS, valor });
    return valor;
  });
  cola = tarea.catch(() => undefined);
  return tarea;
};

export interface DireccionDetectada {
  callePrincipal?: string;
  numeroExterior?: string;
  colonia?: string;
  codigoPostal?: string;
  descripcion?: string;
}

/** Coordenada → dirección. */
export const reverse = async (lat: number, lng: number): Promise<DireccionDetectada> => {
  const data = await pedirNominatim<any>('reverse', {
    lat: String(lat),
    lon: String(lng),
    zoom: '18',
    addressdetails: '1',
  });
  const a = data?.address || {};
  const cp = typeof a.postcode === 'string' ? a.postcode.replace(/\D/g, '').slice(0, 5) : undefined;
  return {
    callePrincipal: a.road || a.pedestrian || a.footway || a.path || undefined,
    numeroExterior: a.house_number || undefined,
    colonia: a.neighbourhood || a.suburb || a.quarter || a.residential || a.city_district || a.hamlet || undefined,
    codigoPostal: cp && cp.length === 5 ? cp : undefined,
    descripcion: data?.display_name,
  };
};

export interface CandidatoUbicacion {
  latitud: number;
  longitud: number;
  descripcion: string;
  precision: 'DIRECCION' | 'COLONIA';
}

/** Dirección → coordenada candidata (del intento más preciso al más general). */
export const buscar = async (d: {
  callePrincipal?: string;
  numeroExterior?: string;
  colonia?: string;
  codigoPostal?: string;
}): Promise<CandidatoUbicacion | null> => {
  const limpiar = (v?: string) => (v || '').trim();
  const numero = /^\d+[a-z]?$/i.test(limpiar(d.numeroExterior)) ? limpiar(d.numeroExterior) : '';
  const calle = [limpiar(d.callePrincipal), numero].filter(Boolean).join(' ');
  const colonia = limpiar(d.colonia);
  const cp = limpiar(d.codigoPostal);
  const sufijo = 'Poza Rica, Veracruz, Mexico';

  const intentos: { q: string; precision: CandidatoUbicacion['precision'] }[] = [];
  if (calle && colonia) intentos.push({ q: [calle, colonia, cp, sufijo].filter(Boolean).join(', '), precision: 'DIRECCION' });
  if (calle) intentos.push({ q: [calle, sufijo].join(', '), precision: 'DIRECCION' });
  if (colonia) intentos.push({ q: [colonia, cp, sufijo].filter(Boolean).join(', '), precision: 'COLONIA' });
  if (!intentos.length) throw new AppError('Indica al menos la calle principal o la colonia', 400);

  for (const intento of intentos) {
    const resultados = await pedirNominatim<any[]>('search', {
      q: intento.q,
      limit: '1',
      countrycodes: 'mx',
      viewbox: VIEWBOX,
      bounded: '1',
    });
    const r = resultados?.[0];
    if (r) {
      return {
        latitud: Number(r.lat),
        longitud: Number(r.lon),
        descripcion: r.display_name,
        precision: intento.precision,
      };
    }
  }
  return null;
};

// ── Zonas (point-in-polygon) ─────────────────────────────────────────────────

type Anillo = number[][];
type Poligono = Anillo[];
interface ZonasGeoJSON {
  type: 'FeatureCollection';
  features: { properties: Record<string, any> | null; geometry: any }[];
}

const PROPIEDADES_NOMBRE = ['zona', 'ZONA', 'Zona', 'nombre', 'NOMBRE', 'Nombre', 'name', 'NAME', 'Name'];
let zonasCache: { mtime: number; data: ZonasGeoJSON } | null = null;

const rutaZonas = () => path.resolve(process.cwd(), env.ZONAS_GEOJSON_PATH);

/** Carga el GeoJSON (y lo recarga si el archivo cambia). null si aún no existe. */
export const cargarZonas = (): ZonasGeoJSON | null => {
  const ruta = rutaZonas();
  let stat: fs.Stats;
  try {
    stat = fs.statSync(ruta);
  } catch {
    zonasCache = null;
    return null;
  }
  if (zonasCache && zonasCache.mtime === stat.mtimeMs) return zonasCache.data;
  try {
    const json = JSON.parse(fs.readFileSync(ruta, 'utf8'));
    if (json?.type !== 'FeatureCollection' || !Array.isArray(json.features)) {
      console.error(`El archivo de zonas ${ruta} no es un FeatureCollection válido`);
      return null;
    }
    zonasCache = { mtime: stat.mtimeMs, data: json };
    return json;
  } catch (err: any) {
    console.error(`No se pudo leer el archivo de zonas ${ruta}:`, err.message);
    return null;
  }
};

const dentroDeAnillo = (x: number, y: number, anillo: Anillo) => {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
};

const dentroDePoligono = (x: number, y: number, p: Poligono) =>
  p.length > 0 && dentroDeAnillo(x, y, p[0]) && !p.slice(1).some((hueco) => dentroDeAnillo(x, y, hueco));

const nombreDeZona = (props: Record<string, any> | null, indice: number) => {
  for (const clave of PROPIEDADES_NOMBRE) {
    const v = props?.[clave];
    if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
  }
  return `ZONA ${indice + 1}`;
};

export const detectarZona = (lat: number, lng: number): string | undefined => {
  const geojson = cargarZonas();
  if (!geojson) return undefined;
  for (let i = 0; i < geojson.features.length; i++) {
    const g = geojson.features[i].geometry;
    if (!g) continue;
    const poligonos: Poligono[] = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    if (poligonos.some((p) => dentroDePoligono(lng, lat, p))) return nombreDeZona(geojson.features[i].properties, i);
  }
  return undefined;
};

/** Valida una coordenada: dentro del municipio y en qué zona cae. */
export const validarPunto = (lat: number, lng: number) => {
  const zonasDisponibles = !!cargarZonas();
  return {
    latitud: lat,
    longitud: lng,
    dentroMunicipio: dentroDelMunicipio(lat, lng),
    zona: detectarZona(lat, lng) ?? null,
    zonasDisponibles,
  };
};
