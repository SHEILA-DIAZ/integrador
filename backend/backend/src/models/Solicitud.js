const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Solicitud = sequelize.define('Solicitud', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre_compania: {
    type: DataTypes.STRING(150),
    allowNull: false
  },
  ruc: {
    type: DataTypes.STRING(11),
    allowNull: false,
    unique: true
  },
  email_contacto: {
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
    type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada'),
    defaultValue: 'pendiente'
  },
  motivo_rechazo: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'solicitudes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Solicitud;