// src/services/ugc.service.js
const { prisma } = require('../config/database');

const addUgcAsset = async (agencyUserId, data) => {
  const { productTags = [], ...assetData } = data;

  return prisma.ugcAsset.create({
    data: {
      ...assetData,
      agencyUserId,
      productTags: {
        create: productTags,
      },
    },
    include: { productTags: true },
  });
};

const getUgcAssets = async (agencyUserId, filters = {}) => {
  const {
    brandId, source, mediaType,
    moderationStatus, platform, campaignId,
    page = 1, limit = 20,
  } = filters;

  const where = { agencyUserId, isActive: true };
  if (brandId) where.brandId = brandId;
  if (source) where.source = source;
  if (mediaType) where.mediaType = mediaType;
  if (moderationStatus) where.moderationStatus = moderationStatus;
  if (platform) where.platform = platform;
  if (campaignId) where.campaignId = campaignId;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [assets, total] = await Promise.all([
    prisma.ugcAsset.findMany({
      where,
      include: { productTags: true },
      orderBy: { createdAt: 'desc' },
      skip,
      take: parseInt(limit),
    }),
    prisma.ugcAsset.count({ where }),
  ]);

  return {
    data: assets,
    meta: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
  };
};

const getUgcAssetById = async (id, agencyUserId) => {
  const asset = await prisma.ugcAsset.findFirst({
    where: { id, agencyUserId },
    include: { productTags: true },
  });
  if (!asset) throw { status: 404, message: 'Asset introuvable' };
  return asset;
};

const deleteUgcAsset = async (id, agencyUserId) => {
  const asset = await prisma.ugcAsset.findFirst({ where: { id, agencyUserId } });
  if (!asset) throw { status: 404, message: 'Asset introuvable' };
  return prisma.ugcAsset.update({ where: { id }, data: { isActive: false } });
};

const updateProductTags = async (id, agencyUserId, productTags) => {
  const asset = await prisma.ugcAsset.findFirst({ where: { id, agencyUserId } });
  if (!asset) throw { status: 404, message: 'Asset introuvable' };

  // Supprimer les anciens tags et recréer
  await prisma.productTag.deleteMany({ where: { ugcAssetId: id } });

  return prisma.ugcAsset.update({
    where: { id },
    data: {
      productTags: { create: productTags },
    },
    include: { productTags: true },
  });
};

module.exports = {
  addUgcAsset,
  getUgcAssets,
  getUgcAssetById,
  deleteUgcAsset,
  updateProductTags,
};