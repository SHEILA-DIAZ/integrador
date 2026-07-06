const { DataTypes } = require('sequelize');

const { sequelize } = require('../config/database');

const UsuarioCompania = sequelize.define('UsuarioCompania', {

  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  compania_id: {
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

  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },

  rol: {
    type: DataTypes.ENUM(
      'admin_compania',
      'bombero'
    ),
    defaultValue: 'bombero'
  }

}, {

  tableName: 'usuarios_compania',

  timestamps: true,

  createdAt: 'created_at',

  updatedAt: false

});

module.exports = UsuarioCompania;