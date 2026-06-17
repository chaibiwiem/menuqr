require('dotenv').config();
const sequelize = require('./src/config/database');

async function migrate() {
  try {
    await sequelize.authenticate();
    console.log('[DB] connected');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id              CHAR(36)            NOT NULL PRIMARY KEY,
        order_id        CHAR(36)            NOT NULL,
        method          ENUM('CASH','CARD') NOT NULL,
        amount          DECIMAL(10,3)       NOT NULL,
        change_given    DECIMAL(10,3)       NOT NULL DEFAULT 0.000,
        discount_amount DECIMAL(10,3)       NOT NULL DEFAULT 0.000,
        discount_type   ENUM('PERCENT','FIXED') NULL,
        processed_by    CHAR(36)            NULL,
        processed_at    DATETIME            NULL,
        INDEX idx_payments_order_id (order_id),
        INDEX idx_payments_processed_by (processed_by)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('[payments] OK');

    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS service_closes (
        id            CHAR(36)      NOT NULL PRIMARY KEY,
        restaurant_id CHAR(36)      NOT NULL,
        date          DATE          NOT NULL,
        total_cash    DECIMAL(10,3) NOT NULL DEFAULT 0.000,
        total_card    DECIMAL(10,3) NOT NULL DEFAULT 0.000,
        total_orders  INT           NOT NULL DEFAULT 0,
        total_revenue DECIMAL(10,3) NOT NULL DEFAULT 0.000,
        notes         TEXT          NULL,
        closed_by     CHAR(36)      NULL,
        created_at    DATETIME      NULL,
        INDEX idx_service_closes_restaurant (restaurant_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('[service_closes] OK');

    console.log('[DONE] Migration POS complete');
    process.exit(0);
  } catch (e) {
    console.error('[ERROR]', e.message);
    process.exit(1);
  }
}

migrate();
