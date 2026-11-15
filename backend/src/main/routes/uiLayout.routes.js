const express = require('express');
const router = express.Router();
const uiLayoutController = require('../controllers/uiLayout.controller');

// Routes for retrieving published layouts
router.get('/page/:pageSlug', (req, res) => uiLayoutController.getPublishedPageConfig(req, res));
router.get('/page', (req, res) => uiLayoutController.getPublishedPageConfig(req, res));

module.exports = router;

