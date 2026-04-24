// src/routes/ugc.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/ugc.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { validateAddUgcAsset, validateUpdateProductTags } = require('../validators/ugc.validator');

router.post('/', authenticate, requireRole('AGENCY'), validateAddUgcAsset, ctrl.addUgcAsset);
router.get('/', authenticate, requireRole('AGENCY'), ctrl.getUgcAssets);
router.get('/:id', authenticate, requireRole('AGENCY'), ctrl.getUgcAssetById);
router.delete('/:id', authenticate, requireRole('AGENCY'), ctrl.deleteUgcAsset);
router.put('/:id/tags', authenticate, requireRole('AGENCY'), validateUpdateProductTags, ctrl.updateProductTags);

module.exports = router;