const express = require('express');
const {
  createActivity,
  getActivities,
  getActivityById,
  updateActivity,
  deleteActivity,
  getNearbyActivities,
  suggestRoutes,
} = require('../contollers/actividadController');
const auth = require('../middleware/auth');

const router = express.Router();
router.use(auth);
router.get('/', getActivities);
router.post('/', createActivity);
router.post('/sugerir', suggestRoutes);
router.get('/cercanas', getNearbyActivities);
router.get('/:id', getActivityById);
router.put('/:id', updateActivity);
router.delete('/:id', deleteActivity);

module.exports = router;
