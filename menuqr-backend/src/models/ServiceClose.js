const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceClose = sequelize.define('ServiceClose', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  date:          { type: DataTypes.DATEONLY, allowNull: false },
  total_cash:    { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  total_card:    { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  total_orders:  { type: DataTypes.INTEGER, defaultValue: 0 },
  total_revenue: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  notes:         { type: DataTypes.TEXT, allowNull: true },
  closed_by:     { type: DataTypes.UUID, allowNull: true },
  created_at:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'service_closes', timestamps: false, underscored: true });

module.exports = ServiceClose;
