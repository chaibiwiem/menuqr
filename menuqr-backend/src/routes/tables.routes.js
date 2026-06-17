const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const tc = require('../controllers/tableController');

router.use(verifyToken);

const ALL_FLOOR   = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'];
const MGMT        = ['OWNER', 'MANAGER'];

// ── Rooms — structural layout, OWNER/MANAGER only ─────────────────────────
router.get('/rooms',           checkRole(...ALL_FLOOR), tc.getRooms);
router.post('/rooms',          checkRole(...MGMT),      tc.createRoom);
router.put('/rooms/:id',       checkRole(...MGMT),      tc.updateRoom);
router.delete('/rooms/:id',    checkRole(...MGMT),      tc.deleteRoom);

// ── Call Waiter (must be before /:id routes) ──────────────────────────────
router.get('/calls',                 checkRole(...ALL_FLOOR), tc.getTableCalls);
router.put('/calls/:callId/resolve', checkRole(...ALL_FLOOR), tc.resolveCall);

// ── Merge / Transfer — operational, all floor roles ───────────────────────
router.post('/merge',          checkRole(...ALL_FLOOR), tc.mergeTables);
router.post('/:id/transfer',   checkRole(...ALL_FLOOR), tc.transferOrder);

// ── QR Export (before /:id) — OWNER/MANAGER only ──────────────────────────
router.get('/export-qr',       checkRole(...MGMT), tc.exportQRCodes);

// ── Table CRUD — add/edit/delete reserved to OWNER/MANAGER ────────────────
router.get('/',                checkRole(...ALL_FLOOR), tc.getTables);
router.post('/',               checkRole(...MGMT),      tc.createTable);
router.get('/:id',             checkRole(...ALL_FLOOR), tc.getTableById);
router.put('/:id',             checkRole(...MGMT),      tc.updateTable);
router.delete('/:id',          checkRole(...MGMT),      tc.deleteTable);

// ── Table actions ─────────────────────────────────────────────────────────
router.patch('/:id/position',  checkRole(...MGMT),       tc.updatePosition);
router.put('/:id/status',      checkRole(...ALL_FLOOR),  tc.updateStatus);
router.post('/:id/regenerate-qr', checkRole(...MGMT),    tc.regenerateQR);

module.exports = router;
