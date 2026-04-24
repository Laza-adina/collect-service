// src/validators/ugc.validator.js
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

const addUgcAssetSchema = Joi.object({
  brandId: Joi.string().uuid().required(),
  campaignId: Joi.string().uuid().optional(),
  creatorUserId: Joi.string().uuid().optional(),
  source: Joi.string()
    .valid('CAMPAIGN', 'HASHTAG', 'MENTION', 'REVIEW_REQUEST', 'MANUAL')
    .required(),
  mediaType: Joi.string()
    .valid('VIDEO', 'PHOTO', 'CAROUSEL', 'TESTIMONIAL_VIDEO', 'TEXT_REVIEW')
    .required(),
  url: Joi.string().uri().required(),
  thumbnail: Joi.string().uri().optional(),
  caption: Joi.string().max(2200).optional(),
  authorHandle: Joi.string().max(100).optional(),
  platform: Joi.string()
    .valid('INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'TWITTER', 'PINTEREST', 'LINKEDIN')
    .optional(),
  originalPostUrl: Joi.string().uri().optional(),
  productTags: Joi.array().items(
    Joi.object({
      productId: Joi.string().uuid().required(),
      productName: Joi.string().required(),
      productUrl: Joi.string().uri().optional(),
      imageUrl: Joi.string().uri().optional(),
      price: Joi.number().positive().optional(),
      posX: Joi.number().min(0).max(100).optional(),
      posY: Joi.number().min(0).max(100).optional(),
    })
  ).optional(),
});

const updateProductTagsSchema = Joi.object({
  productTags: Joi.array().items(
    Joi.object({
      productId: Joi.string().uuid().required(),
      productName: Joi.string().required(),
      productUrl: Joi.string().uri().optional(),
      imageUrl: Joi.string().uri().optional(),
      price: Joi.number().positive().optional(),
      posX: Joi.number().min(0).max(100).optional(),
      posY: Joi.number().min(0).max(100).optional(),
    })
  ).min(1).required(),
});

module.exports = {
  validateAddUgcAsset: validate(addUgcAssetSchema),
  validateUpdateProductTags: validate(updateProductTagsSchema),
};