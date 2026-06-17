const router = require('express').Router();
const { verifyToken } = require('../middleware/auth');
const { checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const adminController = require('../controllers/adminController');

// Sans auth — vérif live
router.get('/check-username', adminController.checkUsername);
router.get('/check-slug', adminController.checkSlug);

// Toutes les routes suivantes nécessitent SUPER_ADMIN
router.use(verifyToken, checkRole('SUPER_ADMIN'));

router.get('/stats', adminController.getStats);
router.get('/restaurants', adminController.getRestaurants);
router.post(
  '/restaurants',
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]),
  adminController.createRestaurant
);
router.get('/restaurants/:id', adminController.getRestaurantById);
router.put(
  '/restaurants/:id',
  upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]),
  adminController.updateRestaurant
);
router.put('/restaurants/:id/toggle', adminController.toggleRestaurant);
router.delete('/restaurants/:id', adminController.deleteRestaurant);
router.post('/restaurants/:id/reset-password', adminController.resetOwnerPassword);

// ── Billing — Abonnements & Factures ─────────────────────────────────────────
router.get('/subscriptions',       adminController.getSubscriptions);
router.put('/subscriptions/:id',   adminController.updateSubscription);

router.get('/invoices',                adminController.getAdminInvoices);
router.post('/invoices',               adminController.createInvoice);
router.get('/invoices/:id/download',   adminController.downloadAdminInvoice);
router.put('/invoices/:id',            adminController.updateInvoice);
router.delete('/invoices/:id',         adminController.deleteInvoice);

// ── Users ────────────────────────────────────────────────────────────────────
router.get('/users',                        adminController.getUsers);
router.put('/users/:id/toggle',             adminController.toggleUser);
router.post('/users/:id/reset-password',    adminController.resetUserPassword);
router.put('/users/:id/change-password',    adminController.changeUserPassword);
router.patch('/users/:id/restaurant',       adminController.fixUserRestaurant);

// ── Super Admins ──────────────────────────────────────────────────────────────
router.post('/super-admins',               adminController.createSuperAdmin);

// ── QR Manager ───────────────────────────────────────────────────────────────
router.get('/qr-tables', adminController.getQRTables);

// ── Admin Profile ─────────────────────────────────────────────────────────────
router.get('/profile',           adminController.getAdminProfile);
router.put('/profile',           adminController.updateAdminProfile);
router.put('/profile/password',  adminController.updateAdminPassword);

// ── Plans Management ──────────────────────────────────────────────────────────
router.get('/plans',          adminController.getPlans);
router.put('/plans/:name',    adminController.updatePlan);

module.exports = router;
