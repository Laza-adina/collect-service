// src/controllers/widget.controller.js
const widgetService = require('../services/widget.service');

const createWidget = async (req, res) => {
  try {
    const widget = await widgetService.createWidget(req.user.id, req.body);
    return res.status(201).json({ success: true, data: { widget } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getWidgets = async (req, res) => {
  try {
    const widgets = await widgetService.getWidgets(req.user.id, req.query.brandId);
    return res.status(200).json({ success: true, data: { widgets } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const getWidgetById = async (req, res) => {
  try {
    const widget = await widgetService.getWidgetById(req.params.id, req.user.id);
    return res.status(200).json({ success: true, data: { widget } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const updateWidget = async (req, res) => {
  try {
    const widget = await widgetService.updateWidget(req.params.id, req.user.id, req.body);
    return res.status(200).json({ success: true, data: { widget } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const deleteWidget = async (req, res) => {
  try {
    await widgetService.deleteWidget(req.params.id, req.user.id);
    return res.status(200).json({ success: true, message: 'Widget désactivé' });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

const updateWidgetItems = async (req, res) => {
  try {
    const widget = await widgetService.updateWidgetItems(
      req.params.id, req.user.id, req.body.items
    );
    return res.status(200).json({ success: true, data: { widget } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

// Route publique — embed e-commerce
const getPublicWidget = async (req, res) => {
  try {
    const widget = await widgetService.getPublicWidget(req.widget.embedKey);
    return res.status(200).json({ success: true, data: { widget } });
  } catch (err) {
    return res.status(err.status || 500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createWidget, getWidgets, getWidgetById,
  updateWidget, deleteWidget, updateWidgetItems, getPublicWidget,
};