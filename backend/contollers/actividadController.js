const Actividad = require('../models/actividad');

const buildLocation = (body) => {
  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return null;
  }
  return { type: 'Point', coordinates: [lng, lat] };
};

exports.createActivity = async (req, res) => {
  try {
    const { tipo, detalles } = req.body;
    const ubicacion = buildLocation(req.body);

    if (!tipo || !detalles || !ubicacion) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    const actividad = new Actividad({
      userId: req.user.id,
      tipo,
      detalles,
      ubicacion,
    });

    await actividad.save();
    res.status(201).json(actividad);
  } catch (error) {
    res.status(500).json({ message: 'Error creando actividad', error: error.message });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const actividades = await Actividad.find({ userId: req.user.id }).sort({ fecha: -1 });
    res.json(actividades);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo actividades', error: error.message });
  }
};

exports.getActivityById = async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.id);
    if (!actividad || actividad.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }
    res.json(actividad);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo actividad', error: error.message });
  }
};

exports.updateActivity = async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.id);
    if (!actividad || actividad.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    if (req.body.tipo) actividad.tipo = req.body.tipo;
    if (req.body.detalles) actividad.detalles = req.body.detalles;
    const ubicacion = buildLocation(req.body);
    if (ubicacion) actividad.ubicacion = ubicacion;

    await actividad.save();
    res.json(actividad);
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando actividad', error: error.message });
  }
};

exports.deleteActivity = async (req, res) => {
  try {
    const actividad = await Actividad.findById(req.params.id);
    if (!actividad || actividad.userId.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Actividad no encontrada' });
    }

    await actividad.remove();
    res.json({ message: 'Actividad eliminada' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando actividad', error: error.message });
  }
};

const toRadians = (degrees) => (degrees * Math.PI) / 180;

const haversineDistanceKm = (from, to) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const lat1 = toRadians(from.lat);
  const lat2 = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const estimateCO2 = (vehiculo, distanciaKm, combustible = 'nafta') => {
  let factor = 0;
  switch (vehiculo) {
    case 'auto':
      factor = combustible === 'electrico' ? 0.02 : 0.12;
      break;
    case 'moto':
      factor = 0.06;
      break;
    case 'bus':
      factor = 0.03;
      break;
    case 'bici':
    case 'peaton':
      factor = 0;
      break;
    default:
      factor = 0.12;
  }
  return Number((distanciaKm * factor).toFixed(2));
};

const buildSuggestion = ({ nombre, transporte, combustible, distanciaKm, descripcion }) => ({
  nombre,
  transporte,
  combustible,
  distanciaKm: Number(distanciaKm.toFixed(2)),
  huellaCO2: estimateCO2(transporte, distanciaKm, combustible),
  descripcion,
});

exports.getNearbyActivities = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radiusKm = Number(req.query.radius) || 1;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ message: 'Latitud y longitud requeridas' });
    }

    const actividades = await Actividad.find({
      ubicacion: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radiusKm * 1000,
        },
      },
    }).limit(50);

    res.json(actividades);
  } catch (error) {
    res.status(500).json({ message: 'Error en consulta geoespacial', error: error.message });
  }
};

exports.suggestRoutes = async (req, res) => {
  try {
    const { from, to, vehiculo = 'auto', combustible = 'nafta' } = req.body;

    if (!from || !to || typeof from.lat !== 'number' || typeof from.lng !== 'number' || typeof to.lat !== 'number' || typeof to.lng !== 'number') {
      return res.status(400).json({ message: 'Datos de origen y destino inválidos' });
    }

    const distanciaBase = haversineDistanceKm(from, to);
    if (distanciaBase <= 0) {
      return res.status(400).json({ message: 'Origen y destino deben ser distintos' });
    }

    const suggestions = [
      buildSuggestion({
        nombre: 'Ruta directa en auto',
        transporte: 'auto',
        combustible,
        distanciaKm: distanciaBase,
        descripcion: 'Ruta más corta con un balance entre tiempo y emisiones.',
      }),
      buildSuggestion({
        nombre: 'Ruta en bus',
        transporte: 'bus',
        combustible: 'diesel',
        distanciaKm: distanciaBase * 1.15,
        descripcion: 'Opción de transporte público con menor huella de carbono.',
      }),
      buildSuggestion({
        nombre: 'Ruta en bicicleta',
        transporte: 'bici',
        combustible: 'none',
        distanciaKm: distanciaBase * 1.25,
        descripcion: 'Camino más sustentable para distancias moderadas.',
      }),
    ];

    if (distanciaBase <= 5) {
      suggestions.push(
        buildSuggestion({
          nombre: 'Ruta caminando',
          transporte: 'peaton',
          combustible: 'none',
          distanciaKm: distanciaBase * 1.3,
          descripcion: 'La alternativa más ecológica para distancias cortas.',
        })
      );
    }

    suggestions.sort((a, b) => a.huellaCO2 - b.huellaCO2);

    res.json({
      origen: from,
      destino: to,
      distanciaBaseKm: Number(distanciaBase.toFixed(2)),
      sugerencias: suggestions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sugiriendo rutas', error: error.message });
  }
};
