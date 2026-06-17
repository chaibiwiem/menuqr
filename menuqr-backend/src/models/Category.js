const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  menu_id: { type: DataTypes.UUID, allowNull: false },
  name_fr: { type: DataTypes.STRING(80), allowNull: false },
  name_en: { type: DataTypes.STRING(80), allowNull: true },
  name_it: { type: DataTypes.STRING(80), allowNull: true },
  name_ar: { type: DataTypes.STRING(80), allowNull: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  icon: { type: DataTypes.STRING(10), allowNull: true },
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true,
});

module.exports = Category;
