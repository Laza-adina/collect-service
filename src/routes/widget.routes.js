// src/routes/widget.routes.js
const router = require('express').Router();
const ctrl = require('../controllers/widget.controller');
const { authenticate, authenticateWidget } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const {
  validateCreateWidget,
  validateUpdateWidgetItems,
} = require('../validators/widget.validator');

// Routes agence (privées)
router.post('/', authenticate, requireRole('AGENCY'), validateCreateWidget, ctrl.createWidget);
router.get('/', authenticate, requireRole('AGENCY'), ctrl.getWidgets);
router.get('/:id', authenticate, requireRole('AGENCY'), ctrl.getWidgetById);
router.patch('/:id', authenticate, requireRole('AGENCY'), ctrl.updateWidget);
router.delete('/:id', authenticate, requireRole('AGENCY'), ctrl.deleteWidget);
router.put('/:id/items', authenticate, requireRole('AGENCY'), validateUpdateWidgetItems, ctrl.updateWidgetItems);

// Route publique — embed e-commerce (?key=embedKey)
router.get('/embed/render', authenticateWidget, ctrl.getPublicWidget);

module.exports = router;