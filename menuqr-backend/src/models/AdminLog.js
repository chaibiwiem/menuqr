const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AdminLog = sequelize.define('AdminLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  admin_id: { type: DataTypes.UUID, allowNull: false },
  action: { type: DataTypes.STRING(100), allowNull: false },
  target_type: { type: DataTypes.STRING(50), allowNull: true },
  target_id: { type: DataTypes.UUID, allowNull: true },
  details: { type: DataTypes.JSON, allowNull: true },
  created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, {
  tableName: 'admin_logs',
  timestamps: false,
  underscored: true,
});

module.exports = AdminLog;
