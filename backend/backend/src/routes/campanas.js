const express = require('express');

const router = express.Router();

const {
  getCampanas,
  crearCampana,
  actualizarCampana,
  eliminarCampana,
  getDonacionesVirtuales,
  registrarIngresoEfectivo,
  obtenerProgresoCampana
} = require('../controllers/campanasController');

router.get('/virtual-income', getDonacionesVirtuales);

router.post('/cash-income', registrarIngresoEfectivo);

/*
 HU-23
 Progreso de campaña para visualización del bombero 3D
*/
router.get('/:id/progress', obtenerProgresoCampana);

router.get('/', getCampanas);

router.post('/', crearCampana);

router.put('/:id', actualizarCampana);

router.delete('/:id', eliminarCampana);

module.exports = router;
