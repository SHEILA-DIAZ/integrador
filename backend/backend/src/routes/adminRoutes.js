const express = require('express');
const router = express.Router();

const {
  listarUsuarios,
  actualizarRolUsuario
} = require('../controllers/adminController');

const {
  verificarToken,
  verificarSuperAdmin
} = require('../middlewares/auth');

const {
  obtenerReporteGlobal,
  exportarReportePDF,
  exportarReporteExcel
} = require('../controllers/reportesController');

router.get(
  '/users',
  verificarToken,
  verificarSuperAdmin,
  listarUsuarios
);

router.put(
  '/users/:id/role',
  verificarToken,
  verificarSuperAdmin,
  actualizarRolUsuario
);

router.get('/reports/global',
  verificarToken,
  verificarSuperAdmin,
  obtenerReporteGlobal);

router.get('/reports/pdf',
  verificarToken,
  verificarSuperAdmin,
  exportarReportePDF);

router.get('/reports/excel',
  verificarToken,
  verificarSuperAdmin,
  exportarReporteExcel);

module.exports = router;