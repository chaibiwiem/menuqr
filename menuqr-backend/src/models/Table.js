const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Table = sequelize.define('Table', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  room_id: { type: DataTypes.UUID, allowNull: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  number: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true },
  name: { type: DataTypes.STRING(30), allowNull: false },
  capacity: { type: DataTypes.TINYINT.UNSIGNED, defaultValue: 2 },
  status: {
    type: DataTypes.ENUM('LIBRE', 'OCCUPEE', 'RESERVEE', 'EN_ATTENTE', 'DESACTIVEE'),
    defaultValue: 'LIBRE',
  },
  qr_token: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, unique: true },
  qr_url: { type: DataTypes.STRING(500), allowNull: true },
  position_x: { type: DataTypes.INTEGER, defaultValue: 0 },
  position_y: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: 'tables', timestamps: true, underscored: true });

module.exports = Table;
