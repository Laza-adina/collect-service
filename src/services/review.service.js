// src/services/review.service.js
const { prisma } = require('../config/database');

const createReviewRequest = async (agencyUserId, data) => {
  const expiresAt = data.expiresAt
    ? new Date(data.expiresAt)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30j par défaut

  return prisma.reviewRequest.create({
    data: {
      ...data,
      agencyUserId,
      expiresAt,
    },
  });
};

const getReviewRequests = async (agencyUserId, filters = {}) => {
  const { brandId, status } = filters;
  const where = { agencyUserId };
  if (brandId) where.brandId = brandId;
  if (status) where.status = status;

  return prisma.reviewRequest.findMany({
    where,
    include: { review: true },
    orderBy: { createdAt: 'desc' },
  });
};

// Appelé par le client final depuis le lien email (sans auth JWT)
const submitReviewByToken = async (token, data) => {
  const request = await prisma.reviewRequest.findUnique({
    where: { token },
  });
  if (!request) throw { status: 404, message: 'Demande d\'avis introuvable' };
  if (request.status === 'COMPLETED') {
    throw { status: 400, message: 'Avis déjà soumis' };
  }
  if (request.expiresAt && new Date() > request.expiresAt) {
    await prisma.reviewRequest.update({ where: { token }, data: { status: 'EXPIRED' } });
    throw { status: 410, message: 'Ce lien d\'avis a expiré' };
  }

  // Créer l'avis
  const review = await prisma.customerReview.create({
    data: {
      reviewRequestId: request.id,
      rating: data.rating,
      comment: data.comment,
      mediaUrl: data.mediaUrl,
      mediaType: data.mediaType,
    },
  });

  // Marquer la demande comme complétée
  await prisma.reviewRequest.update({
    where: { token },
    data: { status: 'COMPLETED', completedAt: new Date() },
  });

  return review;
};

const getPublishedReviews = async (brandId, productId) => {
  const where = {
    isPublished: true,
    moderationStatus: 'APPROVED',
    request: { brandId },
  };
  if (productId) where.request.productId = productId;

  return prisma.customerReview.findMany({
    where,
    include: {
      request: {
        select: { customerName: true, productName: true, productId: true },
      },
    },
    orderBy: { publishedAt: 'desc' },
  });
};

const markAsSent = async (requestId, agencyUserId) => {
  const request = await prisma.reviewRequest.findFirst({
    where: { id: requestId, agencyUserId },
  });
  if (!request) throw { status: 404, message: 'Demande introuvable' };

  return prisma.reviewRequest.update({
    where: { id: requestId },
    data: { status: 'SENT', sentAt: new Date() },
  });
};

module.exports = {
  createReviewRequest,
  getReviewRequests,
  submitReviewByToken,
  getPublishedReviews,
  markAsSent,
};