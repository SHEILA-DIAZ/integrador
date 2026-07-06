const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Compania = sequelize.define('Compania', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  solicitud_id: {
    type: DataTypes.INTEGER
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
  codigo_unico: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  telefono: {
    type: DataTypes.STRING(15)
  },
  direccion: {
    type: DataTypes.STRING(200)
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'companias',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Compania;