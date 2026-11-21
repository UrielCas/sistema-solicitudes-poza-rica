import { AppFailure, mensajeDeError } from '../../../../core/errors/AppFailure';
import { validarArchivoEvidencia, validarCodigoPostal, validarEnlaceHttps } from '../../../../core/utils/validators';
import { EvidenciasRepository, SolicitudesRepository } from '../repositories/SolicitudesRepository';
import { NuevaSolicitud, Solicitud } from '../entities/Solicitud';

export interface ResultadoCreacion {
  solicitud: Solicitud;
  /** Adjuntos que no se pudieron subir (la solicitud sí quedó guardada). */
  adjuntosFallidos: string[];
}

/**
 * Registra una solicitud y, en seguida, sube los archivos adjuntos como evidencias.
 * Si un adjunto falla, la solicitud no se pierde: se informa cuáles fallaron.
 */
export class CrearSolicitudUseCase {
  constructor(
    private readonly solicitudes: SolicitudesRepository,
    private readonly evidencias: EvidenciasRepository
  ) {}

  validar(d: NuevaSolicitud, esAdmin: boolean, adjuntos: File[]) {
    if (esAdmin && !d.areaActual) return 'Selecciona un área responsable principal.';
    if (!d.solicitante.trim()) return 'Escribe el nombre del solicitante.';
    if (!d.contacto.trim()) return 'Escribe un medio de contacto.';
    if (!d.tipoSolicitud) return 'Selecciona el tipo de solicitud.';
    if (!d.tipoPeticion) return 'Selecciona el tipo de petición.';
    if (!d.descripcion.trim()) return 'Describe la solicitud.';
    const dom = d.domicilio;
    if (!dom.callePrincipal.trim() || !dom.numeroExterior.trim() || !dom.colonia.trim() || !dom.referencias.trim()) {
      return 'Completa el domicilio: calle, número, colonia y referencias.';
    }
    const cp = validarCodigoPostal(dom.codigoPostal);
    if (cp) return cp;
    for (const enlace of [d.enlaceOficioDrive, d.enlaceEvidenciaDrive]) {
      if (enlace.trim()) {
        const e = validarEnlaceHttps(enlace);
        if (e) return e;
      }
    }
    for (const archivo of adjuntos) {
      const e = validarArchivoEvidencia(archivo);
      if (e) return e;
    }
    return null;
  }

  async execute(datos: NuevaSolicitud, esAdmin: boolean, adjuntos: File[] = []): Promise<ResultadoCreacion> {
    const error = this.validar(datos, esAdmin, adjuntos);
    if (error) throw new AppFailure(error);

    const solicitud = await this.solicitudes.crear(datos);

    const adjuntosFallidos: string[] = [];
    for (const archivo of adjuntos) {
      try {
        await this.evidencias.subirArchivo(solicitud._id, archivo);
      } catch (e) {
        adjuntosFallidos.push(`${archivo.name}: ${mensajeDeError(e)}`);
      }
    }
    return { solicitud, adjuntosFallidos };
  }
}
