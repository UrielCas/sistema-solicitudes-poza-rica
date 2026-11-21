/**
 * Detección de la Zona (de las 110 de Poza Rica) mediante point-in-polygon (ray casting).
 * Recibe un FeatureCollection de Polygon/MultiPolygon en WGS84 ([lng, lat]).
 */
type Anillo = number[][];
type Poligono = Anillo[];

export interface ZonasGeoJSON {
  type: 'FeatureCollection';
  features: { type: 'Feature'; properties: Record<string, any> | null; geometry: any }[];
}

const PROPIEDADES_NOMBRE = ['zona', 'ZONA', 'Zona', 'nombre', 'NOMBRE', 'Nombre', 'name', 'NAME', 'Name'];

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

export const nombreDeZona = (props: Record<string, any> | null, indice: number) => {
  for (const clave of PROPIEDADES_NOMBRE) {
    const v = props?.[clave];
    if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
  }
  return `ZONA ${indice + 1}`;
};

export const esZonasGeoJSON = (json: any): json is ZonasGeoJSON =>
  json?.type === 'FeatureCollection' && Array.isArray(json.features);

export const detectarZona = (geojson: ZonasGeoJSON | null, lat: number, lng: number): string | undefined => {
  if (!geojson) return undefined;
  for (let i = 0; i < geojson.features.length; i++) {
    const g = geojson.features[i].geometry;
    if (!g) continue;
    const poligonos: Poligono[] = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
    if (poligonos.some((p) => dentroDePoligono(lng, lat, p))) return nombreDeZona(geojson.features[i].properties, i);
  }
  return undefined;
};
