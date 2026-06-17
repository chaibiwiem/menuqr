const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  plan: {
    type: DataTypes.ENUM('FREE', 'STARTER', 'PRO', 'PREMIUM'),
    allowNull: false,
    defaultValue: 'FREE',
  },
  billing_period: {
    type: DataTypes.ENUM('MONTHLY', 'ANNUAL'),
    defaultValue: 'MONTHLY',
  },
  status: {
    type: DataTypes.ENUM('ACTIVE', 'TRIAL', 'EXPIRED', 'CANCELLED', 'SUSPENDED'),
    defaultValue: 'TRIAL',
  },
  starts_at: { type: DataTypes.DATEONLY, allowNull: true },
  ends_at: { type: DataTypes.DATEONLY, allowNull: true },
  trial_ends_at: { type: DataTypes.DATEONLY, allowNull: true },
  amount: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0.000 },
  currency: { type: DataTypes.STRING(3), defaultValue: 'DT' },
  payment_ref: { type: DataTypes.STRING(255), allowNull: true },
  admin_notes: { type: DataTypes.TEXT, allowNull: true },
}, {
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true,
});

module.exports = Subscription;
