require('dotenv').config();
const sequelize = require('./config/database');
require('./models'); // charge tous les modèles + associations
const { httpServer } = require('./app');

const PORT = parseInt(process.env.PORT) || 3001;

async function start() {
  try {
    await sequelize.authenticate();
    console.log('[DB] MySQL connecté —', process.env.DB_NAME);

    try {
      await sequelize.sync({ alter: true });
      console.log('[DB] Modèles synchronisés');
    } catch (syncErr) {
      // "Too many keys" on users table is non-fatal — columns still get added
      console.warn('[DB] sync() avertissement (ignoré):', syncErr.message);
    }

    httpServer.listen(PORT, () => {
      console.log(`[SERVER] MenuQR backend — http://localhost:${PORT}`);
      console.log(`[ENV] ${process.env.NODE_ENV}`);
    });

    // Start cron jobs
    require('./jobs/cron');
  } catch (err) {
    console.error('[FATAL] Impossible de démarrer :', err.message);
    process.exit(1);
  }
}

start();
