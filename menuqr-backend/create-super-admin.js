require('dotenv').config();
const bcrypt    = require('bcryptjs');
const sequelize = require('./src/config/database');

// ── Configure here ──────────────────────────
const EMAIL    = 'superadmin@menuqr.com';
const USERNAME = 'superadmin';
const PASSWORD = 'Admin@2026!';      // change after first login
const FULLNAME = 'Super Admin';
// ─────────────────────────────────────────────

async function run() {
  try {
    await sequelize.authenticate();
    console.log('[DB] connected');

    const [existing] = await sequelize.query(
      "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
      { replacements: [EMAIL, USERNAME] }
    );

    if (existing.length > 0) {
      console.log('[SKIP] Super Admin already exists (id:', existing[0].id, ')');
      process.exit(0);
    }

    const hash = await bcrypt.hash(PASSWORD, 12);

    const [result] = await sequelize.query(
      `INSERT INTO users (email, username, password_hash, full_name, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'SUPER_ADMIN', 1, NOW(), NOW())`,
      { replacements: [EMAIL, USERNAME, hash, FULLNAME] }
    );

    console.log('[OK] Super Admin created:');
    console.log('     Email    :', EMAIL);
    console.log('     Username :', USERNAME);
    console.log('     Password :', PASSWORD);
    console.log('     ID       :', result);
    console.log('\n  ⚠  Change the password after first login!');
    process.exit(0);
  } catch (err) {
    console.error('[ERROR]', err.message);
    process.exit(1);
  }
}

run();
