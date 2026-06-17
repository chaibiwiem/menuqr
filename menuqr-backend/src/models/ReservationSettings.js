const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ReservationSettings = sequelize.define('ReservationSettings', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false, unique: true },
  zones_enabled: {
    type: DataTypes.JSON,
    defaultValue: ['SALLE'],
  },
  capacity_salle: { type: DataTypes.SMALLINT, defaultValue: 50 },
  capacity_terrasse: { type: DataTypes.SMALLINT, defaultValue: 30 },
  capacity_etage: { type: DataTypes.SMALLINT, defaultValue: 20 },
  open_slots: {
    type: DataTypes.JSON,
    defaultValue: [
      { start: '12:00', end: '14:30' },
      { start: '19:00', end: '22:30' },
    ],
  },
  service_duration_min: { type: DataTypes.SMALLINT, defaultValue: 90 },
  min_hours_before: { type: DataTypes.TINYINT, defaultValue: 2 },
  max_days_ahead: { type: DataTypes.TINYINT, defaultValue: 30 },
  auto_confirm: { type: DataTypes.TINYINT, defaultValue: 0 },
  reminder_j1_enabled: { type: DataTypes.TINYINT, defaultValue: 1 },
  reminder_j1_channel: {
    type: DataTypes.ENUM('EMAIL', 'SMS', 'BOTH'),
    defaultValue: 'EMAIL',
  },
  reminder_h2_enabled: { type: DataTypes.TINYINT, defaultValue: 0 },
  reminder_h2_channel: {
    type: DataTypes.ENUM('SMS', 'WHATSAPP'),
    defaultValue: 'SMS',
  },
  confirmation_message_fr: { type: DataTypes.TEXT, allowNull: true },
  confirmation_message_en: { type: DataTypes.TEXT, allowNull: true },
  confirmation_message_it: { type: DataTypes.TEXT, allowNull: true },
  confirmation_message_ar: { type: DataTypes.TEXT, allowNull: true },
  cancellation_policy: { type: DataTypes.TEXT, allowNull: true },
  is_active: { type: DataTypes.TINYINT, defaultValue: 1 },
}, {
  tableName: 'reservation_settings',
  timestamps: true,
  underscored: true,
});

module.exports = ReservationSettings;
