const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  type:          { type: DataTypes.STRING(60), allowNull: false },
  title:         { type: DataTypes.STRING(200), allowNull: false },
  body:          { type: DataTypes.TEXT, allowNull: true },
  reference_id:  { type: DataTypes.UUID, allowNull: true },
  is_read:       { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'notifications',
  timestamps: true,
  underscored: true,
});

module.exports = Notification;
