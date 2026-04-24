// src/controllers/review.controller.js
const reviewService = require('../services/review.service');

const createReviewRequest = async (req, res) => {
  try {
    const request = await reviewService.createReviewRequest(req.user.id, req.body);
    return res.status(201).json({ success: true, data: { request } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getReviewRequests = async (req, res) => {
  try {
    const requests = await reviewService.getReviewRequests(req.user.id, req.query);
    return res.status(200).json({ success: true, data: { requests } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// Route publique — client final soumet son avis via token email
const submitReviewByToken = async (req, res) => {
  try {
    const review = await reviewService.submitReviewByToken(req.params.token, req.body);
    return res.status(201).json({
      success: true,
      message: 'Merci pour votre avis !',
      data: { review },
    });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getPublishedReviews = async (req, res) => {
  try {
    const reviews = await reviewService.getPublishedReviews(
      req.query.brandId, req.query.productId
    );
    return res.status(200).json({ success: true, data: { reviews } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const markAsSent = async (req, res) => {
  try {
    const request = await reviewService.markAsSent(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: { request } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createReviewRequest,
  getReviewRequests,
  submitReviewByToken,
  getPublishedReviews,
  markAsSent,
};