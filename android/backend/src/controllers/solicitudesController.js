const {
  enviarCorreoAprobacion,
  enviarCorreoRechazo
} = require('../services/emailService');

const {
  Solicitud,
  Compania,
  UsuarioCompania
} = require('../models');

const { generarCodigoUnico } = require('../services/codigoService');
const { logError } = require('../utils/logger');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const crearSolicitud = async (req, res) => {
  try {
    const {
      nombre_compania,
      ruc,
      email_contacto,
      telefono,
      direccion
    } = req.body;

    if (!nombre_compania || !ruc || !email_contacto) {
      return res.status(400).json({
        error: 'Nombre, RUC y email son obligatorios'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email_contacto)) {
      return res.status(400).json({
        error: 'Correo electrónico inválido'
      });
    }

    if (ruc.length !== 11) {
      return res.status(400).json({
        error: 'El RUC debe tener exactamente 11 dígitos'
      });
    }

    const solicitudExistente = await Solicitud.findOne({
      where: { ruc }
    });

    if (solicitudExistente) {
      return res.status(400).json({
        error: 'Ya existe una solicitud con ese RUC'
      });
    }

    const nuevaSolicitud = await Solicitud.create({
      nombre_compania,
      ruc,
      email_contacto,
      telefono,
      direccion
    });

    return res.status(201).json({
      message: 'Solicitud enviada correctamente',
      solicitud: nuevaSolicitud
    });

  } catch (error) {
    logError('Error al crear solicitud', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const getSolicitudes = async (req, res) => {
  try {
    const {
      estado,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (estado) {
      where.estado = estado;
    }

    const offset = (page - 1) * limit;

    const solicitudes = await Solicitud.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.status(200).json({
      total: solicitudes.count,
      pagina: parseInt(page),
      solicitudes: solicitudes.rows
    });

  } catch (error) {
    logError('Error al obtener solicitudes', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const aprobarSolicitud = async (req, res) => {
  try {
    const { solicitud_id } = req.body;

    if (!solicitud_id) {
      return res.status(400).json({
        error: 'El ID de solicitud es obligatorio'
      });
    }

    const solicitud = await Solicitud.findByPk(solicitud_id);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        error: 'La solicitud ya fue procesada'
      });
    }

    const codigo_unico = await generarCodigoUnico();

    const nuevaCompania = await Compania.create({
      solicitud_id,
      nombre: solicitud.nombre_compania,
      ruc: solicitud.ruc,
      codigo_unico,
      email: solicitud.email_contacto,
      telefono: solicitud.telefono,
      direccion: solicitud.direccion
    });

    await solicitud.update({
      estado: 'aprobada'
    });

    await enviarCorreoAprobacion(
      solicitud.email_contacto,
      solicitud.nombre_compania,
      codigo_unico
    );

    return res.status(200).json({
      message: 'Solicitud aprobada correctamente',
      codigo_unico,
      compania: nuevaCompania
    });

  } catch (error) {
    logError('Error al aprobar solicitud', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const rechazarSolicitud = async (req, res) => {
  try {
    const { solicitud_id, motivo } = req.body;

    if (!solicitud_id || !motivo) {
      return res.status(400).json({
        error: 'Solicitud y motivo son obligatorios'
      });
    }

    const solicitud = await Solicitud.findByPk(solicitud_id);

    if (!solicitud) {
      return res.status(404).json({
        error: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'pendiente') {
      return res.status(400).json({
        error: 'La solicitud ya fue procesada'
      });
    }

    await solicitud.update({
      estado: 'rechazada',
      motivo_rechazo: motivo
    });

    await enviarCorreoRechazo(
      solicitud.email_contacto,
      solicitud.nombre_compania,
      motivo
    );

    return res.status(200).json({
      message: 'Solicitud rechazada correctamente',
      solicitud
    });

  } catch (error) {
    console.error('❌ Error rechazando solicitud:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const crearUsuarioCompania = async (req, res) => {
  try {
    const {
      compania_id,
      nombre,
      email,
      password,
      rol
    } = req.body;

    if (!compania_id || !nombre || !email || !password) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    const compania = await Compania.findByPk(compania_id);

    if (!compania) {
      return res.status(404).json({
        error: 'Compañía no encontrada'
      });
    }

    const usuarioExistente = await UsuarioCompania.findOne({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'El correo ya está registrado'
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const nuevoUsuario = await UsuarioCompania.create({
      compania_id,
      nombre,
      email,
      password: passwordHash,
      rol: rol || 'bombero'
    });

    return res.status(201).json({
      message: 'Usuario interno registrado correctamente',
      usuario: nuevoUsuario
    });

  } catch (error) {
    console.error('❌ Error creando usuario compañía:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const loginUsuarioCompania = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    const usuario = await UsuarioCompania.findOne({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    const passwordValida = await bcrypt.compare(
      password,
      usuario.password
    );

    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        compania_id: usuario.compania_id,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    return res.status(200).json({
      message: 'Login interno exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        compania_id: usuario.compania_id
      }
    });

  } catch (error) {
    console.error('❌ Error login usuario compañía:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearSolicitud,
  getSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
  crearUsuarioCompania,
  loginUsuarioCompania
};