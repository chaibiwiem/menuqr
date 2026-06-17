const router = require('express').Router();
const { verifyToken, checkRole } = require('../middleware/auth');
const upload = require('../middleware/upload');
const sc = require('../controllers/settingsController');

router.use(verifyToken);
router.use(checkRole('OWNER', 'MANAGER'));

router.get('/',          sc.getSettings);
router.put('/',          sc.updateSettings);
router.put('/images',    upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'banner', maxCount: 1 }]), sc.updateImages);
router.put('/horaires',  sc.updateHoraires);

module.exports = router;
