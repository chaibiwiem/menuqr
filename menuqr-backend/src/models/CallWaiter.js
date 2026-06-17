const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CallWaiter = sequelize.define('CallWaiter', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  table_id: { type: DataTypes.UUID, allowNull: false },
  type: { type: DataTypes.ENUM('WAITER', 'CHECK', 'OTHER'), defaultValue: 'WAITER' },
  message: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('PENDING', 'IN_PROGRESS', 'DONE'), defaultValue: 'PENDING' },
  resolved_at: { type: DataTypes.DATE, allowNull: true },
  resolved_by: { type: DataTypes.UUID, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'call_waiters', timestamps: false, underscored: true });

module.exports = CallWaiter;
