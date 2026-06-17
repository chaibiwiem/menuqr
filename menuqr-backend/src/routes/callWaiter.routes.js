const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { planGuard } = require('../middleware/planGuard');
const cw = require('../controllers/callWaiterController');

router.use(verifyToken);
router.use(planGuard('call_waiter'));

// stats before /:id
router.get('/stats',       checkRole('OWNER', 'MANAGER'), cw.getStats);
router.get('/',            checkRole('OWNER', 'MANAGER', 'STAFF', 'CASHIER'), cw.getCallWaiters);
router.put('/:id/resolve', checkRole('OWNER', 'MANAGER', 'STAFF', 'CASHIER'), cw.resolveCallWaiter);

module.exports = router;
