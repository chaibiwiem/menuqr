const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItemVariant = sequelize.define('MenuItemVariant', {
  id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  menu_item_id: { type: DataTypes.UUID, allowNull: false },
  label_fr:     { type: DataTypes.STRING(80), allowNull: false },
  label_en:     { type: DataTypes.STRING(80), allowNull: true },
  label_it:     { type: DataTypes.STRING(80), allowNull: true },
  label_ar:     { type: DataTypes.STRING(80), allowNull: true },
  price:        { type: DataTypes.DECIMAL(10, 3), allowNull: false, defaultValue: 0.000 },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  sort_order:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, {
  tableName: 'menu_item_variants',
  timestamps: true,
  underscored: true,
});

module.exports = MenuItemVariant;
