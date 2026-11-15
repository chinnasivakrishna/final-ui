const catalogQueries = require('../queries/catalog.queries');
const logger = require('../../utils/logger');

function safeJsonParse(val, fallback = null) {
  if (!val) return fallback;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function formatProductVariants(dbVariants = [], infoVariants = []) {
  if (Array.isArray(dbVariants) && dbVariants.length > 0) {
    return dbVariants.map((v) => ({
      id: v.id,
      code: v.code || '',
      name: v.name || '',
      colour: v.colour || '',
      color: v.colour || v.name || '',
      price: v.price ? `₹${v.price}` : '',
      sku: v.sku || '',
      image: v.image || '',
    }));
  }
  if (Array.isArray(infoVariants) && infoVariants.length > 0) {
    return infoVariants.map((v, i) => ({
      id: i + 1,
      code: v.sku || '',
      name: v.name || v.colour || v.color || '',
      color: v.colour || v.color || v.name || '',
      price: '',
      sku: v.sku || '',
      image: '',
    }));
  }
  return [];
}

class CatalogService {
  async getCategories(orgCode = 'taiton') {
    try {
      const allRows = await catalogQueries.getCategories(orgCode);

      if (!allRows || allRows.length === 0) {
        return { success: true, count: 0, categories: [] };
      }

      let mainCats = allRows.filter((c) => c.type === 'cat' || Number(c.parent_id) === 0);
      if (mainCats.length === 0) {
        mainCats = allRows.filter((c) => Number(c.parent_id) === 0);
      }

      const formatted = mainCats.map((cat) => {
        const subcategories = allRows
          .filter((sc) => sc.type === 'sc' && Number(sc.parent_id) === Number(cat.id))
          .map((sc) => {
            const items = allRows
              .filter((s2) => s2.type === 's2c' && Number(s2.parent_id) === Number(sc.id))
              .map((s2) => ({
                id: s2.id,
                name: s2.name || s2.title || s2.category || '',
                title: s2.title || s2.name || s2.category || '',
                description: s2.description || '',
                image: s2.image || s2.img || '',
                url: `/product-list?catId=${s2.id}`,
              }));

            return {
              id: sc.id,
              name: sc.name || sc.title || sc.category || '',
              title: sc.title || sc.name || sc.category || '',
              description: sc.description || '',
              image: sc.image || sc.img || '',
              url: `/product-list?catId=${sc.id}`,
              items,
            };
          });

        return {
          id: cat.id,
          name: cat.name || cat.title || cat.category || '',
          title: cat.title || cat.name || cat.category || '',
          description: cat.description || '',
          image: cat.image || cat.img || '',
          url: `/product-list?catId=${cat.id}`,
          subcategories,
        };
      });

      return {
        success: true,
        count: formatted.length,
        categories: formatted,
      };
    } catch (e) {
      logger.error('CatalogService.getCategories error:', e.message);
      return { success: false, message: e.message, count: 0, categories: [] };
    }
  }

  async getSubcategories(catId = null) {
    try {
      const rows = await catalogQueries.getSubcategories(catId);
      const subcategories = rows.map((r) => ({
        id: r.id,
        catId: r.cat_id,
        name: r.name || r.title || r.category || '',
        title: r.title || r.name || r.category || '',
        type: r.type,
        image: r.image || r.img || '',
      }));
      return {
        success: true,
        count: subcategories.length,
        subcategories,
      };
    } catch (e) {
      logger.error('CatalogService.getSubcategories error:', e.message);
      return { success: false, message: e.message, subcategories: [] };
    }
  }

  async getProducts(params = {}) {
    try {
      const rows = await catalogQueries.getProducts(params);
      const variantRows = await catalogQueries.getVariantsByProductIds(rows.map((p) => p.id));
      const variantsByPdtId = new Map();
      for (const v of variantRows) {
        const pid = Number(v.pdt_id);
        if (!variantsByPdtId.has(pid)) variantsByPdtId.set(pid, []);
        variantsByPdtId.get(pid).push(v);
      }

      const products = rows.map((p) => {
        const features = safeJsonParse(p.features, []);
        const specs = safeJsonParse(p.specs, []);
        const infoVariants = safeJsonParse(p.info_variants, []);
        const dbVariants = variantsByPdtId.get(Number(p.id)) || [];
        return {
          id: p.id,
          code: p.code || String(p.id),
          name: p.name || '',
          fullname: p.name || '',
          categoryId: p.category_id,
          category: p.category_name || '',
          subcategory: p.subcategory_name || '',
          subSubcategory: p.sub_subcategory_name || '',
          image: p.image || '',
          price: p.price ? (String(p.price).startsWith('₹') ? p.price : `₹${p.price}`) : '',
          description: p.description || '',
          features: Array.isArray(features) ? features : [],
          specifications: Array.isArray(specs) ? specs : [],
          variants: formatProductVariants(dbVariants, infoVariants),
          url: `/product-detail?code=${encodeURIComponent(p.code || p.id)}`,
        };
      });

      return {
        success: true,
        total: products.length,
        products,
      };
    } catch (e) {
      logger.error('CatalogService.getProducts error:', e.message);
      return { success: false, message: e.message, total: 0, products: [] };
    }
  }

  async getProductDetail(codeOrId) {
    try {
      const p = await catalogQueries.getProductByCodeOrId(codeOrId);
      if (!p) {
        return { success: false, message: `Product not found for: ${codeOrId}`, product: null };
      }

      const dbVariants = await catalogQueries.getProductVariants(p.id);
      const features = safeJsonParse(p.features, []);
      const specs = safeJsonParse(p.specs, []);
      const additionalImages = safeJsonParse(p.pdt_imgs, []);
      const infoVariants = safeJsonParse(p.info_variants, []);

      const images = [];
      if (p.image) images.push(p.image);
      if (Array.isArray(additionalImages)) {
        for (const img of additionalImages) {
          if (img && !images.includes(img)) images.push(img);
        }
      }

      const finalVariants = formatProductVariants(dbVariants, infoVariants);

      return {
        success: true,
        product: {
          id: p.id,
          code: p.code || '',
          name: p.name || '',
          fullname: p.name || '',
          categoryId: p.category_id,
          rootCategoryId: p.root_category_id || p.category_id,
          subcategoryId: p.subcategory_id || null,
          subSubcategoryId: p.sub_subcategory_id || null,
          subId: p.sub_id || p.subcategory_id || null,
          category: p.category_name || '',
          subcategory: p.subcategory_name || '',
          subSubcategory: p.sub_subcategory_name || '',
          description: p.description || '',
          price: p.price ? (String(p.price).startsWith('₹') ? p.price : `₹${p.price}`) : '',
          images,
          image: images[0] || p.image || '',
          features: Array.isArray(features) ? features : [],
          specifications: Array.isArray(specs) ? specs : [],
          usp: Array.isArray(p.usp) ? p.usp : (safeJsonParse(p.usp, p.usp ? [p.usp] : [])),
          applications: Array.isArray(p.applications) ? p.applications : (safeJsonParse(p.applications, p.applications ? [p.applications] : [])),
          variants: finalVariants,
        },
      };
    } catch (e) {
      logger.error('CatalogService.getProductDetail error:', e.message);
      return { success: false, message: e.message, product: null };
    }
  }

  async getCatalogs(category = null) {
    try {
      const rows = await catalogQueries.getCatalogs(category);
      return {
        success: true,
        count: rows.length,
        catalogs: rows.map((r) => ({
          id: r.id,
          title: r.title || '',
          category: r.category || '',
          image: r.image || '',
          downloadUrl: r.downloadUrl || '',
          pages: r.pages || '',
          edition: r.edition || '',
        })),
      };
    } catch (e) {
      logger.error('CatalogService.getCatalogs error:', e.message);
      return { success: false, message: e.message, count: 0, catalogs: [] };
    }
  }

  async getSpaces(orgCode = 'taiton') {
    try {
      const rows = await catalogQueries.getSpaces(orgCode);
      const spaces = [];

      for (const sp of rows) {
        const hotspots = await catalogQueries.getSpaceHotspots(sp.id);
        const pts = hotspots.map((h) => {
          const specs = safeJsonParse(h.product_specs, []);
          const features = safeJsonParse(h.product_features, []);
          const variants = safeJsonParse(h.product_variants, []);
          const hasProductInfo = Boolean(h.product_name || h.c || h.label);
          return {
            id: h.id,
            c: h.c,
            x: Number(h.x) || 0,
            y: Number(h.y) || 0,
            label: h.label || h.product_name || h.c || '',
            product: hasProductInfo ? {
              c: h.c,
              name: h.product_name || h.label || h.c || '',
              label: h.label || h.product_name || h.c || '',
              img: h.product_img || '',
              d: h.product_desc || '',
              description: h.product_desc || '',
              price: h.product_price ? `₹${h.product_price}` : '',
              features: Array.isArray(features) ? features : [],
              s: Array.isArray(specs) ? specs : [],
              specifications: Array.isArray(specs) ? specs : [],
              variants: Array.isArray(variants) ? variants : [],
            } : null,
          };
        });

        spaces.push({
          id: sp.id,
          name: sp.name || sp.title || '',
          title: sp.title || sp.name || '',
          description: sp.description || '',
          img: sp.img || sp.image || '',
          image: sp.img || sp.image || '',
          sort_order: sp.sort_order,
          pts,
          hotspots: pts,
        });
      }

      return {
        success: true,
        count: spaces.length,
        spaces,
      };
    } catch (e) {
      logger.error('CatalogService.getSpaces error:', e.message);
      return { success: false, message: e.message, count: 0, spaces: [] };
    }
  }

  async saveSpace(spaceData, orgCode = 'taiton') {
    try {
      const spaceId = await catalogQueries.saveSpace(spaceData, orgCode);
      return { success: true, spaceId, message: 'Space saved successfully' };
    } catch (e) {
      logger.error('CatalogService.saveSpace error:', e.message);
      return { success: false, message: e.message };
    }
  }

  async deleteSpace(spaceId) {
    try {
      await catalogQueries.deleteSpace(spaceId);
      return { success: true, message: 'Space deleted successfully' };
    } catch (e) {
      logger.error('CatalogService.deleteSpace error:', e.message);
      return { success: false, message: e.message };
    }
  }
}

module.exports = new CatalogService();
