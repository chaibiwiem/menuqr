const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id:              { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  order_id:        { type: DataTypes.UUID, allowNull: false },
  method:          { type: DataTypes.ENUM('CASH', 'CARD'), allowNull: false },
  amount:          { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  change_given:    { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0 },
  discount_type:   { type: DataTypes.ENUM('PERCENT', 'FIXED'), allowNull: true },
  processed_by:    { type: DataTypes.UUID, allowNull: true },
  processed_at:    { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'payments', timestamps: false, underscored: true });

module.exports = Payment;
