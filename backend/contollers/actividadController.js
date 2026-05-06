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
