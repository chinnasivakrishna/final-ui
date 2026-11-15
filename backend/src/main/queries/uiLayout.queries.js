const { pool } = require('../../resources/connection');

const uiLayoutQueries = {
  /**
   * Resolve page route ID by slug or ID
   */
  async getPageRouteId(slugOrId) {
    if (!slugOrId || slugOrId === 'home' || slugOrId === 'index') {
      return 23;
    }
    if (slugOrId === 'about' || slugOrId === 'about-us') {
      return 24;
    }
    if (!isNaN(Number(slugOrId))) {
      return Number(slugOrId);
    }
    try {
      const [rows] = await pool.query(
        `SELECT id FROM tb_config_routes WHERE route = ? OR route = ? OR LOWER(page) LIKE ? LIMIT 1`,
        [`/${slugOrId}`, slugOrId, `%${slugOrId}%`]
      );
      if (rows.length > 0) {
        return rows[0].id;
      }
    } catch {
      // If tb_config_routes is not present in web_schema, use standard fallback
    }
    return 23;
  },

  /**
   * Retrieve published component configurations for a page (Public Web UI)
   */
  async getPublishedPageConfig(orgCode, pageRouteId) {
    const cleanOrg = orgCode || 'taiton';
    const [rows] = await pool.query(
      `SELECT 
         c.id as component_id,
         c.component_key,
         c.label as component_label,
         t.id as template_id,
         t.template_key as layout_id,
         t.label as layout_label,
         cnt.content_json,
         cnt.content_version,
         cnt.synced_at as updated_at
       FROM tb_ui_components c
       JOIN tb_ui_page_components pc 
         ON c.id = pc.component_id AND pc.org_code = ? AND pc.status != 'inactive'
       JOIN tb_ui_component_content cnt 
         ON cnt.page_component_id = pc.id AND cnt.status = 'live'
       JOIN tb_ui_templates t 
         ON cnt.template_id = t.id
       WHERE c.page_route_id = ? AND c.status = 'active'
       ORDER BY pc.sort_order ASC, c.id ASC`,
      [cleanOrg, Number(pageRouteId)]
    );
    return rows;
  },
};

module.exports = uiLayoutQueries;

