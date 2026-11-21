import { AppFailure } from '../../../../core/errors/AppFailure';
import { CatalogosRepository } from '../repositories/CatalogosRepository';

export class ObtenerAreasUseCase {
  constructor(private readonly repo: CatalogosRepository) {}

  execute() {
    return this.repo.obtenerAreas();
  }
}

export class CrearAreaUseCase {
  constructor(private readonly repo: CatalogosRepository) {}

  execute(nombre: string, siglas: string) {
    if (nombre.trim().length < 3) throw new AppFailure('Escribe el nombre completo de la dependencia.');
    if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ]{2,10}$/.test(siglas.trim())) {
      throw new AppFailure('Las siglas deben tener de 2 a 10 letras, sin espacios.');
    }
    return this.repo.crearArea({ nombre: nombre.trim(), siglas: siglas.trim().toUpperCase() });
  }
}
