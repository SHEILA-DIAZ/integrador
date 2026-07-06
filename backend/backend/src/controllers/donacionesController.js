const PDFDocument = require('pdfkit');

const { Donacion, Campana } = require('../models');

const {
  enviarCorreoComprobanteDonacion
} = require('../services/emailService');

const crearDonacion = async (req, res) => {
  try {
    const {
      campana_id,
      donante_nombre,
      donante_email,
      monto,
      metodo_pago,
      codigo_operacion
    } = req.body;

    if (!campana_id || !donante_nombre || !donante_email || !monto) {
      return res.status(400).json({
        error: 'Todos los campos principales son obligatorios'
      });
    }

    const metodosPermitidos = [
      'tarjeta_credito',
      'tarjeta_debito',
      'yape',
      'plin'
    ];

    const metodoPagoFinal = metodo_pago || 'tarjeta_credito';

    if (!metodosPermitidos.includes(metodoPagoFinal)) {
      return res.status(400).json({
        error: 'Método de pago no válido'
      });
    }

    if (
      (metodoPagoFinal === 'yape' || metodoPagoFinal === 'plin') &&
      !codigo_operacion
    ) {
      return res.status(400).json({
        error: 'El código de operación es obligatorio para Yape o Plin'
      });
    }

    const campana = await Campana.findByPk(campana_id);

    if (!campana) {
      return res.status(404).json({
        error: 'Campaña no encontrada'
      });
    }

    const nuevaDonacion = await Donacion.create({
      campana_id,
      donante_nombre,
      donante_email,
      monto,
      metodo_pago: metodoPagoFinal,
      codigo_operacion: codigo_operacion || null
    });

    const montoActual =
      parseFloat(campana.monto_recaudado || 0) + parseFloat(monto);

    await campana.update({
      monto_recaudado: montoActual
    });

    const comprobanteUrl =
      `${process.env.APP_URL}/api/donations/receipt/${nuevaDonacion.id}`;

    try {
      await enviarCorreoComprobanteDonacion(
        donante_email,
        donante_nombre,
        monto,
        comprobanteUrl
      );
    } catch (correoError) {
      console.error(
        '❌ Error enviando correo comprobante:',
        correoError.message
      );
    }

    return res.status(201).json({
      message: 'Donación registrada correctamente',
      donacion: nuevaDonacion,
      comprobante_url: comprobanteUrl
    });

  } catch (error) {
    console.error('❌ Error registrando donación:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const historialDonaciones = async (req, res) => {
  try {
    const email = req.usuario?.email;

    if (!email) {
      return res.status(400).json({
        error: 'No se pudo identificar el correo del usuario'
      });
    }

    const donaciones = await Donacion.findAll({
      where: {
        donante_email: email
      },
      order: [['created_at', 'DESC']]
    });

    const campanaIds = [
      ...new Set(
        donaciones
          .map((donacion) => donacion.campana_id)
          .filter(Boolean)
      )
    ];

    const campanas = await Campana.findAll({
      where: {
        id: campanaIds
      }
    });

    const campanasPorId = new Map(
      campanas.map((campana) => [campana.id, campana])
    );

    const historial = donaciones.map((donacion) => {
      const data = donacion.toJSON();
      const campana = campanasPorId.get(data.campana_id);

      return {
        ...data,
        campana: campana
          ? {
              id: campana.id,
              titulo: campana.titulo
            }
          : null,
        campaignName: campana?.titulo || null,
        campana_nombre: campana?.titulo || null
      };
    });

    return res.status(200).json({
      total: historial.length,
      donaciones: historial
    });

  } catch (error) {
    console.error('❌ Error obteniendo historial:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const generarComprobante = async (req, res) => {
  try {
    const { id } = req.params;

    const donacion = await Donacion.findByPk(id);

    if (!donacion) {
      return res.status(404).json({
        error: 'Donación no encontrada'
      });
    }

    const campana = await Campana.findByPk(donacion.campana_id);

    if (!campana) {
      return res.status(404).json({
        error: 'Campaña asociada no encontrada'
      });
    }

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename=comprobante-${id}.pdf`
    );

    doc.pipe(res);

    doc
      .fontSize(22)
      .text('Comprobante de Donación', {
        align: 'center'
      });

    doc.moveDown();

    doc
      .fontSize(14)
      .text(`Donante: ${donacion.donante_nombre}`);

    doc.text(`Correo: ${donacion.donante_email}`);

    doc.text(`Campaña: ${campana.titulo}`);

    doc.text(`Monto Donado: S/ ${donacion.monto}`);

    doc.text(`Método de pago: ${donacion.metodo_pago}`);

    if (donacion.codigo_operacion) {
      doc.text(`Código de operación: ${donacion.codigo_operacion}`);
    }

    doc.text(`Fecha: ${donacion.created_at}`);

    doc.moveDown();

    doc.text('Gracias por apoyar a FireSupport IA', {
      align: 'center'
    });

    doc.end();

  } catch (error) {
    console.error('❌ Error generando comprobante:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  crearDonacion,
  historialDonaciones,
  generarComprobante
};
