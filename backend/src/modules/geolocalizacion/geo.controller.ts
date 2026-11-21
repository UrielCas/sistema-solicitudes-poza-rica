import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../core/utils/asyncHandler';
import { ok } from '../../core/utils/serializers';
import { AppError } from '../../core/errors/AppError';
import * as geoService from './geo.service';

const coordenadaSchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

const texto = z.string().trim().max(150).optional();
const busquedaSchema = z.object({
  callePrincipal: texto,
  numeroExterior: texto,
  colonia: texto,
  codigoPostal: z.string().trim().regex(/^\d{5}$/, 'El código postal debe tener 5 dígitos').optional().or(z.literal('')),
});

/** GET /geo/reverse?lat=&lng= — Mapa → formulario. */
export const reverse = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = coordenadaSchema.parse(req.query);
  if (!geoService.dentroDelMunicipio(lat, lng)) throw new AppError('La coordenada está fuera de Poza Rica', 400);
  const direccion = await geoService.reverse(lat, lng);
  ok(res, { ...direccion, zona: geoService.detectarZona(lat, lng) ?? null });
});

/** GET /geo/buscar?callePrincipal=&colonia=&codigoPostal= — Formulario → mapa. */
export const buscar = asyncHandler(async (req: Request, res: Response) => {
  const datos = busquedaSchema.parse(req.query);
  const candidato = await geoService.buscar(datos);
  ok(
    res,
    candidato ? { ...candidato, zona: geoService.detectarZona(candidato.latitud, candidato.longitud) ?? null } : null
  );
});

/** POST /geo/validar { latitud, longitud } — ¿está en el municipio? ¿qué zona? */
export const validar = asyncHandler(async (req: Request, res: Response) => {
  const { lat, lng } = coordenadaSchema.parse({ lat: req.body?.latitud, lng: req.body?.longitud });
  ok(res, geoService.validarPunto(lat, lng));
});

/** GET /geo/zonas — GeoJSON de las 110 zonas (404 si aún no se carga el archivo). */
export const zonas = asyncHandler(async (_req: Request, res: Response) => {
  const geojson = geoService.cargarZonas();
  if (!geojson) throw new AppError('El archivo de zonas aún no está disponible en el servidor', 404);
  res.setHeader('Cache-Control', 'private, max-age=3600');
  res.json(geojson);
});
