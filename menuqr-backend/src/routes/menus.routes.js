const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const mc = require('../controllers/menuController');

// NOTE: this router is mounted at the generic '/api' prefix in app.js (shared
// with orders.routes etc). A path-less router.use() here would run for EVERY
// '/api/*' request — including /orders, /tables, /reservations — before they
// even reach their own router. So auth/role checks MUST be applied per-route,
// not as a blanket router.use().
router.use(verifyToken);
const mgmtOnly = checkRole('OWNER', 'MANAGER');

// ─── Menus ────────────────────────────────────────────────────────────────────
router.get('/menus',         mgmtOnly, mc.getMenus);
router.post('/menus',        mgmtOnly, mc.createMenu);
router.get('/menus/:id',     mgmtOnly, mc.getMenu);
router.put('/menus/:id',     mgmtOnly, mc.updateMenu);
router.delete('/menus/:id',  mgmtOnly, mc.deleteMenu);

// ─── Categories — nested under menu ──────────────────────────────────────────
router.get('/menus/:menuId/categories',  mgmtOnly, mc.getCategories);
router.post('/menus/:menuId/categories', mgmtOnly, mc.createCategory);

// ─── Categories — standalone (reorder BEFORE /:id) ───────────────────────────
router.put('/categories/reorder',  mgmtOnly, mc.reorderCategories);
router.put('/categories/:id',      mgmtOnly, mc.updateCategory);
router.delete('/categories/:id',   mgmtOnly, mc.deleteCategory);

// ─── Items — nested under category ───────────────────────────────────────────
router.get('/categories/:id/items',  mgmtOnly, mc.getItems);
router.post('/categories/:id/items', mgmtOnly, mc.createItem);

// ─── Items — standalone (bulk-status and reorder BEFORE /:id) ────────────────
router.put('/items/bulk-status', mgmtOnly, mc.bulkUpdateStatus);
router.put('/items/reorder',     mgmtOnly, mc.reorderItems);
router.get('/items/:id',         mgmtOnly, mc.getItem);
router.put('/items/:id',         mgmtOnly, mc.updateItem);
router.delete('/items/:id',      mgmtOnly, mc.deleteItem);
router.patch('/items/:id/toggle',      mgmtOnly, mc.toggleItemAvailability);
router.post('/items/upload-image',     mgmtOnly, upload.single('image'), mc.uploadTempImage);
router.post('/items/:id/image',        mgmtOnly, upload.single('image'), mc.uploadItemImage);

// ─── Item Variants ────────────────────────────────────────────────────────────
router.get('/items/:id/variants',   mgmtOnly, mc.getVariants);
router.post('/items/:id/variants',  mgmtOnly, mc.createVariant);
router.put('/variants/:id',         mgmtOnly, mc.updateVariant);
router.delete('/variants/:id',      mgmtOnly, mc.deleteVariant);

// ─── Supplement Groups ────────────────────────────────────────────────────────
router.get('/items/:id/supplement-groups',   mgmtOnly, mc.getSupplementGroups);
router.post('/items/:id/supplement-groups',  mgmtOnly, mc.createSupplementGroup);
router.put('/supplement-groups/:id',         mgmtOnly, mc.updateSupplementGroup);
router.delete('/supplement-groups/:id',      mgmtOnly, mc.deleteSupplementGroup);

// ─── Supplement Options ───────────────────────────────────────────────────────
router.get('/supplement-groups/:id/options',   mgmtOnly, mc.getSupplementOptions);
router.post('/supplement-groups/:id/options',  mgmtOnly, mc.createSupplementOption);
router.put('/supplement-options/:id',          mgmtOnly, mc.updateSupplementOption);
router.delete('/supplement-options/:id',       mgmtOnly, mc.deleteSupplementOption);

module.exports = router;
