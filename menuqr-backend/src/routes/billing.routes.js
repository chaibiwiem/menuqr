const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const bc = require('../controllers/billingController');

router.use(verifyToken);
router.use(checkRole('OWNER'));

router.get('/plan',                  bc.getCurrentPlan);
router.get('/invoices',              bc.getInvoices);
router.get('/invoices/:id/download', bc.downloadInvoice);

module.exports = router;
