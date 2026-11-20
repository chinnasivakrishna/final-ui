/**
 * Centralized Application Configuration for Web UI
 * Reads configuration from Vite environment variables with safe production-ready fallbacks
 */

const isProd = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PROD;

const getEnv = (key, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && key in import.meta.env) {
    const val = import.meta.env[key];
    if (val !== undefined && val !== null) {
      return val;
    }
  }
  return fallback;
};

export const APP_CONFIG = Object.freeze({
  /**
   * Base URL for Web Backend API.
   * In single-domain production deployment, an empty string '' sends all requests to the same origin
   * (e.g. /api/... on https://yellow-walrus-609845.hostingersite.com), eliminating CORS and port issues.
   */
  apiBaseUrl: getEnv('VITE_API_BASE_URL', isProd ? '' : 'http://localhost:8789'),

  /**
   * Default Organization Code for catalog queries
   */
  defaultOrgCode: getEnv('VITE_DEFAULT_ORG_CODE', 'taiton'),

  /**
   * Public assets base URL
   */
  assetsBaseUrl: getEnv('VITE_ASSETS_BASE_URL', ''),

  /**
   * Google OAuth Client ID for One Tap and Google Sign In
   */
  googleClientId: getEnv(
    'VITE_GOOGLE_CLIENT_ID',
    '636119438704-7ndhah8h9basjsbofppl7m78i65grhdr.apps.googleusercontent.com'
  ),
});

export default APP_CONFIG;
