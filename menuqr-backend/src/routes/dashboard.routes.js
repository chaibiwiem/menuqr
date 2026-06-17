const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

router.use(verifyToken, checkRole('OWNER', 'MANAGER', 'STAFF', 'CASHIER'));

router.get('/stats',          dashboardController.getStats);
router.get('/orders-live',    dashboardController.getOrdersLive);
router.get('/tables-status',  dashboardController.getTablesStatus);
router.get('/top-dishes',     dashboardController.getTopDishes);
router.get('/qr-scans',       dashboardController.getQRScans);
router.get('/revenue-chart',  dashboardController.getRevenueChart);

module.exports = router;
