const express = require('express');

const router = express.Router();

const {
  crearDonacion,
  historialDonaciones,
  generarComprobante
} = require('../controllers/donacionesController');

const {
  verificarToken
} = require('../middlewares/auth');

router.post(
  '/',
  crearDonacion
);

router.get(
  '/history',
  verificarToken,
  historialDonaciones
);

router.get(
  '/receipt/:id',
  generarComprobante
);

module.exports = router;