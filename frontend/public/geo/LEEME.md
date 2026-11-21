# Zonas de Poza Rica (GeoJSON)

Coloca aquí el archivo **`zonas-poza-rica.geojson`** con las 110 zonas del municipio.

- Formato: `FeatureCollection` de `Polygon` o `MultiPolygon`, coordenadas WGS84 (`[longitud, latitud]`).
- El nombre de cada zona se lee de la primera propiedad que exista entre:
  `zona`, `ZONA`, `Zona`, `nombre`, `NOMBRE`, `Nombre`, `name`, `NAME`, `Name`.

Mientras el archivo no exista, el formulario funciona igual: guarda la coordenada del pin
y deja la zona vacía.
