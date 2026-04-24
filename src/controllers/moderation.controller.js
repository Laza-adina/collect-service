// src/controllers/moderation.controller.js
const moderationService = require('../services/moderation.service');

const getPendingAssets = async (req, res) => {
  try {
    const assets = await moderationService.getPendingAssets(req.user.id, req.query.brandId);
    return res.status(200).json({ success: true, data: { assets } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const moderateAsset = async (req, res) => {
  try {
    const asset = await moderationService.moderateAsset(
      req.params.id, req.user.id, req.body
    );
    return res.status(200).json({ success: true, data: { asset } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const bulkModerate = async (req, res) => {
  try {
    const result = await moderationService.bulkModerate(
      req.user.id, req.body.assetIds, req.body.status
    );
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getPendingReviews = async (req, res) => {
  try {
    const reviews = await moderationService.getPendingReviews(req.user.id);
    return res.status(200).json({ success: true, data: { reviews } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const moderateReview = async (req, res) => {
  try {
    const review = await moderationService.moderateReview(
      req.params.reviewId, req.user.id, req.body.status
    );
    return res.status(200).json({ success: true, data: { review } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = { getPendingAssets, moderateAsset, bulkModerate, getPendingReviews, moderateReview };