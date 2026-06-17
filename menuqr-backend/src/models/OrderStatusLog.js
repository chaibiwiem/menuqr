const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderStatusLog = sequelize.define('OrderStatusLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  old_status: { type: DataTypes.STRING(20), allowNull: true },
  new_status: { type: DataTypes.STRING(20), allowNull: false },
  changed_by: { type: DataTypes.UUID, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'order_status_logs', timestamps: false, underscored: true });

module.exports = OrderStatusLog;
