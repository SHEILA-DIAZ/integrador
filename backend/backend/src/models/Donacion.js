const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Donacion = sequelize.define('Donacion', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  campana_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  donante_nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  donante_email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  monto: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  metodo_pago: {
    type: DataTypes.ENUM(
      'tarjeta_credito',
      'tarjeta_debito',
      'yape',
      'plin'
    ),
    defaultValue: 'tarjeta_credito'
  },

  codigo_operacion: {
    type: DataTypes.STRING(50)
  }

}, {

  tableName: 'donaciones',

  timestamps: true,

  createdAt: 'created_at',

  updatedAt: false

});

module.exports = Donacion;