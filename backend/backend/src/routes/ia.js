const express = require('express');

const router = express.Router();

const {
  generarCampaniaIA
} = require('../controllers/iaController');

const {
  verificarToken
} = require('../middlewares/auth');

router.post(
  '/generate-campaign',
  verificarToken,
  generarCampaniaIA
);

module.exports = router;