// src/services/widget.service.js
const { prisma } = require('../config/database');

const createWidget = async (agencyUserId, data) => {
  const existing = await prisma.widget.findUnique({ where: { slug: data.slug } });
  if (existing) throw { status: 409, message: 'Ce slug est déjà utilisé' };

  return prisma.widget.create({
    data: { ...data, agencyUserId },
    include: { items: { include: { asset: true } } },
  });
};

const getWidgets = async (agencyUserId, brandId) => {
  const where = { agencyUserId, isActive: true };
  if (brandId) where.brandId = brandId;

  return prisma.widget.findMany({
    where,
    include: { _count: { select: { items: true } } },
    orderBy: { createdAt: 'desc' },
  });
};

const getWidgetById = async (id, agencyUserId) => {
  const widget = await prisma.widget.findFirst({
    where: { id, agencyUserId },
    include: {
      items: {
        orderBy: { position: 'asc' },
        include: {
          asset: { include: { productTags: true } },
        },
      },
    },
  });
  if (!widget) throw { status: 404, message: 'Widget introuvable' };
  return widget;
};

const updateWidget = async (id, agencyUserId, data) => {
  const widget = await prisma.widget.findFirst({ where: { id, agencyUserId } });
  if (!widget) throw { status: 404, message: 'Widget introuvable' };

  return prisma.widget.update({ where: { id }, data });
};

const deleteWidget = async (id, agencyUserId) => {
  const widget = await prisma.widget.findFirst({ where: { id, agencyUserId } });
  if (!widget) throw { status: 404, message: 'Widget introuvable' };

  return prisma.widget.update({ where: { id }, data: { isActive: false } });
};

const updateWidgetItems = async (id, agencyUserId, items) => {
  const widget = await prisma.widget.findFirst({ where: { id, agencyUserId } });
  if (!widget) throw { status: 404, message: 'Widget introuvable' };

  // Vérifier que les assets sont approuvés
  const assetIds = items.map((i) => i.ugcAssetId);
  const approvedCount = await prisma.ugcAsset.count({
    where: { id: { in: assetIds }, moderationStatus: 'APPROVED', isActive: true },
  });
  if (approvedCount !== assetIds.length) {
    throw { status: 400, message: 'Certains assets ne sont pas approuvés' };
  }

  // Recréer les items
  await prisma.widgetItem.deleteMany({ where: { widgetId: id } });
  await prisma.widgetItem.createMany({
    data: items.map((item) => ({ ...item, widgetId: id })),
  });

  return getWidgetById(id, agencyUserId);
};

// Récupération publique pour l'embed (appelée depuis le site e-commerce)
const getPublicWidget = async (embedKey) => {
  const widget = await prisma.widget.findUnique({
    where: { embedKey, isActive: true },
    include: {
      items: {
        orderBy: { position: 'asc' },
        take: 50,
        include: {
          asset: {
            where: { moderationStatus: 'APPROVED', isActive: true },
            include: { productTags: true },
          },
        },
      },
    },
  });
  if (!widget) throw { status: 404, message: 'Widget introuvable' };

  // Filtrer les items dont l'asset est null (non approuvé)
  const filteredItems = widget.items.filter((i) => i.asset !== null);

  return { ...widget, items: filteredItems };
};

module.exports = {
  createWidget,
  getWidgets,
  getWidgetById,
  updateWidget,
  deleteWidget,
  updateWidgetItems,
  getPublicWidget,
};