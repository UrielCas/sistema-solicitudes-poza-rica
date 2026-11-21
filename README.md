# Sistema de Solicitudes - H. Ayuntamiento de Poza Rica

## Requisitos
- Tener Docker Desktop instalado y abierto.

## Cómo ejecutar
1. Abrir una terminal en la carpeta raíz.
2. Ejecutar: `docker compose up --build`
3. Abrir http://localhost:5173

Al arrancar, el backend sincroniza las 21 áreas oficiales y crea (solo si no existen) una
cuenta por área y la cuenta de Administrador. Nunca sobrescribe contraseñas ya cambiadas.

## Credenciales iniciales

| Cuenta | Cómo entra | Contraseña inicial |
|---|---|---|
| Administrador | Botón **"Acceso Administrador"** → `admin@pozarica.gob.mx` | `Password123` (`ADMIN_PASSWORD`) |
| Cada una de las 21 áreas | Elige su **Dirección / Área** en la lista | `PozaRica2026` (`INITIAL_AREA_PASSWORD`) |

Usuarios de las áreas (se definen en `backend/src/config/catalogoAreas.ts`):
`presidencia@`, `contraloria@`, `tesoreria@`, `secretaria@`, `proteccioncivil@`, `culturayturismo@`,
`educacion@`, `mujeres@`, `seguridadpublica@`, `ecologia@`, `juventud@`, `serviciospublicos@`,
`obrapublica@`, `deporte@`, `sipinna@`, `enlacepetrolero@`, `participacionsocial@`,
`derechoshumanos@`, `secretarioparticular@`, `dif@`, `desarrolloeconomico@` — todos `@pozarica.gob.mx`.

Mientras una cuenta use la contraseña inicial verá un aviso para cambiarla en
**"Cambiar usuario / contraseña"** (`/cuenta`). Cambien estas contraseñas antes de usar el sistema en producción.

## Roles
- **Área municipal**: al entrar va directo a `/solicitudes/nueva`. No ve menú lateral, mapa
  consolidado ni solicitudes de otras áreas. Lo que captura queda ligado a su área y entra como `PENDIENTE`.
  El backend aplica estas reglas aunque se llame a la API directamente.
- **Administrador**: panel completo, mapa consolidado y bandeja de seguimiento con estatus
  `PENDIENTE`, `EN PROCESO`, `ATENDIDO` y `NO PROCEDE`.

## Georreferenciación (sección 3 del formulario)
- Mapa Leaflet + OpenStreetMap centrado en Poza Rica. Sin costo ni API key.
- **Mapa → formulario**: clic en el mapa o arrastrar el pin consulta Nominatim (`/reverse`) y llena
  calle, número (si lo hay), colonia y código postal. Lo que Nominatim no encuentre se conserva como el usuario lo escribió.
- **Formulario → mapa**: botón *"Ubicar dirección en mapa"* (o automáticamente al terminar de escribir
  calle + colonia + CP) consulta Nominatim (`/search`) y mueve el pin; el usuario puede arrastrarlo para ajustarlo.
- La coordenada se guarda en `geo` (`latitud`, `longitud`, `zona`, `validacionManual: true`). El pin es opcional y nunca bloquea el envío.
- **Zona**: se detecta por point-in-polygon con `frontend/public/geo/zonas-poza-rica.geojson`
  (ver `frontend/public/geo/LEEME.md`). **Falta agregar ese archivo con las 110 zonas.**
- Nominatim público permite máx. 1 petición/segundo y prohíbe el autocompletado tecla por tecla; el cliente
  ya respeta ambas reglas. Si se necesita más volumen, se puede apuntar a otro servidor con `VITE_NOMINATIM_URL`.

## Escudo
Coloca el escudo oficial en `frontend/public/escudo-poza-rica.png`. Mientras no exista, el login muestra un escudo genérico.
