const express = require('express');
const { registerUser, loginUser, getProfile } = require('../contollers/usuarioController');
const auth = require('../middleware/auth');

const router = express.Router();
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', auth, getProfile);

module.exports = router;
