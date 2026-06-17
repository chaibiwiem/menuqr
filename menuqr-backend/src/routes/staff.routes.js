const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const { planGuard } = require('../middleware/planGuard');
const sc = require('../controllers/staffController');

router.use(verifyToken);
router.use(planGuard('staff_manage'));

router.get('/',                   checkRole('OWNER', 'MANAGER'), sc.getStaff);
router.post('/',                  checkRole('OWNER'), sc.createStaff);
router.put('/:id',                checkRole('OWNER'), sc.updateStaff);
router.post('/:id/reset-password',checkRole('OWNER'), sc.resetPassword);
router.delete('/:id',             checkRole('OWNER'), sc.deleteStaff);

module.exports = router;
