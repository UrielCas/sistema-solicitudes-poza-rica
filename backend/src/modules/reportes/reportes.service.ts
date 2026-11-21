import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { SolicitudModel } from '../solicitudes/solicitudes.model';
import { construirFiltro } from '../solicitudes/solicitudes.service';
import { AuditModel } from '../../core/middleware/audit';
import { Paginacion, buildMeta } from '../../core/utils/pagination';

const ETIQUETAS_ESTATUS: Record<string, string> = {
  PENDIENTE: 'PENDIENTE',
  RECIBIDA: 'RECIBIDA',
  TURNADA: 'TURNADA',
  EN_PROCESO: 'EN PROCESO',
  ATENDIDA: 'ATENDIDO',
  RECHAZADA: 'NO PROCEDE',
  CERRADA: 'CERRADA',
};

/** Cifras del panel del Administrador: total, conteo por estatus y por dependencia. */
export const getDashboardStats = async () => {
  const [total, estatus, porArea] = await Promise.all([
    SolicitudModel.countDocuments(),
    SolicitudModel.aggregate([{ $group: { _id: '$estatus', total: { $sum: 1 } } }]),
    SolicitudModel.aggregate([
      { $group: { _id: '$areaActual', total: { $sum: 1 } } },
      { $lookup: { from: 'areas', localField: '_id', foreignField: '_id', as: 'area' } },
      { $project: { _id: { $ifNull: [{ $arrayElemAt: ['$area.nombre', 0] }, 'Sin asignar'] }, total: 1 } },
      { $sort: { total: -1, _id: 1 } },
    ]),
  ]);

  const porEstatus: Record<string, number> = {};
  for (const e of estatus) porEstatus[e._id] = e.total;

  return { total, porEstatus, porArea };
};

/**
 * fechaRecepcion y fechaAtencion son fechas de calendario (yyyy-mm-dd) que Mongo guarda a
 * medianoche UTC; formatearlas en hora de México las recorría un día hacia atrás.
 */
const fecha = (d?: Date) => (d ? new Date(d).toLocaleDateString('es-MX', { timeZone: 'UTC' }) : '');

const obtenerSolicitudes = (query: any): Promise<any[]> =>
  SolicitudModel.find(construirFiltro(query))
    .select('-evidencias')
    .populate('areaActual', 'nombre')
    .populate('areasCorresponsables', 'nombre')
    .sort({ createdAt: -1 })
    .lean();

/** Exporta las solicitudes (con los mismos filtros del listado) a un libro .xlsx. */
export const generarExcel = async (query: any = {}): Promise<Buffer> => {
  const docs = await obtenerSolicitudes(query);

  const filas = docs.map((s) => ({
    Folio: s.folio,
    'Folio Oficialía': s.folioOficialia || '',
    'Fecha de recepción': fecha(s.fechaRecepcion),
    Año: s.anio,
    Dependencia: s.areaActual?.nombre || 'Sin asignar',
    Corresponsables: (s.areasCorresponsables || []).map((a: any) => a?.nombre).filter(Boolean).join(', '),
    Solicitante: s.solicitante,
    Contacto: s.contacto,
    'Tipo de solicitud': s.tipoSolicitud,
    'Tipo de petición': s.tipoPeticion,
    Prioridad: s.prioridad,
    Estatus: ETIQUETAS_ESTATUS[s.estatus] || s.estatus,
    Descripción: s.descripcion,
    'Calle principal': s.domicilio?.callePrincipal || '',
    'Número exterior': s.domicilio?.numeroExterior || '',
    'Entre calle': s.domicilio?.entreCalle || '',
    'Y calle': s.domicilio?.yCalle || '',
    Colonia: s.domicilio?.colonia || '',
    'Código postal': s.domicilio?.codigoPostal || '',
    Referencias: s.domicilio?.referencias || '',
    Zona: s.zona || s.geo?.zona || '',
    Latitud: s.geo?.latitud ?? s.coordenadas?.lat ?? '',
    Longitud: s.geo?.longitud ?? s.coordenadas?.lng ?? '',
    'Persona encargada': s.personaEncargada || '',
    'Fecha de atención': fecha(s.fechaAtencion),
  }));

  const hoja = XLSX.utils.json_to_sheet(filas);
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Solicitudes');
  return XLSX.write(libro, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
};

// ── PDF ─────────────────────────────────────────────────────────────────────

const GUINDA = '#731936';
const GRIS = '#707784';

/** Reporte imprimible en PDF (carta horizontal): resumen por estatus + tabla de solicitudes. */
export const generarPdf = async (query: any = {}): Promise<Buffer> => {
  const docs = await obtenerSolicitudes(query);
  const pdf = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 36, bufferPages: true });
  const partes: Buffer[] = [];
  pdf.on('data', (b: Buffer) => partes.push(b));
  const terminado = new Promise<Buffer>((resolve) => pdf.on('end', () => resolve(Buffer.concat(partes))));

  const ancho = pdf.page.width - 72;
  const x0 = 36;

  // Encabezado
  pdf.rect(0, 0, pdf.page.width, 62).fill(GUINDA);
  pdf.fillColor('white').font('Helvetica-Bold').fontSize(15).text('GOBIERNO DE POZA RICA · PRESIDENCIA MUNICIPAL', x0, 16);
  pdf.font('Helvetica').fontSize(10).text('Reporte de solicitudes ciudadanas', x0, 36);
  pdf
    .fontSize(9)
    .text(`Generado: ${new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}`, x0, 36, {
      width: ancho,
      align: 'right',
    });

  // Filtros aplicados
  const filtros = [
    query.anio && `Año ${query.anio}`,
    query.estatus && `Estatus ${ETIQUETAS_ESTATUS[String(query.estatus)] || query.estatus}`,
    query.zona && `Zona ${query.zona}`,
    query.search && `Búsqueda "${query.search}"`,
  ].filter(Boolean);
  pdf.fillColor(GRIS).fontSize(9).text(filtros.length ? `Filtros: ${filtros.join(' · ')}` : 'Sin filtros', x0, 74);

  // Resumen por estatus
  const conteo: Record<string, number> = {};
  for (const s of docs) conteo[s.estatus] = (conteo[s.estatus] || 0) + 1;
  const resumen = [['TOTAL', docs.length] as const, ...Object.entries(conteo).map(([k, v]) => [ETIQUETAS_ESTATUS[k] || k, v] as const)];
  const anchoCaja = Math.min(120, ancho / resumen.length - 6);
  resumen.forEach(([etiqueta, total], i) => {
    const x = x0 + i * (anchoCaja + 6);
    pdf.roundedRect(x, 90, anchoCaja, 38, 4).lineWidth(0.6).strokeColor('#e3e5e9').stroke();
    pdf.fillColor(GRIS).font('Helvetica').fontSize(7.5).text(etiqueta, x + 6, 96, { width: anchoCaja - 12 });
    pdf.fillColor(GUINDA).font('Helvetica-Bold').fontSize(14).text(String(total), x + 6, 107, { width: anchoCaja - 12 });
  });

  // Tabla
  const columnas = [
    { titulo: 'Folio', ancho: 78, valor: (s: any) => s.folio },
    { titulo: 'Recepción', ancho: 58, valor: (s: any) => fecha(s.fechaRecepcion) },
    { titulo: 'Dependencia', ancho: 140, valor: (s: any) => s.areaActual?.nombre || 'Sin asignar' },
    { titulo: 'Tipo de solicitud', ancho: 112, valor: (s: any) => s.tipoSolicitud || '' },
    { titulo: 'Solicitante', ancho: 110, valor: (s: any) => s.solicitante || '' },
    { titulo: 'Colonia', ancho: 100, valor: (s: any) => s.domicilio?.colonia || '' },
    { titulo: 'Zona', ancho: 52, valor: (s: any) => s.zona || s.geo?.zona || '' },
    { titulo: 'Estatus', ancho: 70, valor: (s: any) => ETIQUETAS_ESTATUS[s.estatus] || s.estatus },
  ];
  const escala = ancho / columnas.reduce((t, c) => t + c.ancho, 0);
  columnas.forEach((c) => (c.ancho *= escala));

  const encabezadoTabla = (y: number) => {
    pdf.rect(x0, y, ancho, 18).fill('#f2e7ed');
    let x = x0;
    pdf.fillColor(GUINDA).font('Helvetica-Bold').fontSize(8);
    for (const c of columnas) {
      pdf.text(c.titulo, x + 4, y + 5, { width: c.ancho - 8, lineBreak: false });
      x += c.ancho;
    }
    return y + 18;
  };

  let y = encabezadoTabla(142);
  pdf.font('Helvetica').fontSize(7.8);
  if (!docs.length) {
    pdf.fillColor(GRIS).text('No hay solicitudes con estos filtros.', x0, y + 10, { width: ancho, align: 'center' });
  }
  docs.forEach((s, i) => {
    const valores = columnas.map((c) => String(c.valor(s) ?? ''));
    const alto =
      Math.max(...valores.map((v, j) => pdf.heightOfString(v, { width: columnas[j].ancho - 8 }))) + 8;
    if (y + alto > pdf.page.height - 40) {
      pdf.addPage();
      y = encabezadoTabla(36);
      pdf.font('Helvetica').fontSize(7.8);
    }
    if (i % 2 === 1) pdf.rect(x0, y, ancho, alto).fill('#fafafb');
    let x = x0;
    pdf.fillColor('#292b34');
    valores.forEach((v, j) => {
      pdf.text(v, x + 4, y + 4, { width: columnas[j].ancho - 8 });
      x += columnas[j].ancho;
    });
    y += alto;
  });

  // Pie de página con numeración
  const rango = pdf.bufferedPageRange();
  for (let i = 0; i < rango.count; i++) {
    pdf.switchToPage(rango.start + i);
    // El pie va dentro del margen inferior: sin esto pdfkit abre una hoja nueva en blanco.
    const margenInferior = pdf.page.margins.bottom;
    pdf.page.margins.bottom = 0;
    pdf
      .fillColor(GRIS)
      .fontSize(7.5)
      .text(`H. Ayuntamiento de Poza Rica de Hidalgo, Ver. · Página ${i + 1} de ${rango.count}`, x0, pdf.page.height - 28, {
        width: ancho,
        align: 'center',
        lineBreak: false,
      });
    pdf.page.margins.bottom = margenInferior;
  }

  pdf.end();
  return terminado;
};

// ── Bitácora de auditoría ───────────────────────────────────────────────────

export const listarAuditoria = async (query: any, p: Paginacion) => {
  const filtro: Record<string, unknown> = {};
  if (query.accion) filtro.accion = String(query.accion);
  if (query.usuario) filtro.usuario = String(query.usuario);
  if (query.recursoId) filtro.recursoId = String(query.recursoId);
  const [data, total] = await Promise.all([
    AuditModel.find(filtro)
      .populate('usuario', 'nombre email')
      .populate('area', 'nombre siglas')
      .sort({ createdAt: -1 })
      .skip(p.skip)
      .limit(p.limit)
      .lean(),
    AuditModel.countDocuments(filtro),
  ]);
  return { data, meta: buildMeta(total, p) };
};
