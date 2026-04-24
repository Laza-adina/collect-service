// src/routes/index.js
const router = require('express').Router();

router.use('/ugc', require('./ugc.routes'));
router.use('/moderation', require('./moderation.routes'));
router.use('/reviews', require('./review.routes'));
router.use('/widgets', require('./widget.routes'));

module.exports = router;