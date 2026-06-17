const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id:   { type: DataTypes.UUID, allowNull: false },
  subscription_id: { type: DataTypes.UUID, allowNull: true },
  amount:   { type: DataTypes.DECIMAL(10, 3), allowNull: false },
  currency: { type: DataTypes.STRING(3), defaultValue: 'DT' },
  status: {
    type: DataTypes.ENUM('PAID', 'PENDING', 'CANCELLED'),
    defaultValue: 'PENDING',
  },
  invoice_number: { type: DataTypes.STRING(20), unique: true, allowNull: true },
  issued_at: { type: DataTypes.DATEONLY, allowNull: true },
  due_at:    { type: DataTypes.DATEONLY, allowNull: true },
  pdf_url:   { type: DataTypes.STRING(500), allowNull: true },
}, {
  tableName: 'invoices',
  timestamps: true,
  underscored: true,
});

module.exports = Invoice;
