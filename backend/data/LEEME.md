# Datos geográficos del backend

Coloca aquí **`zonas-poza-rica.geojson`** (las 110 zonas del municipio) para que el servidor:

- calcule la zona de cada solicitud al guardarla (no depende de lo que mande el navegador),
- responda `GET /api/v1/geo/zonas`, `POST /api/v1/geo/validar` y la zona en `/geo/reverse` y `/geo/buscar`.

Formato: `FeatureCollection` de `Polygon`/`MultiPolygon` en WGS84 (`[longitud, latitud]`).
El nombre de la zona se toma de la primera propiedad que exista entre
`zona`, `ZONA`, `Zona`, `nombre`, `NOMBRE`, `Nombre`, `name`, `NAME`, `Name`.

La ruta se puede cambiar con la variable de entorno `ZONAS_GEOJSON_PATH`.
Si el archivo cambia, el servidor lo vuelve a leer sin reiniciar.
