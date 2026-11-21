# Backend: estructura completada

Fecha: 21/11/2026

Se llenaron los 15 archivos que estaban vacíos y se conectaron a `app.ts`.
Con esto, el backend tiene **toda** la estructura acordada y cada archivo tiene código funcionando.

## 1. Estado de la estructura

| Archivo / módulo | Antes | Ahora |
|---|---|---|
| `core/middleware/audit.ts` | vacío | Bitácora de acciones críticas (colección `auditorias`) |
| `core/middleware/rbac.ts` | solo por rol | Por rol **y por área** (`assertAccesoArea`) |
| `core/utils/serializers.ts` | vacío | Formato único de respuesta `{ success, data, meta? }` |
| `core/utils/pagination.ts` | vacío | `?page=&limit=` con valores seguros y `meta` |
| `core/errors/errorHandler.ts` | parcial | También maneja JSON mal formado, validaciones de Mongoose, IDs inválidos y duplicados |
| `modules/catalogos/*` | vacío | Tipos de solicitud, tipos de petición y prioridades |
| `modules/geolocalizacion/*` | vacío | Geocodificación con Nominatim desde el servidor, validación de coordenadas y zonas |
| `modules/evidencias/*` | vacío | Subida de archivos y enlaces de Drive por solicitud |
| `modules/notificaciones/*` | vacío | Notificaciones dentro del sistema |
| `modules/reportes/*` | solo Excel | Excel y **PDF** con filtros, y consulta de la bitácora |

## 2. Endpoints nuevos

Todos van bajo `/api/v1` y requieren sesión (`Authorization: Bearer <token>`).

### Catálogos (`/catalogos`)
| Método | Ruta | Quién | Qué hace |
|---|---|---|---|
| GET | `/catalogos?tipo=TIPO_SOLICITUD` | Todos | Valores activos (el Administrador ve también inactivos con `?todos=1`) |
| GET | `/catalogos/agrupados` | Todos | `{ TIPO_SOLICITUD: [...], TIPO_PETICION: [...], PRIORIDAD: [...] }` |
| POST | `/catalogos` | Admin | Agrega un valor `{ tipo, valor, etiqueta?, orden? }` |
| PATCH | `/catalogos/:id` | Admin | Cambia `etiqueta`, `orden` o `activo` (no se borra, se desactiva) |

- Al arrancar, el servidor carga los valores que hoy usa el formulario: 9 tipos de solicitud, 5 tipos de petición y 4 prioridades. Si el Administrador ya editó alguno, no se sobrescribe.
- Al crear una solicitud se valida que `tipoSolicitud` y `tipoPeticion` existan en el catálogo.

### Geolocalización (`/geo`)
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/geo/reverse?lat=&lng=` | Coordenada → calle, número, colonia, CP y zona |
| GET | `/geo/buscar?callePrincipal=&colonia=&codigoPostal=` | Dirección → coordenada candidata (`precision`: DIRECCION o COLONIA) |
| POST | `/geo/validar` `{ latitud, longitud }` | `{ dentroMunicipio, zona, zonasDisponibles }` |
| GET | `/geo/zonas` | GeoJSON de las 110 zonas (404 mientras no exista el archivo) |

- Respeta la política de uso de Nominatim: máximo 1 petición por segundo, caché de 24 h y un límite de 30 búsquedas por minuto por cuenta.
- **Validación al guardar una solicitud:** si el pin cae fuera de Poza Rica, el servidor responde 400 con el mensaje "Corrige el pin". Cuando exista `backend/data/zonas-poza-rica.geojson`, la zona la calcula el servidor y no se toma la que mande el navegador; mientras no exista, se conserva la del navegador.

### Evidencias (`/evidencias`)
| Método | Ruta | Quién | Qué hace |
|---|---|---|---|
| GET | `/evidencias/solicitud/:solicitudId` | Admin o área responsable | Lista archivos y enlaces |
| POST | `/evidencias/solicitud/:solicitudId` | Admin o área responsable | `multipart/form-data` (campo `archivo` y `descripcion`) **o** JSON `{ enlace, nombre?, descripcion? }` |
| GET | `/evidencias/solicitud/:solicitudId/:evidenciaId/descargar` | Admin o área responsable | Descarga el archivo |
| DELETE | `/evidencias/solicitud/:solicitudId/:evidenciaId` | Admin | Borra la evidencia y su archivo |

- Formatos permitidos: PDF, JPG, PNG, WEBP, Word y Excel. Se valida que la extensión coincida con el tipo de archivo. El tamaño máximo es de 10 MB (`EVIDENCIA_MAX_MB`).
- Los archivos se guardan en `backend/uploads/evidencias/<solicitud>/` con un nombre aleatorio; el nombre original solo se usa para la descarga. Esta carpeta está en `.gitignore`.
- Se revisa el acceso **antes** de recibir el archivo, para que nadie escriba en el disco una evidencia de una solicitud ajena.
- Los enlaces deben empezar con `https://`.
- Para usar S3 más adelante solo hay que cambiar el `storage` de `evidencias.service.ts`.

### Notificaciones (`/notificaciones`)
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/notificaciones?page=&limit=&noLeidas=1` | Mis notificaciones (personales, de mi área y de mi rol), con `leida` |
| GET | `/notificaciones/no-leidas` | `{ total }` para el contador de la campana |
| PATCH | `/notificaciones/:id/leida` | Marca una como leída |
| PATCH | `/notificaciones/leer-todas` | Marca todas |

Se generan solas en estos casos:

| Evento | Quién recibe la notificación |
|---|---|
| Un área captura una solicitud | Administradores |
| El Administrador cambia el estatus | Área responsable |
| La solicitud se turna | Área destino |
| Un área sube una evidencia | Administradores |

### Reportes (`/reportes`, solo Admin)
| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/reportes/dashboard` | Cifras del panel |
| GET | `/reportes/excel?anio=&estatus=&areaActual=&zona=&search=` | Excel filtrado |
| GET | `/reportes/pdf?…` (mismos filtros) | **Nuevo:** PDF carta horizontal con encabezado guinda, resumen por estatus, tabla y número de página |
| GET | `/reportes/auditoria?accion=&usuario=&recursoId=&page=&limit=` | **Nuevo:** bitácora |

### Cambios en endpoints que ya existían
- `GET /solicitudes?page=1&limit=20` ahora devuelve también `meta` (`total`, `page`, `limit`, `totalPages`). **Sin `page` ni `limit` responde igual que antes**, así que el frontend actual no se rompe.
- `POST /turnados` valida que el área destino exista y que haya instrucciones.
- Las rutas inexistentes bajo `/api` responden JSON `{ success: false, message: 'Ruta no encontrada' }` en lugar de HTML.

## 3. Bitácora de auditoría

Se registra quién hizo la acción, su rol, su área, la ruta, el recurso afectado, la IP y la fecha. Nunca se guardan contraseñas.

| Acción | Cuándo |
|---|---|
| `LOGIN_OK` / `LOGIN_FALLIDO` | Inicio de sesión (incluye intentos fallidos) |
| `CREDENCIALES_ACTUALIZADAS` | Cambio de usuario o contraseña (solo indica qué cambió) |
| `USUARIO_CREADO`, `AREA_CREADA` | Altas del Administrador |
| `SOLICITUD_CREADA`, `ESTATUS_CAMBIADO`, `SOLICITUD_TURNADA` | Flujo de la solicitud |
| `EVIDENCIA_AGREGADA`, `EVIDENCIA_ELIMINADA` | Documentos |
| `CATALOGO_CREADO`, `CATALOGO_ACTUALIZADO` | Catálogos |
| `REPORTE_EXCEL`, `REPORTE_PDF` | Descargas de información |

## 4. Errores encontrados y cómo se resolvieron

### Error 1 · Un JSON mal formado tiraba un error 500
- **Síntoma:** si se enviaba `{malformado` a cualquier endpoint, la respuesta era "Error interno del servidor" (500) y el log mostraba un `SyntaxError`.
- **Causa:** `errorHandler` solo reconocía `AppError` y `ZodError`; el error de `express.json()` caía en el caso genérico.
- **Solución:** `errorHandler` ahora reconoce estos errores:

  | Error | Respuesta |
  |---|---|
  | JSON mal formado (`entity.parse.failed`) | 400 |
  | Cuerpo demasiado grande (`entity.too.large`) | 413 |
  | Validación de Mongoose | 400, con la lista de campos |
  | ID mal formado (`CastError`) | 400 |
  | Registro duplicado (`11000`) | 409 |

- **Verificación:** con `{malformado` responde 400 "El cuerpo de la petición no es JSON válido".

### Error 2 · El reporte PDF salía con una hoja en blanco de más
- **Síntoma:** el PDF tenía dos páginas; la segunda solo traía el pie de página.
- **Causa:** el pie se escribía debajo del margen inferior y pdfkit, al no caber, abría una hoja nueva.
- **Solución:** mientras se escribe el pie, el margen inferior baja a 0 y luego se restaura.
- **Verificación:** el PDF ahora tiene 1 página.

### Error 3 · La auditoría del turnado no quedaba ligada a la solicitud
- **Síntoma:** al consultar la bitácora por solicitud no aparecía `SOLICITUD_TURNADA`.
- **Causa:** el turnado recibe el ID de la solicitud en el cuerpo de la petición, no en la URL.
- **Solución:** el controlador indica el recurso con `res.locals.recursoId`.

### Error 4 · Vulnerabilidades en multer 1.x
- **Causa:** el proyecto tenía `multer@1.4.5-lts.1`, que tiene fallas conocidas de denegación de servicio con peticiones multipart mal formadas. Antes no se usaba, pero las evidencias ahora sí lo usan.
- **Solución:** se actualizó a `multer@^2.0.2` (instalada la 2.5.0). La API es la misma.

### Nota de Docker · Las dependencias nuevas no llegan solas al contenedor
- El `docker-compose.yml` monta `node_modules` del backend como volumen propio del contenedor, así que un `npm install` en Windows **no** las instala dentro del contenedor.
- Se instalaron con `docker exec solicitudes_backend npm install`.
- Si alguien más clona el proyecto, ejecuta `docker compose build backend` y después `docker compose up -d backend`.

## 5. Pruebas realizadas

Se probaron contra el backend en Docker con las cuentas de prueba del `docker-compose.yml`, en 39 casos. 38 pasaron. El caso restante falló por un error del propio script de prueba (esperaba `meta` en el listado sin paginar, y es correcto que no venga).

| Módulo | Casos probados |
|---|---|
| Catálogos | Lectura por un área; un área no puede crear (403); tipo inválido (400) |
| Geolocalización | Validar punto dentro y fuera; reverse y forward reales con Nominatim; coordenada fuera del municipio (400); zonas sin archivo (404) |
| Solicitudes | Pin fuera de Poza Rica (400); tipo fuera del catálogo (400); captura válida (201); un área no ve el listado (403); paginación |
| Notificaciones | El Administrador recibe la nueva solicitud; el área recibe el cambio de estatus; marcar como leída; el DIF recibe el turnado |
| Evidencias | Subir PDF; rechazar `.exe`; rechazar enlace sin `https`; agregar enlace de Drive; listar y descargar; un área no puede borrar (403); otra área no ve evidencias ajenas (403) |
| Turnados | Área destino inexistente (400); turnado válido (201) |
| Reportes | PDF válido; Excel filtrado; dashboard; bitácora por solicitud y de logins; un área no descarga reportes (403) |
| Generales | Ruta inexistente responde JSON 404; JSON mal formado responde 400 |

La solicitud de prueba y sus registros (turnado, notificaciones, bitácora y archivos) se borraron al terminar.

`tsc --noEmit` corre sin errores.

## 6. Pendientes

- **Correo, WebSocket y push:** las notificaciones funcionan dentro del sistema. Para correo se necesitan los datos de un servidor SMTP del Ayuntamiento; para tiempo real, agregar `socket.io`. Cualquiera de los dos se conecta en `notificaciones.service.ts → crear()`.
- **Archivo de zonas:** colocar `zonas-poza-rica.geojson` en `backend/data/`, y la misma copia en `frontend/public/geo/`, o hacer que el frontend lo pida a `GET /geo/zonas`.
- **Frontend:** todavía no usa los módulos nuevos (catálogos, evidencias, notificaciones, PDF, mapa por el backend). Eso corresponde a la reestructuración del frontend.
