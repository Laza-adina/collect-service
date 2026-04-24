// src/services/moderation.service.js
const { prisma } = require('../config/database');

const getPendingAssets = async (agencyUserId, brandId) => {
  const where = {
    agencyUserId,
    moderationStatus: 'PENDING',
    isActive: true,
  };
  if (brandId) where.brandId = brandId;

  return prisma.ugcAsset.findMany({
    where,
    include: { productTags: true },
    orderBy: { createdAt: 'asc' },
  });
};

const moderateAsset = async (id, agencyUserId, data) => {
  const { status, rejectionReason } = data;

  const asset = await prisma.ugcAsset.findFirst({ where: { id, agencyUserId } });
  if (!asset) throw { status: 404, message: 'Asset introuvable' };

  if (!['APPROVED', 'REJECTED', 'FLAGGED'].includes(status)) {
    throw { status: 400, message: 'Statut invalide' };
  }

  return prisma.ugcAsset.update({
    where: { id },
    data: {
      moderationStatus: status,
      moderatedBy: agencyUserId,
      moderatedAt: new Date(),
      rejectionReason: status === 'REJECTED' ? (rejectionReason || null) : null,
    },
  });
};

const bulkModerate = async (agencyUserId, assetIds, status) => {
  if (!['APPROVED', 'REJECTED'].includes(status)) {
    throw { status: 400, message: 'Statut de modération invalide' };
  }

  // Vérifier que tous les assets appartiennent à cette agence
  const count = await prisma.ugcAsset.count({
    where: { id: { in: assetIds }, agencyUserId },
  });
  if (count !== assetIds.length) {
    throw { status: 403, message: 'Accès refusé sur certains assets' };
  }

  await prisma.ugcAsset.updateMany({
    where: { id: { in: assetIds } },
    data: {
      moderationStatus: status,
      moderatedBy: agencyUserId,
      moderatedAt: new Date(),
    },
  });

  return { updated: assetIds.length };
};

const getPendingReviews = async (agencyUserId) => {
  return prisma.customerReview.findMany({
    where: {
      moderationStatus: 'PENDING',
      request: { agencyUserId },
    },
    include: { request: true },
    orderBy: { createdAt: 'asc' },
  });
};

const moderateReview = async (reviewId, agencyUserId, status) => {
  const review = await prisma.customerReview.findFirst({
    where: { id: reviewId },
    include: { request: true },
  });
  if (!review) throw { status: 404, message: 'Avis introuvable' };
  if (review.request.agencyUserId !== agencyUserId) {
    throw { status: 403, message: 'Accès refusé' };
  }

  return prisma.customerReview.update({
    where: { id: reviewId },
    data: {
      moderationStatus: status,
      isPublished: status === 'APPROVED',
      publishedAt: status === 'APPROVED' ? new Date() : null,
    },
  });
};

module.exports = {
  getPendingAssets,
  moderateAsset,
  bulkModerate,
  getPendingReviews,
  moderateReview,
};