const ZONA = 'America/Mexico_City';

/**
 * Las fechas "de calendario" (recepción, atención) se capturan como yyyy-mm-dd y la API
 * las guarda a medianoche UTC. Si se mostraran en hora de México saldrían un día antes,
 * así que esas se formatean en UTC.
 */
const esSoloFecha = (valor: string | Date) =>
  typeof valor === 'string' ? /^\d{4}-\d{2}-\d{2}(T00:00:00(\.000)?Z)?$/.test(valor) : false;

/** 21/11/2026 */
export const formatearFecha = (valor?: string | Date | null) => {
  if (!valor) return '—';
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('es-MX', { timeZone: esSoloFecha(valor) ? 'UTC' : ZONA });
};

/** 21/11/2026, 10:42 */
export const formatearFechaHora = (valor?: string | Date | null) => {
  if (!valor) return '—';
  const d = new Date(valor);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('es-MX', { timeZone: ZONA, dateStyle: 'short', timeStyle: 'short' });
};

/** "hace 5 min", "hace 2 h", "ayer"… para notificaciones. */
export const tiempoRelativo = (valor: string | Date) => {
  const seg = Math.round((Date.now() - new Date(valor).getTime()) / 1000);
  if (seg < 60) return 'hace un momento';
  if (seg < 3600) return `hace ${Math.floor(seg / 60)} min`;
  if (seg < 86400) return `hace ${Math.floor(seg / 3600)} h`;
  if (seg < 172800) return 'ayer';
  return formatearFecha(valor);
};

/** 1.2 MB */
export const formatearTamano = (bytes?: number) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/** Fecha de hoy en formato yyyy-mm-dd (hora de México) para inputs type="date". */
export const hoyISO = () => new Date().toLocaleDateString('en-CA', { timeZone: ZONA });

/** Quita acentos y pasa a minúsculas (búsquedas). */
export const normalizar = (v: string) => v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
