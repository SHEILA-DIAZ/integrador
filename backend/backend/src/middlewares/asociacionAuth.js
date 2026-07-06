const jwt = require('jsonwebtoken');

const verificarAdminAsociacion = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        error: 'No se proporcionó token de acceso'
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.rol !== 'admin_asociacion') {
      return res.status(403).json({
        error: 'Acceso denegado. Se requiere rol admin_asociacion'
      });
    }

    req.usuarioAsociacion = decoded;

    next();

  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

module.exports = {
  verificarAdminAsociacion
};
