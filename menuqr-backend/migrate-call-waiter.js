require('dotenv').config();
const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('[DB] connected');

    // Add resolved_by column if missing
    await sequelize.query(`
      ALTER TABLE call_waiters
        ADD COLUMN IF NOT EXISTS resolved_by CHAR(36) NULL,
        ADD COLUMN IF NOT EXISTS resolved_at DATETIME NULL
    `);
    console.log('[call_waiters] resolved_by / resolved_at OK');

    // Ensure ENUM includes all three statuses
    await sequelize.query(`
      ALTER TABLE call_waiters
        MODIFY COLUMN status ENUM('PENDING', 'IN_PROGRESS', 'DONE') NOT NULL DEFAULT 'PENDING'
    `);
    console.log('[call_waiters] status ENUM OK');

    console.log('[DONE] Migration call-waiter complete');
    process.exit(0);
  } catch (e) {
    console.error('[ERROR]', e.message);
    process.exit(1);
  }
}

migrate();
