// src/validators/widget.validator.js
const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(422).json({
      success: false,
      message: 'Validation échouée',
      errors: error.details.map((d) => ({ field: d.path.join('.'), message: d.message })),
    });
  }
  next();
};

const createWidgetSchema = Joi.object({
  brandId: Joi.string().uuid().required(),
  name: Joi.string().min(2).max(100).required(),
  slug: Joi.string().min(2).max(100).lowercase()
    .pattern(/^[a-z0-9-]+$/).required(),
  layout: Joi.string()
    .valid('GRID', 'MASONRY', 'CAROUSEL', 'SHOP_THE_LOOK')
    .optional(),
  title: Joi.string().max(200).optional(),
  description: Joi.string().max(500).optional(),
  autoFilter: Joi.object({
    platform: Joi.string().optional(),
    mediaType: Joi.string().optional(),
    productId: Joi.string().uuid().optional(),
    source: Joi.string().optional(),
  }).optional(),
  maxItems: Joi.number().integer().min(1).max(50).optional(),
  primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).optional(),
  showCaption: Joi.boolean().optional(),
  showHandle: Joi.boolean().optional(),
  showBuyButton: Joi.boolean().optional(),
});

const updateWidgetItemsSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      ugcAssetId: Joi.string().uuid().required(),
      position: Joi.number().integer().min(0).required(),
    })
  ).min(1).required(),
});

module.exports = {
  validateCreateWidget: validate(createWidgetSchema),
  validateUpdateWidgetItems: validate(updateWidgetItemsSchema),
};