const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { Usuario, IntentosLogin } = require('../models');

const register = async (req, res) => {

  try {

    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Correo inválido'
      });
    }

    // Validar contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: 'La contraseña debe tener mínimo 6 caracteres'
      });
    }

    // Verificar email duplicado
    const usuarioExistente = await Usuario.findOne({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        error: 'El correo ya está registrado'
      });
    }

    // Encriptar contraseña
    const password_hash = await bcrypt.hash(password, 10);

    // Crear usuario
    await Usuario.create({
      nombre,
      email,
      password_hash
    });

    res.status(201).json({
      message: 'Usuario registrado correctamente'
    });

  } catch (error) {

    console.error('❌ Error en register:', error);

    res.status(500).json({
      error: 'Error interno del servidor'
    });

  }

};

const login = async (req, res) => {

  try {

    const { email, password } = req.body;

    // Validaciones
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios'
      });
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Correo inválido'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({
      where: { email }
    });

    // Usuario no existe
    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });
    }

    // Verificar estado
    if (usuario.estado !== 'activo') {
      return res.status(403).json({
        error: 'Usuario inactivo'
      });
    }

    // Buscar intentos
    let intento = await IntentosLogin.findOne({
      where: { email }
    });

    // Verificar bloqueo
    if (intento && intento.bloqueado_hasta) {

      const ahora = new Date();

      // Sigue bloqueado
      if (ahora < new Date(intento.bloqueado_hasta)) {

        const minutosRestantes = Math.ceil(
          (new Date(intento.bloqueado_hasta) - ahora) / 60000
        );

        return res.status(403).json({
          error: `Cuenta bloqueada. Intenta en ${minutosRestantes} minutos`
        });

      } else {

        // Resetear bloqueo expirado
        await intento.update({
          intentos: 0,
          bloqueado_hasta: null
        });

      }

    }

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(
      password,
      usuario.password_hash
    );

    // Contraseña incorrecta
    if (!passwordValida) {

      console.log('❌ Password incorrecta');

      if (intento) {

        // Incrementar intentos
        await intento.increment('intentos');

        // Recargar datos actualizados
        await intento.reload();

        console.log('Intentos actuales:', intento.intentos);

        // Bloquear cuenta
        if (intento.intentos >= 5) {

          console.log('🚫 CUENTA BLOQUEADA');

          const bloqueado_hasta = new Date(
            Date.now() + 15 * 60 * 1000
          );

          await intento.update({
            bloqueado_hasta
          });

          return res.status(403).json({
            error: 'Cuenta bloqueada por 15 minutos'
          });

        }

      } else {

        console.log('🟡 Primer intento');

        // Crear primer intento
        await IntentosLogin.create({
          email,
          intentos: 1
        });

      }

      return res.status(401).json({
        error: 'Credenciales incorrectas'
      });

}

    // Login exitoso
    if (intento) {

      await intento.update({
        intentos: 0,
        bloqueado_hasta: null
      });

    }

    // Generar JWT

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '7d'
      }
    );

    res.status(200).json({

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

    console.error('❌ Error en login:', error);

    res.status(500).json({
      error: 'Error interno del servidor'
    });

  }

};

module.exports = {
  register,
  login
};