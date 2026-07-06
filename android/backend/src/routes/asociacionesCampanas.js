const express = require('express');

const router = express.Router();

const {
  obtenerCampanasAsociacion,
  actualizarCampanaAsociacion
} = require(
  '../controllers/asociacionesCampanasController'
);

const {
  verificarAdminAsociacion
} = require(
  '../middlewares/asociacionAuth'
);

router.get(
  '/campaigns',
  verificarAdminAsociacion,
  obtenerCampanasAsociacion
);

router.put(
  '/campaigns/:id',
  verificarAdminAsociacion,
  actualizarCampanaAsociacion
);

module.exports = router;