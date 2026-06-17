const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reservation = sequelize.define('Reservation', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  table_id: { type: DataTypes.UUID, allowNull: true },
  first_name: { type: DataTypes.STRING(80), allowNull: false },
  last_name: { type: DataTypes.STRING(80), allowNull: false },
  email: { type: DataTypes.STRING(191), allowNull: true },
  phone: { type: DataTypes.STRING(30), allowNull: false },
  reservation_date: { type: DataTypes.DATEONLY, allowNull: false },
  reservation_time: { type: DataTypes.TIME, allowNull: false },
  covers: { type: DataTypes.TINYINT, allowNull: false, defaultValue: 2 },
  zone: {
    type: DataTypes.ENUM('SALLE', 'TERRASSE', 'ETAGE'),
    allowNull: false,
    defaultValue: 'SALLE',
  },
  notes: { type: DataTypes.TEXT, allowNull: true },
  status: {
    type: DataTypes.ENUM(
      'EN_ATTENTE', 'CONFIRMEE', 'RAPPEL_ENVOYE', 'ARRIVEE', 'TERMINEE',
      'ANNULEE', 'ANNULEE_CLIENT', 'ANNULEE_RESTAURANT', 'NO_SHOW'
    ),
    defaultValue: 'EN_ATTENTE',
  },
  cancel_token: { type: DataTypes.STRING(255), allowNull: true, unique: true },
  cancel_reason: { type: DataTypes.TEXT, allowNull: true },
  confirmed_at: { type: DataTypes.DATE, allowNull: true },
  reminder_sent: { type: DataTypes.TINYINT, defaultValue: 0 },
}, {
  tableName: 'reservations',
  timestamps: true,
  underscored: true,
});

module.exports = Reservation;
