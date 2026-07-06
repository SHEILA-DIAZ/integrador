const express = require('express');

const router = express.Router();

const {
  loginAsociacion
} = require('../controllers/asociacionesAuthController');

router.post(
  '/login',
  loginAsociacion
);

module.exports = router;