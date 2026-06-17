const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItemSupplement = sequelize.define('OrderItemSupplement', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_item_id: { type: DataTypes.UUID, allowNull: false },
  supplement_option_id: { type: DataTypes.UUID, allowNull: true },
  option_name_snapshot: { type: DataTypes.STRING(80), allowNull: false },
  extra_price: { type: DataTypes.DECIMAL(10, 3), allowNull: false, defaultValue: 0 },
}, { tableName: 'order_item_supplements', timestamps: false, underscored: true });

module.exports = OrderItemSupplement;
