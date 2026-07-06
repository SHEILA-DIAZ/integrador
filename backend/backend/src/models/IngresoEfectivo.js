const { DataTypes } = require('sequelize');

const { sequelize } = require('../config/database');

const IngresoEfectivo = sequelize.define('IngresoEfectivo', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  campana_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  descripcion: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  monto: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  registrado_por: {
    type: DataTypes.STRING(100),
    allowNull: false
  }

}, {

  tableName: 'ingresos_efectivo',

  timestamps: true,

  createdAt: 'created_at',

  updatedAt: false

});

module.exports = IngresoEfectivo;