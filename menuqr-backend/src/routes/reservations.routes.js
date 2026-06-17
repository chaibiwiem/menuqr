const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { planGuard } = require('../middleware/planGuard');
const rc = require('../controllers/reservationController');

const ALL_FLOOR    = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'];
const MGMT         = ['OWNER', 'MANAGER'];

router.use(verifyToken);
router.use(checkRole(...ALL_FLOOR));
router.use(planGuard('reservations'));

// Paramètres — MGMT seulement
router.get('/settings',         checkRole(...MGMT), rc.getSettings);
router.put('/settings',         checkRole(...MGMT), rc.updateSettings);

// Lecture — tous floor (STAFF + CASHIER inclus)
router.get('/tables',           rc.getAvailableTables);
router.get('/today',            rc.getTodayReservations);
router.get('/',                 rc.getReservations);

// Création — tous floor (STAFF + CASHIER inclus)
router.post('/',                checkRole(...ALL_FLOOR), rc.createReservation);

// Statut — tous floor (STAFF/CASHIER limités à ARRIVEE/NO_SHOW/TERMINEE, vérifié dans le contrôleur)
router.put('/:id/status',       checkRole(...ALL_FLOOR), rc.updateStatus);

// Assignation table — reste ouvert à tous les floor roles
router.put('/:id/assign-table', checkRole(...ALL_FLOOR), rc.assignTable);

// Modification des champs ("modifier") — MGMT seulement (STAFF/CASHIER exclus)
router.put('/:id',              checkRole(...MGMT), rc.updateReservation);

// Suppression ("annulation" définitive) — MGMT seulement
router.delete('/:id',           checkRole(...MGMT), rc.deleteReservation);

module.exports = router;
