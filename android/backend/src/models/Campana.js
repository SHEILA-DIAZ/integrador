const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Campana = sequelize.define('Campana', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  compania_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },

  titulo: {
    type: DataTypes.STRING(200),
    allowNull: false
  },

  descripcion: {
    type: DataTypes.TEXT
  },

  categoria: {
    type: DataTypes.ENUM(
      'uniforme_bombero',
      'equipamiento',
      'ambulancia',
      'infraestructura',
      'capacitacion',
      'otros'
    ),
    defaultValue: 'otros'
  },

  meta_monto: {
    type: DataTypes.DECIMAL(10,2),
    allowNull: false
  },

  monto_recaudado: {
    type: DataTypes.DECIMAL(10,2),
    defaultValue: 0
  },

  imagen_url: {
    type: DataTypes.STRING(255)
  },

  estado: {
    type: DataTypes.ENUM('activa', 'cerrada'),
    defaultValue: 'activa'
  }

}, {

  tableName: 'campanas',

  timestamps: true,

  createdAt: 'created_at',

  updatedAt: false

});

module.exports = Campana;