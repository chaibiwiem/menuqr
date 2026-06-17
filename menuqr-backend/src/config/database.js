const { Sequelize } = require('sequelize');
require('dotenv').config();

// Strip protocol (https://) and path (/menu) if DB_HOST is a full URL
const rawHost = process.env.DB_HOST || 'localhost';
const DB_HOST = rawHost.replace(/^https?:\/\//, '').split('/')[0];

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS || '',
  {
    host: DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+01:00',
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = sequelize;
