import { APP_CONFIG } from '../config/appConfig';

const API_BASE = APP_CONFIG.apiBaseUrl;


export async function fetchPublishedPageConfig(pageSlug = 'home', orgCode = 'taiton') {
  try {
    let res = await fetch(
      `${API_BASE}/api/ui-layouts/page/${pageSlug}?org_code=${encodeURIComponent(orgCode)}`
    );

    if (!res.ok) {
      res = await fetch(
        `${API_BASE}/api/public/ui-layouts/page/${pageSlug}?org_code=${encodeURIComponent(orgCode)}`
      );
    }

    if (!res.ok) {
      console.warn(`[uiLayoutApi] Web backend returned status ${res.status}`);
      return null;
    }
    const data = await res.json();
    return data.components || {};
  } catch (err) {
    console.warn('[uiLayoutApi] Unable to reach Web UI backend:', err.message);
    return null;
  }
}

