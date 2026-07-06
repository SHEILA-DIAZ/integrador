const {
  Usuario,
  UsuarioCompania,
  UsuarioAsociacion
} = require('../models');

const listarUsuarios = async (req, res) => {
  try {
    const usuariosGenerales = await Usuario.findAll({
      attributes: ['id', 'nombre', 'email', 'rol', 'estado', 'created_at']
    });

    const usuariosCompania = await UsuarioCompania.findAll({
      attributes: ['id', 'compania_id', 'nombre', 'email', 'rol', 'created_at']
    });

    const usuariosAsociacion = await UsuarioAsociacion.findAll({
      attributes: ['id', 'asociacion_id', 'nombre', 'email', 'rol', 'estado', 'created_at']
    });

    return res.status(200).json({
      usuarios_generales: usuariosGenerales,
      usuarios_compania: usuariosCompania,
      usuarios_asociacion: usuariosAsociacion
    });

  } catch (error) {
    console.error('❌ Error listando usuarios:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const actualizarRolUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, rol, estado } = req.body;

    let modelo = null;

    if (tipo === 'general') modelo = Usuario;
    if (tipo === 'compania') modelo = UsuarioCompania;
    if (tipo === 'asociacion') modelo = UsuarioAsociacion;

    if (!modelo) {
      return res.status(400).json({
        error: 'Tipo de usuario inválido'
      });
    }

    const usuario = await modelo.findByPk(id);

    if (!usuario) {
      return res.status(404).json({
        error: 'Usuario no encontrado'
      });
    }

    if (rol) {
      usuario.rol = rol;
    }

    if (
      estado &&
      Object.prototype.hasOwnProperty.call(usuario.dataValues, 'estado')
    ) {
      usuario.estado = estado;
    }

    await usuario.save();

    return res.status(200).json({
      message: 'Usuario actualizado correctamente',
      usuario
    });

  } catch (error) {
    console.error('❌ Error actualizando usuario:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  listarUsuarios,
  actualizarRolUsuario
};