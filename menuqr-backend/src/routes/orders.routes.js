const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const ALL_FLOOR = ['OWNER', 'MANAGER', 'STAFF', 'CASHIER'];
const MGMT      = ['OWNER', 'MANAGER'];

// Voir les commandes — tous les rôles floor
router.get('/orders',          verifyToken, orderController.getOrders);
router.get('/orders/:id',      verifyToken, orderController.getOrderById);

// Passer une commande + accepter/changer statut — CASHIER inclus
router.post('/orders',         verifyToken, checkRole(...ALL_FLOOR), orderController.createOrder);
router.put('/orders/:id/status', verifyToken, checkRole(...ALL_FLOOR), orderController.updateOrderStatus);

// Annuler une commande — MGMT seulement
router.put('/orders/:id/cancel', verifyToken, checkRole(...MGMT), orderController.cancelOrder);

// Impression
router.post('/orders/:id/print', verifyToken, orderController.printOrder);

module.exports = router;
