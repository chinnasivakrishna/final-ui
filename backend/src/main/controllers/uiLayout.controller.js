const uiLayoutService = require('../services/uiLayout.service');
const logger = require('../../utils/logger');

class UiLayoutController {
  /**
   * GET /api/ui-layouts/page/:pageSlug
   * Retrieve published component configurations for the public Web UI
   */
  async getPublishedPageConfig(req, res) {
    try {
      const pageSlug = req.params?.pageSlug || req.query?.slug || 'home';
      const orgCode = req.query?.org_code || req.query?.orgCode || 'taiton';

      const data = await uiLayoutService.getPublishedPageConfig(orgCode, pageSlug);
      return res.status(200).json(data);
    } catch (error) {
      logger.error('UiLayoutController.getPublishedPageConfig error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve published layouts',
      });
    }
  }
}

module.exports = new UiLayoutController();
