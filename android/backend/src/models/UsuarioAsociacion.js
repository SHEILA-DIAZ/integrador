const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UsuarioAsociacion = sequelize.define('UsuarioAsociacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  asociacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  rol: {
    type: DataTypes.ENUM('admin_asociacion'),
    defaultValue: 'admin_asociacion'
  },
  estado: {
    type: DataTypes.ENUM('activo', 'inactivo'),
    defaultValue: 'activo'
  }
}, {
  tableName: 'usuarios_asociacion',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = UsuarioAsociacion;