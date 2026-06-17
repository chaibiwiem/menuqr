require('dotenv').config();
const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('[DB] connected');

    const [rows] = await sequelize.query("SHOW TABLES LIKE 'menu_item_variants'");

    if (rows.length === 0) {
      await sequelize.query(`
        CREATE TABLE menu_item_variants (
          id           CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL PRIMARY KEY,
          menu_item_id CHAR(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
          label_fr     VARCHAR(80)   NOT NULL,
          label_en     VARCHAR(80)   NULL,
          label_it     VARCHAR(80)   NULL,
          label_ar     VARCHAR(80)   NULL,
          price        DECIMAL(10,3) NOT NULL DEFAULT 0.000,
          is_available TINYINT(1)    NOT NULL DEFAULT 1,
          sort_order   INTEGER       NOT NULL DEFAULT 0,
          created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          CONSTRAINT fk_miv_item FOREIGN KEY (menu_item_id)
            REFERENCES menu_items(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('[menu_item_variants] table créée ✓');
    } else {
      console.log('[menu_item_variants] table déjà existante — rien à faire');
    }

    console.log('[DONE] Migration variantes terminée');
    process.exit(0);
  } catch (e) {
    console.error('[ERROR]', e.message);
    process.exit(1);
  }
}

migrate();
