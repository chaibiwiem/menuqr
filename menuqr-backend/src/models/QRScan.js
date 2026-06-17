const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const QRScan = sequelize.define('QRScan', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  table_id: { type: DataTypes.UUID, allowNull: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: true },
  ip_address: { type: DataTypes.STRING(45), allowNull: true },
  user_agent: { type: DataTypes.TEXT, allowNull: true },
  scanned_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'qr_scans', timestamps: false, underscored: true });

module.exports = QRScan;
