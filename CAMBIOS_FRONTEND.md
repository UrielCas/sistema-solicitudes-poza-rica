# Frontend: reestructuración por capas

Fecha: 21/11/2026

El frontend (React + Vite + TypeScript) se reorganizó con la misma arquitectura por capas propuesta para Flutter (`data` / `domain` / `presentation`). Además ahora usa todos los módulos nuevos del backend: catálogos, geolocalización, evidencias, notificaciones, reportes PDF y bitácora.

Documentos relacionados: [CAMBIOS_BACKEND.md](CAMBIOS_BACKEND.md) y [CAMBIOS_LOGIN_Y_ERRORES.md](CAMBIOS_LOGIN_Y_ERRORES.md).

## 1. Equivalencias Flutter → React

| Flutter (propuesta) | React (este proyecto) |
|---|---|
| `main.dart` / `app.dart` (MaterialApp.router + tema) | `main.tsx` / `App.tsx` + `core/theme/theme.css` |
| Riverpod `AuthNotifier` (providers) | Zustand `useAuthStore` (store) + React Query (datos del servidor) |
| Dio client + interceptores | `core/network/axiosClient.ts` (axios + interceptores) |
| GoRouter con guards por rol | `routes/AppRouter.tsx` (react-router + `ProtectedRoute`) |
| `screens/` | `presentation/pages/` |
| `widgets/` | `presentation/components/` y `shared/components/ui/` |
| `shared/models/ApiResponse<T>` | `shared/types/ApiResponse.ts` |

## 2. Estructura final

```
src/
├── main.tsx · App.tsx · index.css
├── core/
│   ├── constants/   colores.ts · estatus.ts (etiquetas y colores) · strings.ts
│   ├── theme/       theme.css (tokens Tailwind: guinda, dorado, crema, texto, borde…)
│   ├── utils/       formatters.ts (fechas, tamaños) · validators.ts · puntoEnPoligono.ts
│   ├── errors/      AppFailure.ts (error con mensaje para el usuario + conFallo)
│   ├── network/     axiosClient.ts · queryClient.ts · descargas.ts
│   └── leafletIcon.ts
├── features/
│   ├── auth/         data/{datasources,repositories} · domain/{entities,repositories,usecases} · presentation/{pages,components,store} · di.ts
│   ├── perfil/       domain/usecases · presentation/pages · di.ts
│   ├── solicitudes/  data · domain · presentation/{pages,components,components/mapa,hooks} · di.ts
│   ├── turnados/     data · domain · presentation/components (TurnarForm, HistorialTimeline) · di.ts
│   ├── catalogos/    data · domain · presentation/{pages,hooks} · di.ts
│   ├── reportes/     data · domain · presentation/{pages,components} · di.ts
│   ├── notificaciones/ data · domain · presentation/components · di.ts
│   └── dashboard/    presentation/pages
├── shared/
│   ├── components/   AppLayout.tsx · ui/ (Button, Input, Select, Textarea, Card, StatCard, PageHeader, Alert, Paginacion)
│   └── types/        ApiResponse.ts
└── routes/           AppRouter.tsx
```

### Cómo fluye una operación

```
Página / componente  →  caso de uso (domain/usecases)  →  repositorio (interfaz en domain)
                                                              ↓ implementación (data/repositories)
                                                        datasource remoto (data/datasources) → axiosClient → API
```

| Capa | Qué contiene |
|---|---|
| **domain** | Entidades (tipos), contratos de repositorios y casos de uso con las reglas: validaciones, qué estatus se permiten, cómo se arma el objeto `geo`, etc. **No importa axios ni React.** |
| **data** | Hace las llamadas HTTP (datasources) y traduce DTOs y errores a entidades y `AppFailure` (repositorios). |
| **presentation** | Páginas, componentes, hooks de React Query y el store. Solo llama casos de uso. |
| **`di.ts`** (cada feature) | Conecta las tres capas: crea el datasource, el repositorio y los casos de uso que usa la presentación. |
| **`core`** | No depende de ninguna feature. La sesión se registra en el cliente HTTP con `configurarSesion()` desde `features/auth/di.ts`. |

### Archivos que se eliminaron o movieron

| Antes | Ahora |
|---|---|
| `features/areas/AreasPage.tsx` | `features/catalogos/presentation/pages/CatalogosPage.tsx` (pestaña "Dependencias"); `/areas` redirige a `/catalogos` |
| `features/auth/presentation/pages/CuentaPage.tsx` | `features/perfil/presentation/pages/PerfilPage.tsx` (la ruta sigue siendo `/cuenta`) |
| `solicitudes/presentation/components/EstatusBadge.tsx` | `EstatusChip.tsx` |
| `solicitudes/presentation/geo/` (`UbicacionMapa`, `nominatim.ts`, `zonas.ts`) | `components/mapa/UbicacionMapa.tsx`; la geocodificación pasa por el backend (`GeoRemoteDataSource`); el point-in-polygon quedó en `core/utils/puntoEnPoligono.ts` |
| `shared/components/Navbar.tsx` (barra azul antigua) | Eliminada; todas las páginas usan `AppLayout` |

## 3. Funciones nuevas en pantalla

| Pantalla | Qué hay de nuevo |
|---|---|
| **Encabezado (todas)** | Campana de **notificaciones** con contador de no leídas (se actualiza cada minuto), lista desplegable, "Marcar todas"; el Administrador abre el expediente al hacer clic. |
| **Menú del Administrador** | Mapa general, Solicitudes, Nueva solicitud, **Catálogos**, **Bitácora** y Mi cuenta, con iconos. |
| **Nueva solicitud** | Tipos de solicitud, de petición y prioridades salen del **catálogo del backend**. **Adjuntar archivos** (hasta 5: PDF, imagen, Word o Excel, 10 MB c/u), que se suben como evidencias al guardar. El mapa busca direcciones **a través del backend**. Las validaciones (CP de 5 dígitos, enlaces `https`, tipos de archivo) se revisan antes de enviar. |
| **Bandeja de solicitudes** | **Paginación** (20 por página). Búsqueda que espera a que se termine de escribir. Filtro por año dinámico. Columna de fecha. **Exportar Excel y PDF con los filtros aplicados.** En celular se ve como **tarjetas** (`SolicitudCard`). |
| **Expediente** | Diseño institucional (antes usaba la barra azul antigua). Datos completos y domicilio con enlace al mapa. Botones de estatus. **Panel de evidencias**: subir archivo, agregar enlace, descargar y eliminar. **Turnar** (`TurnarForm`) e **historial** (`HistorialTimeline`) como componentes de la feature `turnados`. |
| **Dashboard** | Tarjeta nueva "No procede". Botones Excel y PDF. Cada marcador del mapa tiene un enlace "Ver expediente". |
| **Catálogos** (nuevo) | Pestañas Dependencias, Tipos de solicitud, Tipos de petición y Prioridades: agregar, renombrar y activar/desactivar. |
| **Bitácora** (nuevo) | Tabla paginada de la auditoría con filtro por acción. Los intentos de acceso fallidos se resaltan. |
| **Mi cuenta** | Mismas funciones, con los componentes compartidos y la validación en el caso de uso. |

## 4. Errores encontrados y cómo se resolvieron

### Error 1 · Las fechas se mostraban un día antes
- **Síntoma:** una solicitud capturada el 21/11/2026 aparecía como "Recibida el 20/11/2026", tanto en pantalla como en el PDF y el Excel.
- **Causa:** el formulario manda `2026-11-21`; Mongo lo guarda como `2026-11-21T00:00:00Z` (medianoche UTC) y, al mostrarlo en hora de México (UTC−6), se convertía en el 20 a las 18:00.
- **Solución:**
  - `core/utils/formatters.ts → formatearFecha` detecta las fechas de calendario (medianoche UTC) y las formatea en UTC.
  - Las fechas con hora (bitácora, evidencias, notificaciones) se siguen mostrando en hora de México.
  - En el backend, `reportes.service.ts` también formatea en UTC las columnas de fecha del PDF y el Excel.
- **Verificación:** el expediente de prueba muestra "Recibida el 21/11/2026".

### Error 2 · Al cerrar sesión, la siguiente cuenta podía ver datos de la anterior
- **Causa:** `logout` solo borraba los tokens. La caché de React Query (solicitudes, notificaciones, catálogos) seguía en memoria, así que si otra área entraba en el mismo equipo sin recargar, podía ver por un momento datos de la sesión anterior.
- **Solución:** `LogoutUseCase` borra los tokens **y** vacía la caché (`queryClient.clear()`). También se usa cuando la sesión expira.

### Error 3 · Varias peticiones con token vencido renovaban la sesión varias veces
- **Causa:** el interceptor de axios renovaba el token por cada respuesta 401. Con varias peticiones simultáneas (dashboard, mapa, campana) se lanzaban varias renovaciones en paralelo y la última podía invalidar a las demás. Además, un login con contraseña incorrecta (401) también intentaba renovar.
- **Solución:**
  - Una sola renovación compartida (`renovacionEnCurso`) para todas las peticiones que fallen al mismo tiempo.
  - `/auth/login` y `/auth/refresh` quedan excluidas de la renovación.
- **Verificación:** con un token vencido a propósito, la bandeja cargó normalmente y el token se renovó solo.

### Error 4 · `core` dependía de una feature
- **Causa:** `axiosClient.ts` importaba `useAuthStore` de `features/auth`, al revés de lo que pide la arquitectura.
- **Solución:** `axiosClient` expone `configurarSesion()` y la feature de auth lo configura en su `di.ts`.

### Error 5 · El navegador llamaba directo a Nominatim
- **Causa:** la geocodificación se hacía desde el navegador de cada usuario, sin caché compartida y sin control del límite de 1 petición por segundo entre todos los usuarios.
- **Solución:** `GeoRemoteDataSource` usa `/api/v1/geo/*` del backend, que tiene caché y cola. Las zonas se piden a `/geo/zonas`; si el backend no tiene el archivo, se usa la copia de `public/geo/`.

### Error 6 · Pantallas con estilos inconsistentes
- **Causa:** la pantalla de detalle usaba la barra azul antigua (`Navbar`) y cada página repetía clases de inputs, botones y alertas.
- **Solución:** componentes compartidos en `shared/components/ui` y colores como tokens (`bg-guinda`, `text-texto-suave`, `border-borde`…) en `core/theme/theme.css`.

## 5. Pruebas realizadas

- `tsc -b` sin errores y `vite build` correcto. El único aviso es el tamaño del bundle de 548 kB, que se puede dividir más adelante con carga diferida.
- Pruebas en el navegador contra el backend en Docker:

| Flujo | Resultado |
|---|---|
| Login de área con contraseña incorrecta | "Credenciales inválidas"; no intenta renovar el token |
| Login de área correcto | Entra directo a `/solicitudes/nueva` |
| Enviar el formulario vacío | "Escribe el nombre del solicitante." |
| Escribir calle, colonia y CP | El pin se ubica solo a través del backend ("Ubicación aproximada encontrada") |
| Adjuntar `.exe` + `.pdf` | El `.exe` se marca en rojo y bloquea el envío; al quitarlo, se guarda con folio PR-2026-0001 y el PDF queda como evidencia |
| Cerrar sesión → Acceso Administrador | Llega al dashboard con las cifras correctas y la campana con 2 avisos |
| Clic en la notificación | Abre el expediente y el contador baja a 1 |
| Expediente | Descarga del PDF con su nombre original; enlace `http://` rechazado; enlace `https://` agregado; estatus EN PROCESO; turnar sin área (error) y a DIF (correcto, con historial) |
| Bandeja | Filtro "Atendido" (sin resultados); "Turnada" + búsqueda "palma" (1 resultado); PDF exportado con esos filtros (`?search=palma&estatus=TURNADA`) |
| Catálogos | Agregar valor, rechazo de duplicado ("Ese valor ya existe"), desactivar |
| Bitácora | Muestra todas las acciones anteriores, incluido el intento fallido |
| Mi cuenta | Confirmación distinta → "La confirmación no coincide" |
| Token vencido a propósito | Se renueva solo y la página carga |
| Celular (375 px) | Bandeja en tarjetas, sin desplazamiento horizontal |

Los datos de prueba (solicitud, turnado, evidencias, notificaciones, valor de catálogo y sus registros en la bitácora) se borraron al terminar.

## 6. Pendientes

- **Ruta de "Mi cuenta":** la ruta `/cuenta` se conservó para no romper enlaces; si se prefiere `/perfil`, basta con cambiarla en `AppRouter.tsx` y `AppLayout.tsx`.
- **Periodo del sistema:** sigue pendiente confirmar el periodo correcto, "2026–2029" (logotipo) o "2027–2029" (barra superior). Está en un solo lugar: `core/constants/strings.ts → TEXTOS.periodoSistema`.
- **Archivo de zonas:** el GeoJSON de las 110 zonas sigue faltando (`backend/data/` y/o `frontend/public/geo/`). Mientras tanto la consola muestra un 404 esperado de `/geo/zonas`.
- **Tamaño del bundle:** dividir el código por ruta (`React.lazy`) para bajar de 500 kB.
