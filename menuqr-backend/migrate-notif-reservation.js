require('dotenv').config();
const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('[DB] connected');

    const [rows] = await sequelize.query("SHOW COLUMNS FROM notification_settings LIKE 'sound_reservation'");

    if (rows.length === 0) {
      await sequelize.query(`
        ALTER TABLE notification_settings
          ADD COLUMN sound_reservation TINYINT(1) NOT NULL DEFAULT 1 AFTER sound_call_waiter
      `);
      console.log('[notification_settings] colonne sound_reservation ajoutée ✓');
    } else {
      console.log('[notification_settings] sound_reservation déjà existante — rien à faire');
    }

    console.log('[DONE] Migration notification réservation terminée');
    process.exit(0);
  } catch (e) {
    console.error('[ERROR]', e.message);
    process.exit(1);
  }
}

migrate();
