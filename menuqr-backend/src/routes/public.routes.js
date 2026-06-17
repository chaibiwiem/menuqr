const { Router } = require('express');
const pc = require('../controllers/publicController');

const router = Router();

// Restaurant info
router.get('/public/:slug', pc.getRestaurantInfo);

// Table verification
router.get('/public/:slug/table/:qr_token', pc.verifyTable);

// Menu (active only, with supplements)
router.get('/public/:slug/menu', pc.getMenu);

// Orders
router.post('/public/:slug/orders', pc.createOrder);
router.get('/public/orders/:id', pc.trackOrder);

// Call Waiter
router.post('/public/:slug/call-waiter', pc.createCallWaiter);

// Reservations
router.get('/public/:slug/reservations/slots', pc.getReservationSlots);
router.post('/public/:slug/reservations', pc.createReservation);
router.get('/public/reservations/cancel', pc.cancelViaToken);

module.exports = router;
