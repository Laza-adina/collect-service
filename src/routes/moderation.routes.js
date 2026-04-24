// src/routes/moderation.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/moderation.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');

router.get('/assets/pending', authenticate, requireRole('AGENCY'), ctrl.getPendingAssets);
router.patch('/assets/:id', authenticate, requireRole('AGENCY'), ctrl.moderateAsset);
router.post('/assets/bulk', authenticate, requireRole('AGENCY'), ctrl.bulkModerate);

router.get('/reviews/pending', authenticate, requireRole('AGENCY'), ctrl.getPendingReviews);
router.patch('/reviews/:reviewId', authenticate, requireRole('AGENCY'), ctrl.moderateReview);

module.exports = router;