const express = require('express');

const router = express.Router();

const {
  listarAsociaciones,
  vincularAsociacion,
  desvincularAsociacion
} = require('../controllers/asociacionesController');

const {
  verificarToken,
  verificarSuperAdmin
} = require('../middlewares/auth');

router.get(
  '/',
  verificarToken,
  listarAsociaciones
);

router.post(
  '/link',
  verificarToken,
  verificarSuperAdmin,
  vincularAsociacion
);

router.delete(
  '/unlink',
  verificarToken,
  verificarSuperAdmin,
  desvincularAsociacion
);

module.exports = router;
