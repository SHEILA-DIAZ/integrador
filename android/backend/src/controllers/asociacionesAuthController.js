const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
  UsuarioAsociacion,
  CompaniaAsociacion
} = require('../models');

const loginAsociacion = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    const usuario = await UsuarioAsociacion.findOne({
      where: { email }
    });

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    if (usuario.estado !== 'activo') {
      return res.status(403).json({
        error: 'Usuario inactivo'
      });
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    if (!passwordValida) {
      return res.status(401).json({
        error: 'Contraseña incorrecta'
      });
    }

    const vinculacion = await CompaniaAsociacion.findOne({
      where: {
        asociacion_id: usuario.asociacion_id,
        estado: 'vinculada'
      }
    });

    if (!vinculacion) {
      return res.status(403).json({
        error: 'La asociación no está vinculada a ninguna compañía'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        asociacion_id: usuario.asociacion_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '8h'
      }
    );

    return res.status(200).json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {

    console.error(
      '❌ Error login asociación:',
      error
    );

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  loginAsociacion
};