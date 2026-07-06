const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

const {
  Campana,
  Donacion,
  Compania,
  Asociacion,
  Usuario,
  UsuarioCompania,
  UsuarioAsociacion,
  Solicitud
} = require('../models');

const obtenerDatosReporteGlobal = async () => {
  const totalCampanas = await Campana.count();
  const campanasActivas = await Campana.count({ where: { estado: 'activa' } });

  const totalDonaciones = await Donacion.count();
  const montoDonaciones = await Donacion.sum('monto');

  const totalCompanias = await Compania.count();
  const companiasActivas = await Compania.count({ where: { estado: 'activo' } });

  const totalAsociaciones = await Asociacion.count();
  const asociacionesActivas = await Asociacion.count({ where: { estado: 'activa' } });

  const usuariosGenerales = await Usuario.count();
  const usuariosCompania = await UsuarioCompania.count();
  const usuariosAsociacion = await UsuarioAsociacion.count();

  const solicitudesPendientes = await Solicitud.count({ where: { estado: 'pendiente' } });
  const solicitudesAprobadas = await Solicitud.count({ where: { estado: 'aprobada' } });
  const solicitudesRechazadas = await Solicitud.count({ where: { estado: 'rechazada' } });

  const campanasDestacadas = await Campana.findAll({
    attributes: ['id', 'titulo', 'meta_monto', 'monto_recaudado', 'estado'],
    order: [['monto_recaudado', 'DESC']],
    limit: 5
  });

  return {
    resumen: {
      total_campanas: totalCampanas,
      campanas_activas: campanasActivas,
      total_donaciones: totalDonaciones,
      monto_total_donado: Number(montoDonaciones || 0),
      total_companias: totalCompanias,
      companias_activas: companiasActivas,
      total_asociaciones: totalAsociaciones,
      asociaciones_activas: asociacionesActivas,
      total_usuarios: usuariosGenerales + usuariosCompania + usuariosAsociacion
    },
    solicitudes: {
      pendientes: solicitudesPendientes,
      aprobadas: solicitudesAprobadas,
      rechazadas: solicitudesRechazadas
    },
    campanas_destacadas: campanasDestacadas
  };
};

const obtenerReporteGlobal = async (req, res) => {
  try {
    const reporte = await obtenerDatosReporteGlobal();

    return res.status(200).json(reporte);

  } catch (error) {
    console.error('❌ Error generando reporte global:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const exportarReportePDF = async (req, res) => {
  try {
    const reporte = await obtenerDatosReporteGlobal();

    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte-global-firesupport.pdf'
    );

    doc.pipe(res);

    doc.fontSize(22).text('Reporte Global - FireSupport IA', {
      align: 'center'
    });

    doc.moveDown();

    doc.fontSize(14).text('Resumen General');
    doc.moveDown(0.5);

    Object.entries(reporte.resumen).forEach(([key, value]) => {
      doc.fontSize(11).text(`${key}: ${value}`);
    });

    doc.moveDown();

    doc.fontSize(14).text('Solicitudes');
    doc.moveDown(0.5);

    Object.entries(reporte.solicitudes).forEach(([key, value]) => {
      doc.fontSize(11).text(`${key}: ${value}`);
    });

    doc.moveDown();

    doc.fontSize(14).text('Campañas destacadas');
    doc.moveDown(0.5);

    reporte.campanas_destacadas.forEach((campana) => {
      doc.fontSize(11).text(
        `ID ${campana.id} | ${campana.titulo} | Meta: S/ ${campana.meta_monto} | Recaudado: S/ ${campana.monto_recaudado} | Estado: ${campana.estado}`
      );
    });

    doc.end();

  } catch (error) {
    console.error('❌ Error exportando PDF:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

const exportarReporteExcel = async (req, res) => {
  try {
    const reporte = await obtenerDatosReporteGlobal();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Reporte Global');

    sheet.columns = [
      { header: 'Sección', key: 'seccion', width: 25 },
      { header: 'Indicador', key: 'indicador', width: 35 },
      { header: 'Valor', key: 'valor', width: 20 }
    ];

    Object.entries(reporte.resumen).forEach(([key, value]) => {
      sheet.addRow({
        seccion: 'Resumen',
        indicador: key,
        valor: value
      });
    });

    Object.entries(reporte.solicitudes).forEach(([key, value]) => {
      sheet.addRow({
        seccion: 'Solicitudes',
        indicador: key,
        valor: value
      });
    });

    sheet.addRow({});
    sheet.addRow({
      seccion: 'Campañas destacadas',
      indicador: 'Título',
      valor: 'Monto recaudado'
    });

    reporte.campanas_destacadas.forEach((campana) => {
      sheet.addRow({
        seccion: `ID ${campana.id}`,
        indicador: campana.titulo,
        valor: Number(campana.monto_recaudado)
      });
    });

    sheet.getRow(1).font = { bold: true };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=reporte-global-firesupport.xlsx'
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('❌ Error exportando Excel:', error);

    return res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
};

module.exports = {
  obtenerReporteGlobal,
  exportarReportePDF,
  exportarReporteExcel
};