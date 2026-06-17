const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { planGuard } = require('../middleware/planGuard');
const ac = require('../controllers/analyticsController');

router.use(verifyToken);
router.use(checkRole('OWNER', 'MANAGER'));
router.use(planGuard('analytics'));

router.get('/kpis',           ac.getKPIs);
router.get('/revenue-chart',  ac.getRevenueChart);
router.get('/top-dishes',     ac.getTopDishes);
router.get('/orders-by-hour', ac.getOrdersByHour);
router.get('/by-category',    ac.getByCategory);
router.get('/staff',          ac.getStaffPerformance);
router.get('/reservations',      ac.getReservationStats);
router.get('/reservations-list', ac.getReservationsList);
router.get('/payments',          ac.getPaymentStats);
router.get('/export/csv',        ac.exportCSV);

module.exports = router;
