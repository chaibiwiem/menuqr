const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RestaurantHoraire = sequelize.define('RestaurantHoraire', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  day_of_week: { type: DataTypes.TINYINT, allowNull: false }, // 0=dim, 1=lun ... 6=sam
  open_time: { type: DataTypes.TIME, allowNull: true },
  close_time: { type: DataTypes.TIME, allowNull: true },
  is_closed: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'restaurant_horaires',
  timestamps: true,
  underscored: true,
});

module.exports = RestaurantHoraire;
