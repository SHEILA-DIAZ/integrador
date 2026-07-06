const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const IntentosLogin = sequelize.define('IntentosLogin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  email: {
    type: DataTypes.STRING(100),
    allowNull: false
  },

  intentos: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },

  bloqueado_hasta: {
    type: DataTypes.DATE
  }

}, {
  tableName: 'intentos_login',
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});

module.exports = IntentosLogin;