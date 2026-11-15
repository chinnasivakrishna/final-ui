const express = require('express');
const router = express.Router();
const uiLayoutRoutes = require('./uiLayout.routes');
const uiLayoutController = require('../controllers/uiLayout.controller');
const catalogRoutes = require('./catalog.routes');
const customerRoutes = require('./customer.routes');

// Customer auth, profile, cart, wishlist, and recently viewed
router.use('/', customerRoutes);

// Direct public UI layout routes (supporting both formats: /ui-layouts and /public/ui-layouts)
router.use('/ui-layouts', uiLayoutRoutes);
router.get('/public/ui-layouts/page/:pageSlug', (req, res) => uiLayoutController.getPublishedPageConfig(req, res));
router.get('/public/ui-layouts/page', (req, res) => uiLayoutController.getPublishedPageConfig(req, res));

// Dynamic catalog, products, categories, catalogs, and explore spaces routes
router.use('/', catalogRoutes);

module.exports = router;

