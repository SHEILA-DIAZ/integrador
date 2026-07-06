const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Asociacion = sequelize.define('Asociacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  ruc: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(15)
  },
  estado: {
    type: DataTypes.ENUM('activa', 'inactiva'),
    defaultValue: 'activa'
  }
}, {
  tableName: 'asociaciones',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Asociacion;