const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CompaniaAsociacion = sequelize.define('CompaniaAsociacion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  compania_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  asociacion_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('vinculada', 'desvinculada'),
    defaultValue: 'vinculada'
  }
}, {
  tableName: 'compania_asociacion',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = CompaniaAsociacion;