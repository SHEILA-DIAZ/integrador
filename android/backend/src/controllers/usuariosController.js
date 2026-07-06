const bcrypt = require('bcryptjs');

const {
  Usuario
} = require('../models');

const actualizarPerfil = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;

    const {
      nombre,
      email,
      password
    } = req.body;

    const usuario = await Usuario.findByPk(usuarioId);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    const datosActualizar = {};

    if (nombre) {
      datosActualizar.nombre = nombre;
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          error: 'Correo inválido'
        });
      }

      datosActualizar.email = email;
    }

    if (password) {
      if (password.length < 6) {
        return res.status(400).json({
          error: 'La contraseña debe tener mínimo 6 caracteres'
        });
      }

      datosActualizar.password_hash = await bcrypt.hash(password, 10);
    }

    await usuario.update(datosActualizar);

    return res.status(200).json({
      message: 'Perfil actualizado correctamente',
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        estado: usuario.estado
      }
    });

  } catch (error) {
    console.error('❌ Error actualizando perfil:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  actualizarPerfil
};