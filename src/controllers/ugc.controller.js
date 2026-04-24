// src/controllers/ugc.controller.js
const ugcService = require('../services/ugc.service');

const addUgcAsset = async (req, res) => {
  try {
    const asset = await ugcService.addUgcAsset(req.user.id, req.body);
    return res.status(201).json({ success: true, data: { asset } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getUgcAssets = async (req, res) => {
  try {
    const result = await ugcService.getUgcAssets(req.user.id, req.query);
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getUgcAssetById = async (req, res) => {
  try {
    const asset = await ugcService.getUgcAssetById(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: { asset } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const deleteUgcAsset = async (req, res) => {
  try {
    await ugcService.deleteUgcAsset(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: 'Asset désactivé' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const updateProductTags = async (req, res) => {
  try {
    const asset = await ugcService.updateProductTags(
      req.params.id, req.user.id, req.body.productTags
    );
    return res.status(200).json({ success: true, data: { asset } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = { addUgcAsset, getUgcAssets, getUgcAssetById, deleteUgcAsset, updateProductTags };