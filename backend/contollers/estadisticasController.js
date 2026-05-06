const Actividad = require('../models/actividad');
const Meta = require('../models/meta');
const mongoose = require('mongoose');

const getWeekKey = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay() || 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + 1);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
};

exports.createMeta = async (req, res) => {
  try {
    const { objetivoCO2, semana } = req.body;
    if (objetivoCO2 == null) {
      return res.status(400).json({ message: 'Objetivo CO2 requerido' });
    }

    const week = semana || getWeekKey();

    const meta = await Meta.findOneAndUpdate(
      { userId: req.user.id, semana: week },
      { objetivoCO2 },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(meta);
  } catch (error) {
    res.status(500).json({ message: 'Error creando meta', error: error.message });
  }
};

exports.getMetaProgress = async (req, res) => {
  try {
    const semana = req.query.semana || getWeekKey();
    const meta = await Meta.findOne({ userId: req.user.id, semana });
    const { monday, sunday } = getCurrentWeekRange();

    const actividades = await Actividad.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user.id),
          fecha: { $gte: monday, $lte: sunday },
        },
      },
      {
        $group: {
          _id: null,
          totalCO2: { $sum: '$huellaCO2' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({ meta: meta || null, progreso: actividades[0] || { totalCO2: 0, count: 0 } });
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo progreso de meta', error: error.message });
  }
};

exports.rankingGlobal = async (req, res) => {
  try {
    const ranking = await Actividad.aggregate([
      { $group: { _id: '$userId', totalCO2: { $sum: '$huellaCO2' } } },
      { $sort: { totalCO2: 1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'usuarios',
          localField: '_id',
          foreignField: '_id',
          as: 'usuario',
        },
      },
      { $unwind: '$usuario' },
      { $project: { _id: 0, usuario: { nombre: '$usuario.nombre', email: '$usuario.email' }, totalCO2: 1 } },
    ]);

    res.json(ranking);
  } catch (error) {
    res.status(500).json({ message: 'Error en ranking global', error: error.message });
  }
};

exports.reportSemanal = async (req, res) => {
  try {
    const hoy = new Date();
    const hace7 = new Date(hoy);
    hace7.setDate(hace7.getDate() - 6);

    const reportes = await Actividad.aggregate([
      {
        $match: {
          userId: mongoose.Types.ObjectId(req.user.id),
          fecha: { $gte: hace7 },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$fecha' } },
          totalCO2: { $sum: '$huellaCO2' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    res.json(reportes);
  } catch (error) {
    res.status(500).json({ message: 'Error generando reporte semanal', error: error.message });
  }
};
