const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const admin = require("../config/firebase-admin");

const { Usuario, IntentosLogin } = require('../models');
const { enviarCorreoOTP } = require('../services/emailService');

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validaciones
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Correo inválido' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener mínimo 6 caracteres' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Crear usuario con estado pendiente
    await Usuario.create({
      nombre,
      email,
      password_hash,
      rol: 'donante',
      estado: 'pendiente'
    });

    // Enviar correo real
    try {
        await enviarCorreoOTP(email, otp);
    } catch (mailError) {
        console.error('❌ Error enviando correo:', mailError);
        // Continuamos aunque falle el correo para no romper el flujo en desarrollo
    }

    res.status(201).json({
      message: 'Usuario registrado. Verifica tu correo para activar tu cuenta.'
    });

  } catch (error) {
    console.error('❌ Error en register:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Correo inválido' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (usuario.estado === 'inactivo') {
      return res.status(403).json({ error: 'Usuario inactivo' });
    }

    // Si está pendiente, debe verificar OTP (esto se manejará en el front redirigiendo a OTP)

    let intento = await IntentosLogin.findOne({ where: { email } });
    if (intento && intento.bloqueado_hasta) {
      const ahora = new Date();
      if (ahora < new Date(intento.bloqueado_hasta)) {
        const minutosRestantes = Math.ceil((new Date(intento.bloqueado_hasta) - ahora) / 60000);
        return res.status(403).json({ error: `Cuenta bloqueada. Intenta en ${minutosRestantes} minutos` });
      } else {
        await intento.update({ intentos: 0, bloqueado_hasta: null });
      }
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValida) {
      if (intento) {
        await intento.increment('intentos');
        await intento.reload();
        if (intento.intentos >= 5) {
          const bloqueado_hasta = new Date(Date.now() + 15 * 60 * 1000);
          await intento.update({ bloqueado_hasta });
          return res.status(403).json({ error: 'Cuenta bloqueada por 15 minutos' });
        }
      } else {
        await IntentosLogin.create({ email, intentos: 1 });
      }
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (intento) {
      await intento.update({ intentos: 0, bloqueado_hasta: null });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
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
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: "Token requerido" });
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const email = decodedToken.email;
        const nombre = decodedToken.name || "Usuario Google";

        let usuario = await Usuario.findOne({ where: { email } });
        if (!usuario) {
            usuario = await Usuario.create({
                nombre,
                email,
                password_hash: "",
                rol: "donante",
                estado: "activo",
                provider: "google"
            });
        }

        const token = jwt.sign(
            { id: usuario.id, email: usuario.email, rol: usuario.rol },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.json({
            message: "Login exitoso con Google",
            token,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: usuario.rol
            }
        });
    } catch (error) {
        console.error('❌ Error en googleLogin:', error);
        res.status(401).json({ error: "Token Google inválido" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        // Aquí deberías guardar el OTP en DB asociado al usuario
        await enviarCorreoOTP(email, otp);
        res.json({ message: "Si el correo está registrado, recibirás un código OTP." });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        // Mock verification: acepta cualquier código de 4 dígitos para testear
        if (otp && otp.length === 4) {
            // Activar usuario si estaba pendiente
            const usuario = await Usuario.findOne({ where: { email } });
            if (usuario && usuario.estado === 'pendiente') {
                await usuario.update({ estado: 'activo' });
            }
            return res.json({ message: "Código verificado correctamente" });
        }
        res.status(400).json({ error: "Código inválido" });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const password_hash = await bcrypt.hash(newPassword, 10);
        const usuario = await Usuario.findOne({ where: { email } });
        if (usuario) {
            await usuario.update({ password_hash, estado: 'activo' });
            return res.json({ message: "Contraseña actualizada correctamente" });
        }
        res.status(404).json({ error: "Usuario no encontrado" });
    } catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
};

module.exports = {
  register,
  login,
  googleLogin,
  forgotPassword,
  verifyOtp,
  resetPassword
};
