const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Room = sequelize.define('Room', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  restaurant_id: { type: DataTypes.UUID, allowNull: false },
  name: { type: DataTypes.STRING(60), allowNull: false },
  capacity: { type: DataTypes.SMALLINT, defaultValue: 0 },
  zone: {
    type: DataTypes.ENUM('SALLE', 'TERRASSE', 'ETAGE'),
    defaultValue: 'SALLE',
  },
  menu_id: { type: DataTypes.UUID, allowNull: true },
  sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: 'rooms', timestamps: true, underscored: true });

module.exports = Room;
