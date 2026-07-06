const express = require('express');

const router = express.Router();

const {
  vincularAsociacion,
  desvincularAsociacion
} = require('../controllers/asociacionesController');

const {
  verificarToken,
  verificarSuperAdmin
} = require('../middlewares/auth');

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