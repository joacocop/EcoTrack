const express = require('express');
const auth = require('../middleware/auth');
const {
  createMeta,
  getMetaProgress,
  rankingGlobal,
  reportSemanal,
  prepareEmailData,
} = require('../contollers/estadisticasController');

const router = express.Router();
router.use(auth);
router.post('/metas', createMeta);
router.get('/metas', getMetaProgress);
router.get('/email', prepareEmailData);
router.get('/ranking', rankingGlobal);
router.get('/reportes/semanal', reportSemanal);

module.exports = router;
