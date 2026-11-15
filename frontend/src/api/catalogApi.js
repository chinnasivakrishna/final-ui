import { APP_CONFIG } from '../config/appConfig';

const API_BASE = APP_CONFIG.apiBaseUrl;

/**
 * Helper to resolve uploaded media URLs to the active web-backend host
 */
export function resolveImageUrl(url) {
  if (!url) return '';
  if (typeof url !== 'string') return '';
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;
  if (url.includes('/uploads/')) {
    const uploadPath = url.substring(url.indexOf('/uploads/'));
    return `${API_BASE}${uploadPath}`;
  }
  if (url.startsWith('uploads/')) {
    return `${API_BASE}/${url}`;
  }
  return url;
}

/**
 * Catalog & Dynamic UI API Client for Public Web UI
 * Connects directly to dedicated web backend (backed by u418448115_web_schema)
 */

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/api/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.categories || [];
  } catch (err) {
    console.warn('[catalogApi.fetchCategories] Error fetching categories:', err.message);
    return null;
  }
}

export async function fetchSubcategories(catId = null) {
  try {
    const url = catId ? `${API_BASE}/api/subcategories?catId=${catId}` : `${API_BASE}/api/subcategories`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.subcategories || [];
  } catch (err) {
    console.warn('[catalogApi.fetchSubcategories] Error:', err.message);
    return null;
  }
}

export async function fetchProducts(params = {}) {
  try {
    const q = new URLSearchParams();
    if (params.cat) q.set('cat', params.cat);
    if (params.catId) q.set('catId', params.catId);
    if (params.subId) q.set('subId', params.subId);
    if (params.search) q.set('search', params.search);
    if (params.limit) q.set('limit', params.limit);
    if (params.offset) q.set('offset', params.offset);

    const qs = q.toString() ? `?${q.toString()}` : '';
    const res = await fetch(`${API_BASE}/api/products${qs}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.products || [];
  } catch (err) {
    console.warn('[catalogApi.fetchProducts] Error:', err.message);
    return null;
  }
}

export async function fetchProductDetail(idOrCode) {
  try {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(idOrCode)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.product || null;
  } catch (err) {
    console.warn('[catalogApi.fetchProductDetail] Error:', err.message);
    return null;
  }
}

export async function fetchCatalogs(category = null) {
  try {
    const url = category && category !== 'all' ? `${API_BASE}/api/catalogs?category=${encodeURIComponent(category)}` : `${API_BASE}/api/catalogs`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.catalogs || [];
  } catch (err) {
    console.warn('[catalogApi.fetchCatalogs] Error:', err.message);
    return null;
  }
}

export async function fetchSpaces() {
  try {
    const res = await fetch(`${API_BASE}/api/spaces`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.spaces || [];
  } catch (err) {
    console.warn('[catalogApi.fetchSpaces] Error:', err.message);
    return null;
  }
}

export async function fetchSpaceById(id) {
  try {
    const res = await fetch(`${API_BASE}/api/spaces/${encodeURIComponent(id)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.space || null;
  } catch (err) {
    console.warn('[catalogApi.fetchSpaceById] Error:', err.message);
    return null;
  }
}

export async function saveSpace(spaceData) {
  try {
    const res = await fetch(`${API_BASE}/api/spaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(spaceData),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[catalogApi.saveSpace] Error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function deleteSpace(id) {
  try {
    const res = await fetch(`${API_BASE}/api/spaces/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('[catalogApi.deleteSpace] Error:', err.message);
    return { success: false, error: err.message };
  }
}

