import { useContext, useMemo } from 'react';
import { AuthContext } from '../context/authContext.js';

const PLATFORM_ROLES = new Set(['sys_admin', 'super_admin']);
const ORG_ADMIN_ROLES = new Set(['org_admin', 'organization_admin', 'admin']);

function normalizeRole(r) {
  const s = String(r || '').toLowerCase().trim();
  if (s === 'org_admin' || s === 'organization_admin') return 'organization_admin';
  if (s === 'super_admin' || s === 'sys_admin' || s === 'system_admin') return 'super_admin';
  if (s === 'super_employee') return 'super_employee';
  if (s === 'employee' || s === 'employee_2') return 'employee';
  return s;
}

export function usePermissions() {
  const ctx = useContext(AuthContext);
  const permissions = ctx?.permissions ?? [];
  const navItems = ctx?.navItems ?? [];
  const rawRole = String(
    ctx?.activeOrganization?.roleCode ||
      ctx?.user?.roleCode ||
      ctx?.user?.role ||
      ctx?.role ||
      ''
  ).toLowerCase();

  const role = normalizeRole(rawRole);

  const permissionSet = useMemo(
    () => new Set(permissions.map((p) => String(p.code || p).toLowerCase())),
    [permissions],
  );

  const isPlatformAdmin = PLATFORM_ROLES.has(rawRole) || role === 'super_admin';
  const isOrgAdmin = ORG_ADMIN_ROLES.has(rawRole) || role === 'organization_admin';

  const can = (code) => {
    if (!code) return true;
    const targetCode = String(code).toLowerCase();

    // 1. Platform Admin & Org Admin have full access to non-platform features
    if ((isPlatformAdmin || isOrgAdmin) && !targetCode.startsWith('platform.')) {
      return true;
    }

    // 2. Wildcard permission (e.g. from backend getMyPermissions)
    if (permissionSet.has('*') || permissionSet.has('all')) {
      return true;
    }

    // 3. Exact permission match
    if (permissionSet.has(targetCode)) {
      return true;
    }

    // 4. Check if assigned in navigation items (access_matrix)
    if (Array.isArray(navItems) && navItems.length > 0) {
      const PERMISSION_TO_ROUTES = {
        'products.read': ['/app/products', 'products'],
        'users.read': ['/app/org/users', '/app/accounts', 'users'],
        'rules.read': ['/app/org/approval-rules', '/app/rules', 'rules'],
        'seo.read': ['/app/seo', 'seo'],
        'blog.read': ['/app/blog', 'blog'],
        'careers.read': ['/app/careers', 'careers'],
        'catalogs.read': ['/app/catalogs', 'catalogs'],
        'events.read': ['/app/events', 'events'],
        'web_responses.read': ['/app/web-responses', 'web_responses'],
      };

      const routesToCheck = PERMISSION_TO_ROUTES[targetCode] || [targetCode];
      const hasNav = navItems.some((n) => {
        const r = String(n.route || '').toLowerCase().trim();
        return routesToCheck.some((rt) => r.includes(rt));
      });
      if (hasNav) return true;
    }

    return false;
  };

  return {
    role,
    permissions,
    can,
    isPlatformAdmin,
    isOrgAdmin,
  };
}
