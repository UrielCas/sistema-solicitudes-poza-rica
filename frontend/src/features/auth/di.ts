import { axiosClient, configurarSesion } from '../../core/network/axiosClient';
import { queryClient } from '../../core/network/queryClient';
import { AuthRemoteDataSource } from './data/datasources/AuthRemoteDataSource';
import { AuthRepositoryImpl } from './data/repositories/AuthRepositoryImpl';
import { LoginUseCase } from './domain/usecases/LoginUseCase';
import { LogoutUseCase } from './domain/usecases/LogoutUseCase';
import { ObtenerAreasLoginUseCase } from './domain/usecases/ObtenerAreasLoginUseCase';
import { sesionStore, useAuthStore } from './presentation/store/useAuthStore';

/** Composición del módulo auth: aquí se conectan datos, dominio y presentación. */
export const authRepository = new AuthRepositoryImpl(new AuthRemoteDataSource(axiosClient));

export const loginUseCase = new LoginUseCase(authRepository, sesionStore);
export const logoutUseCase = new LogoutUseCase(sesionStore, () => queryClient.clear());
export const obtenerAreasLoginUseCase = new ObtenerAreasLoginUseCase(authRepository);

// El cliente HTTP lee/renueva los tokens desde el store de sesión.
configurarSesion({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  setTokens: (a, r) => useAuthStore.getState().setTokens(a, r),
  onSesionExpirada: () => logoutUseCase.execute(),
});
