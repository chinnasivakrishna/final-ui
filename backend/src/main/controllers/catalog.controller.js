const catalogService = require('../services/catalog.service');
const logger = require('../../utils/logger');

class CatalogController {
  // GET /api/categories
  async getCategories(req, res) {
    try {
      const orgCode = req.query.org_code || req.headers?.['x-org-code'] || 'taiton';
      const result = await catalogService.getCategories(orgCode);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('CatalogController.getCategories error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
    }
  }

  // GET /api/subcategories
  async getSubcategories(req, res) {
    try {
      const catId = req.query.catId || req.query.categoryId || req.query.cat || req.query.category_id || null;
      const result = await catalogService.getSubcategories(catId);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('CatalogController.getSubcategories error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to retrieve subcategories' });
    }
  }

  // GET /api/products
  async getProducts(req, res) {
    try {
      const categoryId = req.query.catId || req.query.categoryId || req.query.cat || req.query.category;
      const subId = req.query.subId || req.query.subcategory || req.query.sub;
      const { search, limit, offset } = req.query;

      const parsedLimit = limit !== undefined ? Math.max(1, Math.min(200, parseInt(limit, 10) || 100)) : 100;
      const parsedOffset = offset !== undefined ? Math.max(0, parseInt(offset, 10) || 0) : 0;

      const result = await catalogService.getProducts({
        categoryId,
        subId,
        search: search ? String(search).trim() : undefined,
        limit: parsedLimit,
        offset: parsedOffset,
      });
      return res.status(200).json(result);
    } catch (error) {
      logger.error('CatalogController.getProducts error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to retrieve products' });
    }
  }

  // GET /api/products/:idOrCode
  async getProductByIdOrCode(req, res) {
    try {
      const { idOrCode } = req.params;
      if (!idOrCode || !String(idOrCode).trim()) {
        return res.status(400).json({ success: false, message: 'Product ID or Code is required' });
      }
      const result = await catalogService.getProductDetail(String(idOrCode).trim());
      if (!result.success) {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
    } catch (error) {
      logger.error('CatalogController.getProductByIdOrCode error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to retrieve product details' });
    }
  }

  // GET /api/catalogs
  async getCatalogs(req, res) {
    try {
      const { category } = req.query;
      const result = await catalogService.getCatalogs(category ? String(category).trim() : null);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('CatalogController.getCatalogs error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to retrieve catalogs' });
    }
  }

  // GET /api/spaces
  async getSpaces(req, res) {
    try {
      const orgCode = req.query.org_code || req.headers?.['x-org-code'] || 'taiton';
      const result = await catalogService.getSpaces(orgCode);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('CatalogController.getSpaces error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to retrieve spaces' });
    }
  }

  // GET /api/spaces/:id
  async getSpaceById(req, res) {
    try {
      const { id } = req.params;
      const orgCode = req.query.org_code || 'taiton';
      const result = await catalogService.getSpaces(orgCode);
      const space = (result.spaces || []).find((s) => String(s.id) === String(id));
      if (!space) {
        return res.status(404).json({ success: false, message: `Space #${id} not found` });
      }
      return res.status(200).json({ success: true, space });
    } catch (error) {
      logger.error('CatalogController.getSpaceById error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to retrieve space' });
    }
  }

  // POST /api/spaces
  async saveSpace(req, res) {
    try {
      const orgCode = req.query.org_code || req.body?.org_code || 'taiton';
      if (!req.body || typeof req.body !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid space payload' });
      }
      const result = await catalogService.saveSpace(req.body, orgCode);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('CatalogController.saveSpace error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to save space' });
    }
  }

  // DELETE /api/spaces/:id
  async deleteSpace(req, res) {
    try {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ success: false, message: 'Space ID is required' });
      }
      const result = await catalogService.deleteSpace(id);
      return res.status(200).json(result);
    } catch (error) {
      logger.error('CatalogController.deleteSpace error:', error.message);
      return res.status(500).json({ success: false, message: 'Failed to delete space' });
    }
  }
}

module.exports = new CatalogController();
