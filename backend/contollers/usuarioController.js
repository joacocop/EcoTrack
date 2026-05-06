const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'ecotrack-secret', {
    expiresIn: '7d',
  });
};

exports.registerUser = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, passwordHash });

    res.status(201).json({
      token: generarToken(usuario._id),
      user: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creando usuario', error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Faltan datos requeridos' });
    }

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    const validPassword = await bcrypt.compare(password, usuario.passwordHash);
    if (!validPassword) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }

    res.json({
      token: generarToken(usuario._id),
      user: { id: usuario._id, nombre: usuario.nombre, email: usuario.email },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el login', error: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Error obteniendo perfil' });
  }
};
