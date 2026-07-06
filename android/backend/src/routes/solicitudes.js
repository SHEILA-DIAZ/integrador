const express = require('express');

const router = express.Router();

const {
  crearSolicitud,
  getSolicitudes,
  aprobarSolicitud,
  rechazarSolicitud,
  crearUsuarioCompania,
  loginUsuarioCompania
} = require('../controllers/solicitudesController');

const {
  verificarToken,
  verificarSuperAdmin
} = require('../middlewares/auth');

router.post(
  '/request',
  crearSolicitud
);

router.get(
  '/requests',
  verificarToken,
  verificarSuperAdmin,
  getSolicitudes
);

router.post(
  '/approve',
  verificarToken,
  verificarSuperAdmin,
  aprobarSolicitud
);

router.post(
  '/reject',
  verificarToken,
  verificarSuperAdmin,
  rechazarSolicitud
);

router.post(
  '/users',
  verificarToken,
  verificarSuperAdmin,
  crearUsuarioCompania
);

router.post(
  '/users/login',
  loginUsuarioCompania
);

module.exports = router;