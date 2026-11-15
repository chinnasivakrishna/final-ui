const uiLayoutQueries = require('../queries/uiLayout.queries');
const logger = require('../../utils/logger');

class UiLayoutService {
  /**
   * Retrieve published component configurations for a page
   */
  async getPublishedPageConfig(orgCode = 'taiton', pageSlug = 'home') {
    const cleanOrg = orgCode || 'taiton';
    const pageRouteId = await uiLayoutQueries.getPageRouteId(pageSlug);

    const rows = await uiLayoutQueries.getPublishedPageConfig(cleanOrg, pageRouteId);

    const components = {};
    for (const r of rows) {
      let parsed = null;
      try {
        parsed = typeof r.content_json === 'string' ? JSON.parse(r.content_json) : r.content_json;
      } catch (e) {
        logger.warn(`Failed to parse JSON content for component ${r.component_key}:`, e.message);
      }

      components[r.component_key] = {
        componentId: r.component_key,
        componentKey: r.component_key,
        componentName: r.component_label,
        layoutId: r.layout_id,
        layoutName: r.layout_label,
        configuration: parsed,
        contentVersion: r.content_version,
        updatedAt: r.updated_at,
      };
    }

    return {
      success: true,
      page: {
        id: pageRouteId,
        slug: pageSlug,
      },
      components,
    };
  }
}

module.exports = new UiLayoutService();
