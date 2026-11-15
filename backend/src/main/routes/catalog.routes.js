const express = require('express');
const router = express.Router();
const catalogController = require('../controllers/catalog.controller');

// Categories & Subcategories
router.get('/categories', (req, res) => catalogController.getCategories(req, res));
router.get('/categories/:id', (req, res) => catalogController.getCategories(req, res));
router.get('/subcategories', (req, res) => catalogController.getSubcategories(req, res));
router.get('/sub-subcategories', (req, res) => catalogController.getSubcategories(req, res));

// Products & Details
router.get('/products', (req, res) => catalogController.getProducts(req, res));
router.get('/products/:idOrCode', (req, res) => catalogController.getProductByIdOrCode(req, res));

// Catalogs / Catalogues
router.get('/catalogs', (req, res) => catalogController.getCatalogs(req, res));
router.get('/catalogues', (req, res) => catalogController.getCatalogs(req, res));

// Explore Spaces
router.get('/spaces', (req, res) => catalogController.getSpaces(req, res));
router.get('/spaces/:id', (req, res) => catalogController.getSpaceById(req, res));
router.post('/spaces', (req, res) => catalogController.saveSpace(req, res));
router.put('/spaces/:id', (req, res) => catalogController.saveSpace(req, res));
router.delete('/spaces/:id', (req, res) => catalogController.deleteSpace(req, res));

module.exports = router;
