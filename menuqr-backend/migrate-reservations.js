require('dotenv').config();
const sequelize = require('./src/config/database');

async function migrate() {
  const q = (sql) => sequelize.query(sql);

  console.log('Connecting...');
  await sequelize.authenticate();
  console.log('Connected.');

  // Add missing columns to reservations (ignore "Duplicate column" errors)
  const cols = [
    "ALTER TABLE reservations ADD COLUMN cancel_token VARCHAR(255) NULL UNIQUE",
    "ALTER TABLE reservations ADD COLUMN cancel_reason TEXT NULL",
    "ALTER TABLE reservations ADD COLUMN confirmed_at DATETIME NULL",
    "ALTER TABLE reservations ADD COLUMN reminder_sent TINYINT DEFAULT 0",
  ];

  for (const sql of cols) {
    try {
      await q(sql);
      console.log('OK:', sql.substring(0, 60));
    } catch (e) {
      if (e.original?.code === 'ER_DUP_FIELDNAME') {
        console.log('SKIP (already exists):', sql.substring(0, 60));
      } else {
        console.error('ERROR:', e.original?.sqlMessage || e.message);
      }
    }
  }

  // Extend status ENUM
  const enumSql = `ALTER TABLE reservations MODIFY COLUMN status ENUM(
    'EN_ATTENTE','CONFIRMEE','RAPPEL_ENVOYE','ARRIVEE','TERMINEE',
    'ANNULEE','ANNULEE_CLIENT','ANNULEE_RESTAURANT','NO_SHOW'
  ) DEFAULT 'EN_ATTENTE'`;
  try {
    await q(enumSql);
    console.log('OK: ENUM extended');
  } catch (e) {
    console.error('ENUM ERROR:', e.original?.sqlMessage || e.message);
  }

  // Create reservation_settings table if not exists
  try {
    await q(`CREATE TABLE IF NOT EXISTS reservation_settings (
      id CHAR(36) NOT NULL PRIMARY KEY,
      restaurant_id CHAR(36) NOT NULL UNIQUE,
      zones_enabled JSON,
      capacity_salle SMALLINT DEFAULT 50,
      capacity_terrasse SMALLINT DEFAULT 30,
      capacity_etage SMALLINT DEFAULT 20,
      open_slots JSON,
      service_duration_min SMALLINT DEFAULT 90,
      min_hours_before TINYINT DEFAULT 2,
      max_days_ahead TINYINT DEFAULT 30,
      auto_confirm TINYINT DEFAULT 0,
      reminder_j1_enabled TINYINT DEFAULT 1,
      reminder_j1_channel ENUM('EMAIL','SMS','BOTH') DEFAULT 'EMAIL',
      reminder_h2_enabled TINYINT DEFAULT 0,
      reminder_h2_channel ENUM('SMS','WHATSAPP') DEFAULT 'SMS',
      is_active TINYINT DEFAULT 1,
      created_at DATETIME NOT NULL,
      updated_at DATETIME NOT NULL
    )`);
    console.log('OK: reservation_settings table ready');
  } catch (e) {
    console.error('TABLE ERROR:', e.original?.sqlMessage || e.message);
  }

  console.log('Migration done.');
  process.exit(0);
}

migrate().catch((e) => { console.error('FATAL:', e.message); process.exit(1); });
