const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupplementOption = sequelize.define('SupplementOption', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  group_id: { type: DataTypes.UUID, allowNull: false },
  name_fr: { type: DataTypes.STRING(80), allowNull: false },
  name_en: { type: DataTypes.STRING(80), allowNull: true },
  name_it: { type: DataTypes.STRING(80), allowNull: true },
  name_ar: { type: DataTypes.STRING(80), allowNull: true },
  extra_price: { type: DataTypes.DECIMAL(10, 3), defaultValue: 0.000 },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  tableName: 'supplement_options',
  timestamps: true,
  underscored: true,
});

module.exports = SupplementOption;
