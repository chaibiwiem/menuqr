const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id: { type: DataTypes.UUID, allowNull: false },
  menu_item_id: { type: DataTypes.UUID, allowNull: true },
  quantity: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 1 },
  unit_price: { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  name_snapshot: { type: DataTypes.STRING(80), allowNull: false },
  notes: { type: DataTypes.TEXT, allowNull: true },
}, { tableName: 'order_items', timestamps: false, underscored: true });

module.exports = OrderItem;
