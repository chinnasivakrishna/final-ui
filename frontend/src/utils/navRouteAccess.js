import { PERMISSIONS } from '../constants/permissions.js';
import { roleMatchesCsv } from './roleAccess.js';

function normalizeRoute(route) {
  const r = String(route ?? '').trim();
  if (!r) return '';
  const lower = r.toLowerCase();
  return lower.endsWith('/') && lower.length > 1 ? lower.slice(0, -1) : lower;
}

/**
 * Access rules for sidebar routes. null = any authenticated org user.
 * platformOnly / rolesCsv / permission — first match wins.
 */
const ROUTE_ACCESS = {
  '/app/dashboard': null,
  '/app/profile': null,
  '/app/notifications': null,
  '/app/org/approvals': null,
  '/app/settings': { permission: PERMISSIONS.ORG_CONFIG },
  '/app/org/users': { permission: PERMISSIONS.ORG_USERS },
  '/app/org/approval-rules': { permission: PERMISSIONS.ORG_APPROVAL_RULES },
  '/app/org/audit': { permission: PERMISSIONS.ORG_AUDIT_VIEW },
  '/app/web-responses': { permission: PERMISSIONS.CUSTOMER_REQUESTS_READ },
  '/app/customer-requests': { permission: PERMISSIONS.CUSTOMER_REQUESTS_READ },
  '/app/products': { permission: PERMISSIONS.PRODUCTS_READ },
  '/app/seo': { permission: PERMISSIONS.SEO_WRITE },
  '/app/ui-elements': { permission: PERMISSIONS.UI_WRITE },
  '/app/ui-elements/create': { permission: PERMISSIONS.UI_WRITE },
  '/app/ui-layouts': { permission: PERMISSIONS.UI_WRITE },
  '/app/careers': null,
  '/app/catalogs': null,
  '/app/events': null,
  '/app/explore-spaces': { permission: PERMISSIONS.SPACES_READ },
  '/app/accounts': { rolesCsv: 'org_admin,organization_admin,manager,super_admin,sys_admin' },
  '/app/onboarding/organizations': { platformOnly: true },
  '/app/onboarding/roles': { platformOnly: true },
  '/app/onboarding/members': { platformOnly: true },
  '/app/onboarding/nav': { platformOnly: true },
  '/app/platform': { platformOnly: true },
};

/**
 * Whether the current user may open this route (sidebar + direct URL guard).
 */
export function canAccessNavRoute(route, { roleCode, can, isPlatformAdmin, navItems }) {
  const path = normalizeRoute(route);
  if (!path) return false;

  // Universal routes allowed for all authenticated users
  if (['/app/dashboard', '/app/profile', '/app/notifications', '/app/org/approvals'].includes(path)) {
    return true;
  }

  // Platform admin routes check
  if (path.startsWith('/app/onboarding/') || path === '/app/platform') {
    return Boolean(isPlatformAdmin || roleCode === 'sys_admin' || roleCode === 'super_admin');
  }

  // Configurable nav routes that depend on db access_matrix
  const CONFIGURABLE_NAV_ROUTES = [
    '/app/products',
    '/app/seo',
    '/app/blogs',
    '/app/blog',
    '/app/careers',
    '/app/catalogs',
    '/app/ui-elements',
    '/app/ui-layouts',
    '/app/explore-spaces',
    '/app/org/users',
    '/app/org/approval-rules',
    '/app/org/audit',
    '/app/customer-requests',
    '/app/customer-service',
    '/app/web-responses',
    '/app/settings',
    '/app/accounts',
  ];

  const isConfigurable = CONFIGURABLE_NAV_ROUTES.some(
    (r) => path === r || path.startsWith(r + '/'),
  );

  if (isConfigurable && Array.isArray(navItems)) {
    const isAllowedInNav = navItems.some((item) => {
      const itemRoute = normalizeRoute(item.route);
      if (!itemRoute) return false;
      return path === itemRoute || path.startsWith(itemRoute + '/');
    });

    if (!isAllowedInNav) {
      return false;
    }
    return true;
  }

  const rule = ROUTE_ACCESS[path];
  if (!rule) {
    return true;
  }
  if (rule.platformOnly) {
    return Boolean(isPlatformAdmin || roleCode === 'sys_admin' || roleCode === 'super_admin');
  }
  if (rule.rolesCsv) {
    return roleMatchesCsv(roleCode, rule.rolesCsv);
  }
  if (rule.permission) {
    return can(rule.permission);
  }
  return true;
}

export function filterNavItemsByRouteAccess(items, accessCtx) {
  return (Array.isArray(items) ? items : []).filter((item) =>
    canAccessNavRoute(item.route, accessCtx),
  );
}

export function isKnownAppRoute(route) {
  return Boolean(ROUTE_ACCESS[normalizeRoute(route)]);
}

export { normalizeRoute };
