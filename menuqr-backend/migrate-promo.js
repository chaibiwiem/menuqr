require('dotenv').config();
const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('[DB] connected');

    // Check existing columns
    const [rows] = await sequelize.query("SHOW COLUMNS FROM menu_items LIKE 'promo_price'");

    if (rows.length === 0) {
      await sequelize.query(`
        ALTER TABLE menu_items
          ADD COLUMN promo_price DECIMAL(10,3) NULL AFTER enable_at,
          ADD COLUMN promo_label VARCHAR(50)   NULL AFTER promo_price,
          ADD COLUMN promo_start DATE          NULL AFTER promo_label,
          ADD COLUMN promo_end   DATE          NULL AFTER promo_start
      `);
      console.log('[menu_items] colonnes promo_price, promo_label, promo_start, promo_end ajoutées ✓');
    } else {
      console.log('[menu_items] colonnes promo déjà existantes — rien à faire');
    }

    console.log('[DONE] Migration promo terminée');
    process.exit(0);
  } catch (e) {
    console.error('[ERROR]', e.message);
    process.exit(1);
  }
}

migrate();
