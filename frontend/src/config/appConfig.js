/**
 * Centralized Application Configuration for Web UI
 * Reads configuration from Vite environment variables with safe production-ready fallbacks
 */

const getEnv = (key, fallback = '') => {
  return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) || fallback;
};

export const APP_CONFIG = Object.freeze({
  /**
   * Base URL for Web Backend API (defaults to empty string for relative paths or proxy)
   */
  apiBaseUrl: getEnv('VITE_API_BASE_URL', getEnv('VITE_WEB_API_BASE', getEnv('VITE_API_BASE', 'http://localhost:8789'))),

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
  googleClientId: getEnv('VITE_GOOGLE_CLIENT_ID', ''),
});

export default APP_CONFIG;

