import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';
import { SidebarNavIcon } from '../components/SidebarNavIcon.jsx';
import { CompanyBranding } from '../components/CompanyBranding.jsx';
import { enterpriseApi } from '../api/enterpriseApi.js';
import { UNREAD_REFRESH } from '../utils/events.js';
import { canApprovePendingItem, contentTypeToResource } from '../utils/approvalAccess.js';
import { useMatchMedia } from '../hooks/useMatchMedia.js';
import { PageSpinner } from '../components/PageSpinner.jsx';
import { getRoleNavigation, isPlatformOperatorRole, shouldMergeOrgNavApi } from '../constants/roleNavigation.js';
import {
  filterApiNavItemsForRole,
  filterOrgNavApiItems,
  mergeNavItemsForRole,
  mergeStaticNavWithApi,
} from '../utils/mergeNavItems.js';
import { roleMatchesCsv } from '../utils/roleAccess.js';
import { usePermissions } from '../hooks/usePermissions.js';
import { canAccessNavRoute, filterNavItemsByRouteAccess } from '../utils/navRouteAccess.js';
import { AccessDenied } from '../components/AccessDenied.jsx';
import { formatRoleName } from '../utils/displayLabels.js';

function navClass({ isActive }) {
  const base = 'cp-nav-link';
  return isActive ? `${base} cp-nav-link--active` : base;
}

const FALLBACK_NAV = [
  {
    id: -1,
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    route: '/app/dashboard',
    position: 'top',
    sortOrder: 1,
  },
  {
    id: -3,
    label: 'Profile',
    icon: 'User',
    route: '/app/profile',
    position: 'bottom',
    sortOrder: 100,
  },
];

export function AppShell() {
  const {
    user,
    activeOrganization,
    branding,
    logout,
    navItems,
    sidebarCollapsed,
    setSidebarCollapsed,
    token,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileDrawer, setMobileDrawer] = useState(false);
  const [customerSupportOpen, setCustomerSupportOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [approvalsCount, setApprovalsCount] = useState(0);
  const profileRef = useRef(null);
  const isNarrow = useMatchMedia('(max-width: 768px)');
  const shellCollapsed = isNarrow ? false : sidebarCollapsed;
  const brandingCompact = isNarrow ? false : sidebarCollapsed;

  const isRefreshingRef = useRef(false);

  const refreshCounts = useCallback(async () => {
    if (!token || isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const d = await enterpriseApi.dashboardSummary(token);
      setUnread(Number(d.summary?.unreadNotifications ?? 0));
      setApprovalsCount(Number(d.summary?.pendingApprovals ?? 0));
    } catch {
      setUnread(0);
      setApprovalsCount(0);
    } finally {
      isRefreshingRef.current = false;
    }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => refreshCounts(), 0);
    return () => clearTimeout(t);
  }, [location.pathname, refreshCounts]);

  useEffect(() => {
    const h = () => refreshCounts();
    window.addEventListener(UNREAD_REFRESH, h);
    return () => window.removeEventListener(UNREAD_REFRESH, h);
  }, [refreshCounts]);

  const roleCode = activeOrganization?.roleCode ?? '';
  const rawRole = activeOrganization?.roleLabel || activeOrganization?.roleCode || user?.roleCode || user?.role || '';
  const userRoleDisplay = formatRoleName(rawRole, activeOrganization?.roleLabel);
  const orgDisplayTitle = branding?.appName || activeOrganization?.name || activeOrganization?.org_name || user?.org_code || 'Organization';

  const { can, isPlatformAdmin } = usePermissions();
  const roleNav = getRoleNavigation(roleCode);
  const navAccessCtx = useMemo(
    () => ({ roleCode, can, isPlatformAdmin, navItems }),
    [roleCode, can, isPlatformAdmin, navItems],
  );
  const hideCustomerServiceFab = roleNav?.hideCustomerServiceFab === true;
  const isPlatformViewer = roleMatchesCsv(activeOrganization?.roleCode, 'sys_admin,super_admin');

  const orgThemeStyle = useMemo(() => {
    if (isPlatformViewer || !branding?.theme) return undefined;
    const t = branding.theme;
    const style = {};
    if (t.sidebarBg) style['--cp-primary'] = t.sidebarBg;
    if (t.sidebarText) style['--cp-text-on-primary'] = t.sidebarText;
    if (t.headerBg) style['--cp-header-bg'] = t.headerBg;
    if (t.fontFamily) style['--cp-font-sans'] = t.fontFamily;
    if (t.fontSize) style.fontSize = `${t.fontSize}px`;
    if (t.navFontSize) style['--cp-nav-font-size'] = `${t.navFontSize}px`;
    return style;
  }, [branding?.theme, isPlatformViewer]);

  const { topNav, bottomNav } = useMemo(() => {
    const apiNav = filterApiNavItemsForRole(navItems, roleCode);
    const source = [
      { id: -1, label: 'Dashboard', icon: 'LayoutDashboard', route: '/app/dashboard', position: 'top', sortOrder: 0 },
      ...apiNav,
      { id: -3, label: 'Profile', icon: 'User', route: '/app/profile', position: 'bottom', sortOrder: 999 },
    ];
    const merged = mergeNavItemsForRole(source);
    const allowed = filterNavItemsByRouteAccess(merged, navAccessCtx);
    const top = [];
    const bottom = [];
    for (const item of allowed) {
      if (item.position === 'bottom') {
        bottom.push(item);
      } else {
        top.push(item);
      }
    }
    const sortByOrder = (arr) =>
      [...arr].sort((a, b) => {
        const sa = Number(a.sortOrder ?? a.sort_order) || 0;
        const sb = Number(b.sortOrder ?? b.sort_order) || 0;
        if (sa !== sb) return sa - sb;
        return Number(a.id) - Number(b.id);
      });
    return { topNav: sortByOrder(top), bottomNav: sortByOrder(bottom) };
  }, [navItems, roleCode, navAccessCtx]);

  const isCurrentRouteAllowed = useMemo(() => {
    return canAccessNavRoute(location.pathname, navAccessCtx);
  }, [location.pathname, navAccessCtx]);

  useEffect(() => {
    function onDocClick(e) {
      if (!profileRef.current?.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMobileDrawer(false), 0);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const initials = useMemo(() => {
    const n = user?.displayName || user?.email || '?';
    const parts = String(n).trim().split(/\s+/);
    const s =
      parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : String(n).slice(0, 2).toUpperCase();
    return s || '?';
  }, [user]);

  return (
    <div
      className={`cp-shell${shellCollapsed ? ' cp-shell--sidebar-collapsed' : ''}${mobileDrawer ? ' cp-shell--drawer-open' : ''}${orgThemeStyle ? ' cp-shell--org-themed' : ''}`}
      style={orgThemeStyle}
    >
      {mobileDrawer ? (
        <button
          type="button"
          className="cp-drawer-backdrop"
          aria-label="Close menu"
          onClick={() => setMobileDrawer(false)}
        />
      ) : null}

      <aside className="cp-sidebar" aria-label="Application">
        <div className="cp-sidebar-branding">
          <CompanyBranding
            branding={branding}
            fallbackName={activeOrganization?.name}
            compact={brandingCompact}
            variant="sidebar"
            linkToDashboard
          />
        </div>

        <nav className="cp-nav cp-nav--grow" aria-label="Primary">
          {topNav.map((item) => (
            <NavLink
              key={item.id}
              to={item.route}
              className={navClass}
              end={item.route.endsWith('/dashboard')}
              title={shellCollapsed ? item.label : undefined}
              onClick={() => {
                if (isNarrow) setMobileDrawer(false);
              }}
            >
              <span className="cp-nav-link-inner">
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  <SidebarNavIcon name={item.icon} className="cp-nav-icon" />
                  {shellCollapsed && item.route === '/app/org/approvals' && approvalsCount > 0 ? (
                    <span className="cp-nav-icon-badge">{approvalsCount}</span>
                  ) : null}
                </span>
                {!shellCollapsed ? <span>{item.label}</span> : null}
                {!shellCollapsed && item.route === '/app/org/approvals' && approvalsCount > 0 ? (
                  <span className="cp-nav-badge">{approvalsCount}</span>
                ) : null}
              </span>
            </NavLink>
          ))}
        </nav>

        <nav className="cp-nav cp-nav--bottom" aria-label="Secondary">
          {bottomNav.map((item) => (
            <NavLink
              key={item.id}
              to={item.route}
              className={navClass}
              title={shellCollapsed ? item.label : undefined}
              onClick={() => {
                if (isNarrow) setMobileDrawer(false);
              }}
            >
              <span className="cp-nav-link-inner">
                <span style={{ position: 'relative', display: 'inline-flex' }}>
                  <SidebarNavIcon name={item.icon} className="cp-nav-icon" />
                  {shellCollapsed && item.route === '/app/org/approvals' && approvalsCount > 0 ? (
                    <span className="cp-nav-icon-badge">{approvalsCount}</span>
                  ) : null}
                </span>
                {!shellCollapsed ? <span>{item.label}</span> : null}
                {!shellCollapsed && item.route === '/app/org/approvals' && approvalsCount > 0 ? (
                  <span className="cp-nav-badge">{approvalsCount}</span>
                ) : null}
              </span>
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          className="cp-sidebar-signout"
          aria-label="Sign out"
          title={shellCollapsed ? 'Sign out' : undefined}
          onClick={() => logout()}
        >
          <SidebarNavIcon name="LogOut" className="cp-nav-icon" />
          {!shellCollapsed ? <span className="cp-sidebar-signout-label">Sign out</span> : null}
        </button>

        <button
          type="button"
          className="cp-sidebar-collapse"
          aria-label={isNarrow ? 'Collapse menu' : sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={isNarrow ? mobileDrawer : !sidebarCollapsed}
          onClick={() => {
            if (isNarrow) {
              setMobileDrawer(false);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            {isNarrow ? (
              <>
                <path d="M15 18l-6-6 6-6" />
              </>
            ) : sidebarCollapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
          {(!isNarrow && !sidebarCollapsed) || isNarrow ? (
            <span className="cp-sidebar-collapse-label">Collapse</span>
          ) : null}
        </button>
      </aside>

      <div className="cp-main">
        <header className="cp-header">
          <div className="cp-header-left" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="cp-icon-btn cp-header-menu-btn"
              aria-label="Open navigation"
              onClick={() => setMobileDrawer(true)}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

          </div>

          <div className="cp-header-spacer" />

          <div className="cp-header-actions">
            <NavLink
              to="/app/org/approvals"
              className={({ isActive }) =>
                `cp-bell-wrap cp-icon-btn${isActive ? ' cp-icon-btn--active' : ''}`
              }
              aria-label="Approvals"
              title="Approvals"
            >
              <SidebarNavIcon name="CheckCircle" />
              {approvalsCount > 0 ? (
                <span className="cp-bell-badge">{approvalsCount > 99 ? '99+' : approvalsCount}</span>
              ) : null}
            </NavLink>

            <NavLink
              to="/app/notifications"
              className={({ isActive }) =>
                `cp-bell-wrap cp-icon-btn${isActive ? ' cp-icon-btn--active' : ''}`
              }
              aria-label="Notifications"
              title="Notifications"
            >
              <SidebarNavIcon name="Bell" />
              {unread > 0 ? (
                <span className="cp-bell-badge">{unread > 99 ? '99+' : unread}</span>
              ) : null}
            </NavLink>

            <div className="cp-profile-wrap" ref={profileRef}>
              <button
                type="button"
                className="cp-profile-trigger"
                aria-expanded={profileOpen}
                aria-haspopup="true"
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileOpen((v) => !v);
                }}
              >
                <span className="cp-avatar">{initials}</span>
                <span className="cp-profile-text">
                  <span className="cp-profile-name">{user?.displayName}</span>
                  <span className="cp-profile-email">{user?.email}</span>
                </span>
                <span className="cp-profile-chevron" aria-hidden>
                  ▾
                </span>
              </button>
              {profileOpen ? (
                <div className="cp-profile-menu" role="menu">
                  <NavLink
                    to="/app/profile"
                    className="cp-profile-menu-item"
                    role="menuitem"
                    onClick={() => setProfileOpen(false)}
                  >
                    Profile
                  </NavLink>
                  <button
                    type="button"
                    className="cp-profile-menu-item"
                    role="menuitem"
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="cp-content">
          <Suspense fallback={<PageSpinner />}>
            {isCurrentRouteAllowed ? (
              <Outlet />
            ) : (
              <AccessDenied
                title="Access Denied"
                message="You do not have permission to view or access this page."
              />
            )}
          </Suspense>
        </main>
      </div>

      {!hideCustomerServiceFab ? (
        <button
          type="button"
          className="cp-support-fab"
          aria-label="Techtrole Customer Service"
          title="Techtrole Customer Service"
          onClick={() => navigate('/app/customer-service')}
        >
          <svg height="30px" viewBox="0 -960 960 960" width="30px" fill="#FFFFFF" aria-hidden>
            <path d="M440-120v-66.67h333.33V-484q0-121.46-85.38-206.06-85.38-84.61-207.95-84.61t-207.95 84.61q-85.38 84.6-85.38 206.06v244H160q-33 0-56.5-23.5T80-320v-80q0-21 10.5-39.5T120-469l3-53q8-68 39.5-126t79-101q47.5-43 109-67T480-840q68 0 129 24t109 66.5Q766-707 797-649t40 126l3 52q19 9 29.5 27t10.5 38v92q0 20-10.5 38T840-249v62.33q0 27.5-19.58 47.09Q800.83-120 773.33-120H440ZM336.17-416.28q-9.5-9.62-9.5-23.84 0-14.21 9.61-23.71 9.62-9.5 23.84-9.5 14.21 0 23.71 9.61 9.5 9.62 9.5 23.84 0 14.21-9.61 23.71-9.62 9.5-23.84 9.5-14.21 0-23.71-9.61Zm240 0q-9.5-9.62-9.5-23.84 0-14.21 9.61-23.71 9.62-9.5 23.84-9.5 14.21 0 23.71 9.61 9.5 9.62 9.5 23.84 0 14.21-9.61 23.71-9.62 9.5-23.84 9.5-14.21 0-23.71-9.61ZM241-462q-7-106 64-182t177-76q87.67 0 152.83 57.17Q700-605.67 714-519q-89.67-1-164.17-49.67-74.5-48.66-115.02-129.33Q419-618 367.5-555.5T241-462Z" />
          </svg>
        </button>
      ) : null}
    </div>
  );
}
