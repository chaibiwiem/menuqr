const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const nc = require('../controllers/notificationController');

router.use(verifyToken);

router.get('/settings',       checkRole('OWNER', 'MANAGER'), nc.getSettings);
router.put('/settings',       checkRole('OWNER', 'MANAGER'), nc.updateSettings);
router.put('/read-all',       nc.markAllRead);
router.get('/',               nc.getNotifications);
router.put('/:id/read',       nc.markAsRead);

module.exports = router;
