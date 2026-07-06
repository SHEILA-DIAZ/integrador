const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      charset: 'utf8mb4',
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const conectarDB = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a MySQL exitosa');
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error);
  }
};

module.exports = {
  sequelize,
  conectarDB
};