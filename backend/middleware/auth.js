const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'ecotrack-secret');
    const user = await Usuario.findById(payload.id).select('-passwordHash');
    if (!user) {
      return res.status(401).json({ message: 'Usuario inválido' });
    }
    req.user = { id: user._id, nombre: user.nombre, email: user.email };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};
