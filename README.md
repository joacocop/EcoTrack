# EcoTrack

Proyecto de monitoreo de huella de carbono con MongoDB Atlas, Mongoose y consultas geoespaciales.

## Estructura

- `backend/` - servidor Node.js + Express
- `frontend/` - página web estática
- `js/` - scripts de frontend
- `css/` - estilos de frontend

## Uso

1. Copia `.env.example` a `.env`.
2. Configura `MONGODB_URI` con tu conexión a MongoDB Atlas.
3. Ejecuta:

```bash
npm install
npm run dev
```

4. Abre http://localhost:5000

## Endpoints principales

- `POST /api/usuarios/register`
- `POST /api/usuarios/login`
- `GET /api/actividades`
- `POST /api/actividades`
- `GET /api/actividades/cercanas?lat={lat}&lng={lng}&radius={km}`
- `POST /api/estadisticas/metas`
- `GET /api/estadisticas/metas`
- `GET /api/estadisticas/ranking`
- `GET /api/estadisticas/reportes/semanal`
