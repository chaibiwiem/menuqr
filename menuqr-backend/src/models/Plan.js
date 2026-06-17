const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plan = sequelize.define('Plan', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: {
    type: DataTypes.ENUM('FREE', 'STARTER', 'PRO', 'PREMIUM'),
    allowNull: false,
    unique: true,
  },
  price_monthly: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0.000 },
  price_annual:  { type: DataTypes.DECIMAL(10, 3), defaultValue: 0.000 },
  features:      { type: DataTypes.JSON, defaultValue: [] },
  max_menus:     { type: DataTypes.INTEGER, defaultValue: 1 },
  max_tables:    { type: DataTypes.INTEGER, defaultValue: 5 },
  max_staff:     { type: DataTypes.INTEGER, defaultValue: 2 },
}, {
  tableName: 'plans',
  timestamps: true,
  underscored: true,
});

module.exports = Plan;
