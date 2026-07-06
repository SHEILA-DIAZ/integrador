const express = require('express');

const router = express.Router();

const {
  actualizarPerfil
} = require('../controllers/usuariosController');

const {
  verificarToken
} = require('../middlewares/auth');

router.put(
  '/profile',
  verificarToken,
  actualizarPerfil
);

module.exports = router;