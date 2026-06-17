const router = require('express').Router();
const { authLimiter } = require('../middleware/rateLimiter');
const { verifyToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.post('/login',           authLimiter, authController.login);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password',  authController.resetPassword);
router.put('/change-password',  verifyToken, authController.changePassword);
router.get('/me',               verifyToken, authController.me);

module.exports = router;
