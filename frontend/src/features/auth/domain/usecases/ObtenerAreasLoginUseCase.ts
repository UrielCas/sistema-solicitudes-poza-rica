import { AuthRepository } from '../repositories/AuthRepository';

export class ObtenerAreasLoginUseCase {
  constructor(private readonly repo: AuthRepository) {}

  execute() {
    return this.repo.obtenerAreasLogin();
  }
}
