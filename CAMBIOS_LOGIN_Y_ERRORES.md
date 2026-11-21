# Rediseño del login y corrección de errores

Fecha: 21/11/2026 · Referencia visual: `calendarioplaneacion.duckdns.org/login`

## 1. Rediseño de la pantalla de acceso

Archivo principal: `frontend/src/features/auth/presentation/pages/LoginPage.tsx`

| Elemento de la referencia | Cómo quedó implementado |
|---|---|
| Panel izquierdo guinda con flores | Degradado guinda (`#7d1d3d → #731936 → #5e1229`) con la flor institucional (`Imagen1`) en tono oscuro como textura. |
| Escudo + logotipo "Gobierno de Poza Rica" | El escudo se recorta de `Imagen4` (versión a color) y se coloca junto a `Imagen3` (versión en blanco), igual que en la referencia. |
| "Presidencia Municipal" + subtítulo | Tipografía Montserrat ExtraBold; el tamaño se ajusta al ancho para que no se parta en dos líneas en escritorio. |
| Fondo crema con ilustración | Fondo crema (`#f3e9df`) con flores rosadas tenues y el texto "POZA RICA, VERACRUZ" de marca de agua. La ilustración de la ciudad de la referencia no venía entre las imágenes, por eso se sustituyó por este fondo. |
| Tarjeta con borde superior de color | Tarjeta blanca redondeada con franja guinda → dorado. |
| Etiqueta "SISTEMA DE …" | Píldora crema/dorada con el texto "SISTEMA DE SOLICITUDES". |
| "1 · SELECCIONA TU DIRECCIÓN" + buscador | Paso numerado, buscador con lupa (ignora acentos y busca también por siglas). |
| Lista de direcciones con icono y flecha | Lista desplazable con barra guinda; cada dirección tiene su icono SVG (lucide-react) en un recuadro rosado que se vuelve guinda al pasar el cursor, y una flecha `>`. |
| "Acceso Administrador" al pie | Botón al pie de la tarjeta con icono; cambia al formulario de correo + contraseña. |

Agregado además de la referencia:

- **Paso 2 · Ingresa tu contraseña**: al elegir una dirección se muestra la dirección elegida (con botón "Cambiar") y el campo de contraseña, que recibe el foco automáticamente.
- Botón para **mostrar/ocultar la contraseña**.
- Lema **"La esperanza hecha gobierno"** (`Imagen5`) en el panel izquierdo.
- Estados de **carga** (tarjetas animadas), **error de red** (con botón "Reintentar") y **sin coincidencias**.
- Vista **responsiva**: en celular el panel guinda queda arriba y la tarjeta abajo, sin desplazamiento horizontal.

### Imágenes

Se copiaron de `img/` a `frontend/public/img/` con nombres descriptivos (los originales no se tocaron):

| Original | Nuevo nombre | Uso |
|---|---|---|
| `Imagen1.png` | `flor-institucional.png` | Textura de fondo y favicon |
| `Imagen2.png` | `banner-pie.png` | Sin usar en el login (sirve como pie de página institucional) |
| `Imagen3.png` | `logo-poza-rica-blanco.png` | Logotipo sobre el panel guinda |
| `Imagen4.png` | `logo-poza-rica-color.png` | Se recorta el escudo |
| `Imagen5.png` | `lema-esperanza.png` | Lema del panel izquierdo |

### Estilos globales

- `frontend/index.html`: fuentes Montserrat y Nunito Sans (Google Fonts), favicon y título.
- `frontend/src/index.css`: colores institucionales como clases de Tailwind (`guinda`, `guinda-oscuro`, `dorado`, `crema`), fuente `font-display` y barra de desplazamiento guinda. Nunito Sans queda como fuente base de todo el sistema.

## 2. Errores encontrados y cómo se resolvieron

### Error 1 · Los cambios del backend no se aplicaban en Docker

- **Síntoma:** después de agregar el módulo de reportes, `GET /api/v1/reportes/dashboard` seguía respondiendo **404**, y el cambio en el orden de las direcciones no aparecía.
- **Causa:** el backend corre con `tsx watch` dentro del contenedor y el código llega por un volumen montado desde Windows. Docker Desktop **no propaga los eventos de cambio de archivo** de Windows al contenedor, así que `tsx` nunca se enteraba de las ediciones. El frontend no tenía el problema porque `vite.config.mts` ya usa `usePolling: true`.
- **Solución:** en `docker-compose.yml` se agregaron al servicio `backend` las variables `CHOKIDAR_USEPOLLING=true` y `CHOKIDAR_INTERVAL=1000`, y se recreó el contenedor (`docker compose up -d backend`).
- **Verificación:** al modificar `auth.service.ts` el log muestra `[tsx] change in ./src/modules/auth/auth.service.ts Restarting...`, y `/reportes/dashboard` ahora responde **401** sin token (la ruta existe y exige sesión de Administrador).

### Error 2 · Las direcciones salían en orden alfabético

- **Síntoma:** la lista empezaba con "Contraloría Municipal", "Cultura y Turismo", "DIF Municipal"…, mientras que la referencia empieza con Presidencia, Contraloría, Tesorería, Secretaría, Protección Civil, Cultura y Turismo.
- **Causa:** `listAreasLogin` (`backend/src/modules/auth/auth.service.ts`) ordenaba por `nombre`.
- **Solución:** ahora se ordena según el catálogo oficial `DEPENDENCIAS` (`backend/src/config/catalogoAreas.ts`). Las áreas que se agreguen después y no estén en el catálogo quedan al final, en orden alfabético.

### Error 3 · "Presidencia Municipal" se partía en dos líneas

- **Síntoma:** a 1600 px de ancho el título del panel izquierdo ocupaba dos renglones.
- **Solución:** tamaño de letra fluido (`clamp(22px, 1.9vw, 31px)`) sin salto de línea en escritorio, y menos margen interno en el panel. En celular sí puede ocupar dos líneas, porque ahí hay espacio vertical de sobra.

### Error 4 · La tarjeta se salía de pantallas bajas

- **Síntoma:** con ventanas de poca altura el pie "Acceso Administrador" quedaba fuera de la vista.
- **Solución:** la lista de direcciones ajusta su altura máxima a la de la ventana (`calc(100vh - 390px)`, entre 220 y 352 px) y se desplaza por dentro.

### Error 5 · Título de pestaña genérico

- **Síntoma:** todas las páginas mostraban el mismo título en la pestaña del navegador.
- **Solución:** `index.html` usa "Sistema de Solicitudes — Presidencia Municipal de Poza Rica" y el login cambia el título a "Acceso — Presidencia Municipal de Poza Rica" mientras está abierto.

## 3. Pruebas realizadas

- `tsc` sin errores en frontend y backend.
- En el navegador (http://localhost:5173/login):
  - Escritorio 1600 × 740: diseño comparado con la referencia.
  - Selección de "Tesorería Municipal" → paso 2 → contraseña inicial → redirige a `/solicitudes/nueva`.
  - Acceso Administrador con contraseña incorrecta → mensaje "Credenciales inválidas".
  - Celular 375 × 812: sin desplazamiento horizontal.

## 4. Pendientes

- La ilustración de la ciudad del fondo de la referencia no estaba entre las imágenes; si se consigue, se puede poner como fondo de la zona crema.
- Los iconos de cada dirección son SVG de `lucide-react` (ya no emojis, que se veían distinto en cada sistema operativo). Si el Ayuntamiento tiene iconos propios, se cambian en el objeto `ICONOS` de `LoginPage.tsx`. Asignación actual: Presidencia `Landmark`, Contraloría `SearchCheck`, Tesorería `Coins`, Secretaría `ScrollText`, Protección Civil `Siren`, Cultura y Turismo `Drama`, Educación `GraduationCap`, Mujeres `HeartHandshake`, Seguridad Pública `ShieldCheck`, Ecología `Trees`, Juventud `Sparkles`, Servicios Públicos `Wrench`, Obra Pública `HardHat`, Deporte `Trophy`, SIPINNA `Baby`, Enlace Petrolero `Fuel`, Participación Social `Handshake`, Derechos Humanos `Scale`, Secretario Particular `ClipboardList`, DIF `Users`, Desarrollo Económico `TrendingUp`; cualquier área nueva usa `Building2`.
- La barra superior del sistema dice "SISTEMA 2027–2029", mientras que el logotipo dice "2026-2029"; conviene confirmar cuál es el correcto.
- Sigue faltando `frontend/public/geo/zonas-poza-rica.geojson` (110 zonas).
