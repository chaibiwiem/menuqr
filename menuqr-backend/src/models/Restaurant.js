const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Restaurant = sequelize.define('Restaurant', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  owner_id: { type: DataTypes.UUID, allowNull: true },
  name: { type: DataTypes.STRING(80), allowNull: false },
  slug: { type: DataTypes.STRING(100), unique: true, allowNull: false },
  type: {
    type: DataTypes.ENUM('Restaurant', 'Café', 'Bar', 'Hôtel', 'Fast-food', 'Autre'),
    defaultValue: 'Restaurant',
  },
  email: { type: DataTypes.STRING(191), allowNull: true },
  phone: { type: DataTypes.STRING(30), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  logo_url: { type: DataTypes.STRING(500), allowNull: true },
  banner_url: { type: DataTypes.STRING(500), allowNull: true },
  short_description: { type: DataTypes.STRING(160), allowNull: true },
  template_id: {
    type: DataTypes.ENUM(
      'aurora_glass', 'bento_menu', 'classic_theme',
      'dark_sleek', 'editorial_menu', 'modern_theme'
    ),
    defaultValue: 'classic_theme',
  },
  plan: {
    type: DataTypes.ENUM('FREE', 'STARTER', 'PRO', 'PREMIUM'),
    defaultValue: 'FREE',
  },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  social_facebook: { type: DataTypes.STRING(255), allowNull: true },
  social_instagram: { type: DataTypes.STRING(255), allowNull: true },
  social_tripadvisor: { type: DataTypes.STRING(255), allowNull: true },
  social_google_maps: { type: DataTypes.STRING(255), allowNull: true },
  social_website: { type: DataTypes.STRING(255), allowNull: true },
  social_whatsapp: { type: DataTypes.STRING(30), allowNull: true },
  custom_colors: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('custom_colors');
      if (!raw) return null;
      if (typeof raw === 'object') return raw;
      try { return JSON.parse(raw); } catch { return null; }
    },
    set(val) {
      this.setDataValue('custom_colors', val ? JSON.stringify(val) : null);
    },
  },
  custom_font:    { type: DataTypes.STRING(100), allowNull: true },
  menu_languages: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const raw = this.getDataValue('menu_languages');
      if (!raw) return null;
      if (Array.isArray(raw)) return raw;
      try { return JSON.parse(raw); } catch { return null; }
    },
    set(val) {
      this.setDataValue('menu_languages', val ? JSON.stringify(val) : null);
    },
  },
  fiscal_matricule: { type: DataTypes.STRING(100), allowNull: true },
  fiscal_company: { type: DataTypes.STRING(255), allowNull: true },
  fiscal_address: { type: DataTypes.TEXT, allowNull: true },
  created_by: { type: DataTypes.UUID, allowNull: true },
  activated_at: { type: DataTypes.DATE, allowNull: true },
}, {
  tableName: 'restaurants',
  timestamps: true,
  underscored: true,
});

module.exports = Restaurant;
