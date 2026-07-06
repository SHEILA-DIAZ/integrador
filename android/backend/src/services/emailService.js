const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const enviarCorreoAprobacion = async (
  destinatario,
  nombreCompania,
  codigoUnico
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Solicitud aprobada - FireSupport IA',
    html: `
      <h2>🔥 FireSupport IA</h2>
      <p>Hola ${nombreCompania},</p>
      <p>Su solicitud fue aprobada correctamente.</p>
      <h3>Código único: ${codigoUnico}</h3>
      <p>Ahora puede acceder a la plataforma.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

const enviarCorreoComprobanteDonacion = async (
  destinatario,
  nombreDonante,
  monto,
  comprobanteUrl
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Comprobante de donación - FireSupport IA',
    html: `
      <h2>🔥 FireSupport IA</h2>
      <p>Hola ${nombreDonante},</p>
      <p>Gracias por realizar tu donación.</p>
      <h3>Monto donado: S/ ${monto}</h3>
      <p>Puedes ver tu comprobante aquí:</p>
      <a href="${comprobanteUrl}">Ver comprobante PDF</a>
      <hr />
      <small>FireSupport IA</small>
    `
  };

  await transporter.sendMail(mailOptions);
};

const enviarCorreoRechazo = async (
  destinatario,
  nombreCompania,
  motivo
) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Solicitud rechazada - FireSupport IA',
    html: `
      <h2>🔥 FireSupport IA</h2>

      <p>Hola ${nombreCompania},</p>

      <p>
        Lamentamos informarle que su solicitud fue rechazada.
      </p>

      <h3>Motivo:</h3>

      <p>${motivo}</p>

      <p>
        Puede corregir la información y comunicarse con el equipo de soporte.
      </p>

      <hr />

      <small>FireSupport IA</small>
    `
  };

  await transporter.sendMail(mailOptions);
};

const enviarCorreoOTP = async (destinatario, codigo) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: destinatario,
    subject: 'Código de Verificación - FireSupport IA',
    html: `
      <div style="font-family: sans-serif; text-align: center; padding: 20px;">
        <h2 style="color: #D32F2F;">🔥 FireSupport IA</h2>
        <p>Tu código de verificación es:</p>
        <h1 style="font-size: 32px; letter-spacing: 5px; color: #333;">${codigo}</h1>
        <p>Este código expirará en 10 minutos.</p>
        <hr />
        <small>Si no solicitaste este código, puedes ignorar este correo.</small>
      </div>
    `
  };
  await transporter.sendMail(mailOptions);
};

module.exports = {
  enviarCorreoAprobacion,
  enviarCorreoComprobanteDonacion,
  enviarCorreoRechazo,
  enviarCorreoOTP
};
