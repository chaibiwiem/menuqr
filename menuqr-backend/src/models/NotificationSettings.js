const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const NotificationSettings = sequelize.define('NotificationSettings', {
  id:                { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id:     { type: DataTypes.UUID, allowNull: false, unique: true },
  sound_new_order:   { type: DataTypes.BOOLEAN, defaultValue: true },
  sound_call_waiter: { type: DataTypes.BOOLEAN, defaultValue: true },
  sound_reservation: { type: DataTypes.BOOLEAN, defaultValue: true },
  email_new_order:   { type: DataTypes.BOOLEAN, defaultValue: false },
  email_reservation: { type: DataTypes.BOOLEAN, defaultValue: true },
  email_call_waiter: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  tableName: 'notification_settings',
  timestamps: true,
  underscored: true,
});

module.exports = NotificationSettings;
