// src/routes/review.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/review.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const {
  validateCreateReviewRequest,
  validateSubmitReview,
} = require('../validators/review.validator');

// Routes agence
router.post('/', authenticate, requireRole('AGENCY'), validateCreateReviewRequest, ctrl.createReviewRequest);
router.get('/', authenticate, requireRole('AGENCY'), ctrl.getReviewRequests);
router.patch('/:id/sent', authenticate, requireRole('AGENCY'), ctrl.markAsSent);

// Route publique — client final (lien email)
router.post('/submit/:token', validateSubmitReview, ctrl.submitReviewByToken);

// Route publique — affichage sur e-commerce
router.get('/published', ctrl.getPublishedReviews);

module.exports = router;