const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  table_id: { type: DataTypes.UUID, allowNull: true },
  staff_id: { type: DataTypes.UUID, allowNull: true },
  status: {
    type: DataTypes.ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'SERVED', 'CLOSED', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
  total: { type: DataTypes.DECIMAL(10, 3), allowNull: false, defaultValue: 0 },
  payment_method: {
    type: DataTypes.ENUM('CASH', 'CARD', 'PENDING'),
    defaultValue: 'PENDING',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'orders', timestamps: true, underscored: true });

module.exports = Order;
