// src/validators/review.validator.js
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

const createReviewRequestSchema = Joi.object({
  brandId: Joi.string().uuid().required(),
  customerEmail: Joi.string().email().required(),
  customerName: Joi.string().max(100).optional(),
  orderId: Joi.string().optional(),
  productId: Joi.string().uuid().optional(),
  productName: Joi.string().required(),
  expiresAt: Joi.date().iso().optional(),
});

const submitReviewSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  comment: Joi.string().max(2000).optional(),
  mediaUrl: Joi.string().uri().optional(),
  mediaType: Joi.string()
    .valid('VIDEO', 'PHOTO', 'TESTIMONIAL_VIDEO', 'TEXT_REVIEW')
    .optional(),
});

module.exports = {
  validateCreateReviewRequest: validate(createReviewRequestSchema),
  validateSubmitReview: validate(submitReviewSchema),
};