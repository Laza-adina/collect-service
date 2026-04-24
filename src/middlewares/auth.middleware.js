// src/middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token manquant' });
    }
    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
        issuer: 'ugc-platform',
        audience: 'ugc-client',
      });
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: err.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide',
      });
    }
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erreur authentification' });
  }
};

/**
 * Auth publique pour les widgets intégrés sur les sites e-commerce
 * Utilise un embedKey en query param : ?key=xxxx
 */
const authenticateWidget = async (req, res, next) => {
  const { prisma } = require('../config/database');
  const embedKey = req.query.key || req.headers['x-widget-key'];
  if (!embedKey) {
    return res.status(401).json({ success: false, message: 'Clé widget manquante' });
  }
  const widget = await prisma.widget.findUnique({
    where: { embedKey },
  });
  if (!widget || !widget.isActive) {
    return res.status(401).json({ success: false, message: 'Clé widget invalide' });
  }
  req.widget = widget;
  next();
};

module.exports = { authenticate, authenticateWidget };