const { pool } = require('../../resources/connection');

const catalogQueries = {
  /**
   * Get all live categories from tb_pdt_categories
   */
  async getCategories(orgCode = 'taiton') {
    const [rows] = await pool.query(
      `SELECT id, org_code, type, parent_id, category AS name, category AS title, category, description, img AS image, img, status
       FROM tb_pdt_categories
       WHERE status = 'live'
       ORDER BY id ASC`
    );
    return rows;
  },

  /**
   * Get subcategories from tb_pdt_categories, optionally filtered by catId
   */
  async getSubcategories(catId = null) {
    if (catId && catId !== 'all' && catId !== 'All') {
      const isNum = !isNaN(Number(catId));
      let parentIds = [];
      if (isNum) {
        parentIds = [Number(catId)];
      } else {
        const clean = String(catId).toLowerCase().replace(/-/g, ' ');
        const [found] = await pool.query(
          `SELECT id FROM tb_pdt_categories WHERE status = 'live' AND (category LIKE ? OR id = ?)`,
          [`%${clean}%`, Number(catId) || 0]
        );
        parentIds = found.map((f) => f.id);
      }

      if (parentIds.length === 0) {
        return [];
      }

      // Return direct children or matching categories
      const [rows] = await pool.query(
        `SELECT id, parent_id AS cat_id, type, category AS name, category AS title, category, img AS image, img, status
         FROM tb_pdt_categories
         WHERE status = 'live' AND (parent_id IN (?) OR id IN (?))
         ORDER BY id ASC`,
        [parentIds, parentIds]
      );
      return rows;
    }

    // Return all subcategories and sub-subcategories (type = 'sc' or 's2c' or parent_id > 0)
    const [rows] = await pool.query(
      `SELECT id, parent_id AS cat_id, type, category AS name, category AS title, category, img AS image, img, status
       FROM tb_pdt_categories
       WHERE status = 'live' AND (type IN ('sc', 's2c') OR parent_id > 0)
       ORDER BY id ASC`
    );
    return rows;
  },

  /**
   * Get all live products with hierarchy-aware category filtering
   */
  async getProducts({ categoryId, subId, search, limit = 100, offset = 0 } = {}) {
    let targetCategoryIds = null;
    const filterTarget = subId || categoryId;

    if (filterTarget && filterTarget !== 'All' && filterTarget !== 'all') {
      const [allCats] = await pool.query(
        `SELECT id, parent_id, type, category FROM tb_pdt_categories WHERE status = 'live'`
      );

      const isNum = !isNaN(Number(filterTarget));
      const matchedRootIds = new Set();
      if (isNum) {
        matchedRootIds.add(Number(filterTarget));
      } else {
        const cleanTarget = String(filterTarget).toLowerCase().replace(/-/g, ' ');
        for (const c of allCats) {
          const cName = (c.category || '').toLowerCase();
          if (cName.includes(cleanTarget) || cleanTarget.includes(cName)) {
            matchedRootIds.add(c.id);
          }
        }
      }

      // Resolve all descendant category IDs
      const descendantIds = new Set(matchedRootIds);
      let expanded = true;
      while (expanded) {
        expanded = false;
        for (const c of allCats) {
          if (descendantIds.has(Number(c.parent_id)) && !descendantIds.has(Number(c.id))) {
            descendantIds.add(Number(c.id));
            expanded = true;
          }
        }
      }
      targetCategoryIds = Array.from(descendantIds);
    }

    let sql = `
      SELECT 
        p.id, p.org_code, p.parent_id AS category_id, p.sub_id, p.pdt_code AS code, p.product AS name, 
        p.primary_img AS image, p.status,
        c.category AS direct_category_name,
        c.type AS direct_category_type,
        parent_cat.category AS parent_category_name,
        grandparent_cat.category AS grandparent_category_name,
        pi.desc AS description, pi.price, pi.features, pi.specs, pi.addl_features, pi.pdt_imgs, pi.variants AS info_variants
      FROM tb_pdt_products p
      LEFT JOIN tb_pdt_categories c ON p.parent_id = c.id
      LEFT JOIN tb_pdt_categories parent_cat ON c.parent_id = parent_cat.id
      LEFT JOIN tb_pdt_categories grandparent_cat ON parent_cat.parent_id = grandparent_cat.id
      LEFT JOIN tb_pdt_product_info pi ON p.id = pi.pdt_id
      WHERE p.status = 'live'
    `;
    const params = [];

    if (targetCategoryIds && targetCategoryIds.length > 0) {
      sql += ` AND (p.parent_id IN (?) OR p.sub_id IN (?))`;
      params.push(targetCategoryIds, targetCategoryIds);
    } else if (filterTarget && (!targetCategoryIds || targetCategoryIds.length === 0)) {
      sql += ` AND (p.product LIKE ? OR p.pdt_code LIKE ?)`;
      params.push(`%${filterTarget}%`, `%${filterTarget}%`);
    }

    if (search) {
      sql += ` AND (p.product LIKE ? OR p.pdt_code LIKE ? OR pi.desc LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY p.id ASC LIMIT ? OFFSET ?`;
    params.push(Number(limit) || 100, Number(offset) || 0);

    const [rows] = await pool.query(sql, params);
    return rows.map((r) => {
      const categoryName = r.direct_category_type === 's2c'
        ? (r.grandparent_category_name || r.parent_category_name || r.direct_category_name)
        : (r.parent_category_name || r.direct_category_name || 'Architectural Hardware');

      const subcategoryName = r.direct_category_type === 's2c'
        ? (r.parent_category_name || r.direct_category_name)
        : (r.direct_category_type === 'sc' ? r.direct_category_name : '');

      return {
        ...r,
        category_name: categoryName,
        subcategory_name: subcategoryName,
        sub_subcategory_name: r.direct_category_name,
      };
    });
  },

  /**
   * Get single product by code or ID
   */
  async getProductByCodeOrId(codeOrId) {
    const isNum = !isNaN(Number(codeOrId));
    const numId = isNum ? Number(codeOrId) : -1;
    const [rows] = await pool.query(
      `SELECT 
        p.id, p.org_code, p.parent_id AS category_id, p.sub_id, p.pdt_code AS code, p.product AS name, 
        p.primary_img AS image, p.status,
        c.category AS direct_category_name,
        c.type AS direct_category_type,
        c.parent_id AS direct_parent_id,
        parent_cat.id AS parent_cat_id,
        parent_cat.category AS parent_category_name,
        grandparent_cat.id AS grandparent_cat_id,
        grandparent_cat.category AS grandparent_category_name,
        pi.desc AS description, pi.price, pi.features, pi.specs, pi.addl_features, pi.pdt_imgs, pi.variants AS info_variants
      FROM tb_pdt_products p
      LEFT JOIN tb_pdt_categories c ON p.parent_id = c.id
      LEFT JOIN tb_pdt_categories parent_cat ON c.parent_id = parent_cat.id
      LEFT JOIN tb_pdt_categories grandparent_cat ON parent_cat.parent_id = grandparent_cat.id
      LEFT JOIN tb_pdt_product_info pi ON p.id = pi.pdt_id
      WHERE (p.pdt_code = ? OR p.id = ?) AND p.status = 'live'
      LIMIT 1`,
      [String(codeOrId), numId]
    );

    if (!rows[0]) return null;
    const r = rows[0];
    const categoryName = r.direct_category_type === 's2c'
      ? (r.grandparent_category_name || r.parent_category_name || r.direct_category_name)
      : (r.parent_category_name || r.direct_category_name || 'Architectural Hardware');

    const subcategoryName = r.direct_category_type === 's2c'
      ? (r.parent_category_name || r.direct_category_name)
      : (r.direct_category_type === 'sc' ? r.direct_category_name : '');

    const rootCategoryId = r.direct_category_type === 's2c'
      ? (r.grandparent_cat_id || r.parent_cat_id || r.category_id)
      : (r.direct_category_type === 'sc' ? (r.parent_cat_id || r.category_id) : r.category_id);

    const subcategoryId = r.direct_category_type === 's2c'
      ? (r.parent_cat_id || r.direct_parent_id || r.sub_id || r.category_id)
      : (r.direct_category_type === 'sc' ? r.category_id : (r.sub_id || null));

    const subSubcategoryId = r.direct_category_type === 's2c' ? r.category_id : null;

    return {
      ...r,
      category_name: categoryName,
      subcategory_name: subcategoryName,
      sub_subcategory_name: r.direct_category_name,
      root_category_id: rootCategoryId,
      subcategory_id: subcategoryId,
      sub_subcategory_id: subSubcategoryId,
    };
  },

  /**
   * Get variants for a single product
   */
  async getProductVariants(pdtId) {
    const [rows] = await pool.query(
      `SELECT id, pdt_id, var_code AS code, name, colour, price, sku, primary_img AS image, imgs, status
       FROM tb_pdt_variants
       WHERE pdt_id = ? AND (status IS NULL OR TRIM(status) = '' OR LOWER(TRIM(status)) IN ('live', 'active', '1'))
       ORDER BY id ASC`,
      [Number(pdtId)]
    );
    return rows;
  },

  /**
   * Batch-fetch live variants for multiple products
   */
  async getVariantsByProductIds(pdtIds = []) {
    const ids = [...new Set(pdtIds.map((id) => Number(id)).filter((id) => !isNaN(id) && id > 0))];
    if (ids.length === 0) return [];
    const [rows] = await pool.query(
      `SELECT id, pdt_id, var_code AS code, name, colour, price, sku, primary_img AS image, imgs, status
       FROM tb_pdt_variants
       WHERE pdt_id IN (?) AND (status IS NULL OR TRIM(status) = '' OR LOWER(TRIM(status)) IN ('live', 'active', '1'))
       ORDER BY id ASC`,
      [ids]
    );
    return rows;
  },

  /**
   * Get catalogs
   */
  async getCatalogs(category = null) {
    let sql = `
      SELECT id, org_code, name AS title, category, file_url AS downloadUrl, thumbnail_img AS image, status, synced_at
      FROM tb_web_catalogs
      WHERE status = 'live'
    `;
    const params = [];
    if (category && category !== 'all') {
      sql += ` AND LOWER(category) = LOWER(?)`;
      params.push(category);
    }
    sql += ` ORDER BY id ASC`;
    const [rows] = await pool.query(sql, params);
    return rows;
  },

  /**
   * Get live explore spaces
   */
  async getSpaces(orgCode = 'taiton') {
    const [rows] = await pool.query(
      `SELECT id, org_code, title AS name, title, description, image_url AS img, image_url, view, sort_order
       FROM tb_web_spaces
       WHERE status = 'live' AND (view = 'view' OR view IS NULL)
       ORDER BY sort_order ASC, id ASC`
    );
    return rows;
  },

  /**
   * Get hotspots with linked product info for a space
   */
  async getSpaceHotspots(spaceId) {
    const [rows] = await pool.query(
      `SELECT 
         h.id,
         h.space_id,
         h.product_id,
         h.product_code AS c,
         h.x_pos AS x,
         h.y_pos AS y,
         h.label,
         h.sort_order,
         p.product AS product_name,
         p.primary_img AS product_img,
         pi.desc AS product_desc,
         pi.price AS product_price,
         pi.features AS product_features,
         pi.specs AS product_specs,
         pi.variants AS product_variants
       FROM tb_web_space_hotspots h
       LEFT JOIN tb_pdt_products p ON (h.product_id = p.id OR (h.product_code IS NOT NULL AND h.product_code != '' AND p.pdt_code COLLATE utf8mb4_general_ci = h.product_code COLLATE utf8mb4_general_ci))
       LEFT JOIN tb_pdt_product_info pi ON p.id = pi.pdt_id
       WHERE h.space_id = ?
       ORDER BY h.sort_order ASC, h.id ASC`,
      [spaceId]
    );
    return rows;
  },

  /**
   * Create or update space with hotspots
   */
  async saveSpace(spaceData, orgCode = 'taiton') {
    const { id, name, title, description = '', img, image = '', pts = [] } = spaceData;
    const finalTitle = title || name || 'New Space';
    const finalImg = img || image || '';
    let spaceId = id ? Number(id) : null;

    if (spaceId) {
      await pool.query(
        `UPDATE tb_web_spaces SET title = ?, image_url = ?, description = ?, synced_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [finalTitle, finalImg, description, spaceId]
      );
      await pool.query(`DELETE FROM tb_web_space_hotspots WHERE space_id = ?`, [spaceId]);
    } else {
      const [res] = await pool.query(
        `INSERT INTO tb_web_spaces (org_code, title, description, image_url, status, synced_at)
         VALUES (?, ?, ?, ?, 'live', CURRENT_TIMESTAMP)`,
        [orgCode, finalTitle, description, finalImg]
      );
      spaceId = res.insertId;
    }

    if (Array.isArray(pts) && pts.length > 0) {
      for (let i = 0; i < pts.length; i++) {
        const pt = pts[i];
        await pool.query(
          `INSERT INTO tb_web_space_hotspots (space_id, product_code, x_pos, y_pos, label, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [spaceId, pt.c || pt.product_code || '', Number(pt.x) || 0, Number(pt.y) || 0, pt.label || pt.c || '', i + 1]
        );
      }
    }

    return spaceId;
  },

  /**
   * Delete a space and its hotspots
   */
  async deleteSpace(spaceId) {
    await pool.query(`DELETE FROM tb_web_space_hotspots WHERE space_id = ?`, [Number(spaceId)]);
    await pool.query(`DELETE FROM tb_web_spaces WHERE id = ?`, [Number(spaceId)]);
    return true;
  },
};

module.exports = catalogQueries;
