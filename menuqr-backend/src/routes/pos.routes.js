const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { planGuard } = require('../middleware/planGuard');
const pc = require('../controllers/posController');

router.use(verifyToken);
router.use(planGuard('pos_caisse'));

// ── Read-only: management + cashier + staff (view orders, table totals) ───────
const floorRoles = checkRole('OWNER', 'MANAGER', 'CASHIER', 'STAFF');

router.get('/menu',                   floorRoles, pc.getMenuForPOS);
router.get('/tables',                 floorRoles, pc.getAllTables);
router.get('/active-tables',          floorRoles, pc.getActiveTables);
router.get('/orders/:tableId',        floorRoles, pc.getTableOrder);

// ── Pré-addition ("demander l'addition") — staff peut aussi l'imprimer ────────
router.post('/print/pre-check/:orderId', floorRoles, pc.printPreCheck);

// ── Paiement & reçu final: cashier roles only (STAFF ne touche pas l'argent) ──
const cashierRoles = checkRole('OWNER', 'MANAGER', 'CASHIER');

router.post('/payments',                 cashierRoles, pc.processPayment);
router.post('/print/receipt/:paymentId', cashierRoles, pc.printReceipt);

// ── Service close: management only ────────────────────────────────────────────
const mgmtRoles = checkRole('OWNER', 'MANAGER');

router.get('/service-close',             mgmtRoles, pc.getServiceCloses);
router.post('/service-close',            mgmtRoles, pc.closeService);
router.get('/service-close/:id/report', mgmtRoles, pc.getServiceReport);

module.exports = router;
