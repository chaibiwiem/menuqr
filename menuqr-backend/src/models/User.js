const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING(30),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(30),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('SUPER_ADMIN', 'OWNER', 'MANAGER', 'STAFF', 'CASHIER'),
    allowNull: false,
  },
  restaurant_id: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  is_first_login: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  language: {
    type: DataTypes.ENUM('fr', 'en', 'it', 'ar'),
    defaultValue: 'fr',
  },
  two_fa_secret: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  two_fa_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    { unique: true, fields: ['username'], name: 'username' },
    { unique: true, fields: ['email'], name: 'email' },
  ],
});

module.exports = User;
