const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  category_id: { type: DataTypes.UUID, allowNull: false },
  name_fr: { type: DataTypes.STRING(80), allowNull: false },
  name_en: { type: DataTypes.STRING(80), allowNull: true },
  name_it: { type: DataTypes.STRING(80), allowNull: true },
  name_ar: { type: DataTypes.STRING(80), allowNull: true },
  description_fr: { type: DataTypes.TEXT, allowNull: true },
  description_en: { type: DataTypes.TEXT, allowNull: true },
  description_it: { type: DataTypes.TEXT, allowNull: true },
  description_ar: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 3), allowNull: false, defaultValue: 0.000 },
  price_night: { type: DataTypes.DECIMAL(10, 3), allowNull: true },
  price_happy_hour: { type: DataTypes.DECIMAL(10, 3), allowNull: true },
  happy_hour_start: { type: DataTypes.TIME, allowNull: true },
  happy_hour_end: { type: DataTypes.TIME, allowNull: true },
  image_url: { type: DataTypes.STRING(500), allowNull: true },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  prep_time_min: { type: DataTypes.TINYINT, allowNull: true },
  disable_at: { type: DataTypes.TIME, allowNull: true },
  enable_at: { type: DataTypes.TIME, allowNull: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  promo_price: { type: DataTypes.DECIMAL(10, 3), allowNull: true },
  promo_label: { type: DataTypes.STRING(50), allowNull: true },
  promo_start: { type: DataTypes.DATEONLY, allowNull: true },
  promo_end: { type: DataTypes.DATEONLY, allowNull: true },
}, {
  tableName: 'menu_items',
  timestamps: true,
  underscored: true,
});

module.exports = MenuItem;
