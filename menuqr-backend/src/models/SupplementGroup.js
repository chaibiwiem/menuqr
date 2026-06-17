const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SupplementGroup = sequelize.define('SupplementGroup', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  menu_item_id: { type: DataTypes.UUID, allowNull: false },
  name_fr: { type: DataTypes.STRING(80), allowNull: false },
  name_en: { type: DataTypes.STRING(80), allowNull: true },
  name_it: { type: DataTypes.STRING(80), allowNull: true },
  name_ar: { type: DataTypes.STRING(80), allowNull: true },
  type: { type: DataTypes.ENUM('radio', 'checkbox'), defaultValue: 'radio' },
  min_select: { type: DataTypes.TINYINT, defaultValue: 0 },
  max_select: { type: DataTypes.TINYINT, defaultValue: 1 },
  is_required: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'supplement_groups',
  timestamps: true,
  underscored: true,
});

module.exports = SupplementGroup;
