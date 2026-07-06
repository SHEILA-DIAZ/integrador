const jwt = require('jsonwebtoken');
require('dotenv').config();

const obtenerToken = (req) => {
  const authHeader = req.headers.authorization || req.headers['authorization'] || '';

  if (!authHeader) {
    return null;
  }

  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return authHeader;
};

const verificarToken = (req, res, next) => {
  const token = obtenerToken(req);

  if (!token) {
    return res.status(401).json({
      error: 'No se proporcionó token de acceso'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

const verificarSuperAdmin = (req, res, next) => {
  if (!req.usuario || req.usuario.rol !== 'super_admin') {
    return res.status(403).json({
      error: 'Acceso denegado. Se requiere rol super_admin'
    });
  }

  next();
};

module.exports = {
  verificarToken,
  verificarSuperAdmin
};