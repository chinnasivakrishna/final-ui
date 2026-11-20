import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { enterpriseApi } from '../api/enterpriseApi.js';
import { AuthContext } from './authContext.js';

const STORAGE_KEY = 'cpanel.session';
const SIDEBAR_KEY = 'cpanel.sidebarCollapsed';

function loadStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(token, snapshot) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        token,
        user: snapshot.user,
        activeOrganization: snapshot.activeOrganization,
        branding: snapshot.branding ?? null,
        navItems: snapshot.navItems ?? [],
      }),
    );
  } catch {
    /* ignore storage quota issues */
  }
}

function clearPersisted() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function AuthProvider({ children }) {
  const stored = loadStored();
  const [token, setToken] = useState(() => stored?.token ?? null);
  const [user, setUser] = useState(() => stored?.user ?? null);
  const [activeOrganization, setActiveOrganization] = useState(
    () => stored?.activeOrganization ?? null,
  );
  const [branding, setBranding] = useState(() => stored?.branding ?? null);
  const [bootstrapping, setBootstrapping] = useState(() => Boolean(stored?.token));
  const [error, setError] = useState(null);
  const [navItems, setNavItems] = useState(() => stored?.navItems ?? []);
  const [permissions, setPermissions] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState(() => {
    try {
      return typeof localStorage !== 'undefined' && localStorage.getItem(SIDEBAR_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [bulkUploading, setBulkUploading] = useState(false);
  const skipSessionOnceRef = useRef(false);

  const setSidebarCollapsed = useCallback((collapsed) => {
    setSidebarCollapsedState(collapsed);
    try {
      if (collapsed) {
        localStorage.setItem(SIDEBAR_KEY, '1');
      } else {
        localStorage.removeItem(SIDEBAR_KEY);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(async ({ audit = true } = {}) => {
    const currentToken = token;
    if (audit && currentToken) {
      try {
        await enterpriseApi.logout(currentToken);
      } catch {
        /* session may already be invalid */
      }
    }
    clearPersisted();
    setToken(null);
    setUser(null);
    setActiveOrganization(null);
    setBranding(null);
    setNavItems([]);
    setPermissions([]);
    setError(null);
  }, [token]);

  const applyAuthPayload = useCallback((payload) => {
    setToken(payload.token);
    setUser(payload.user);
    setActiveOrganization(payload.activeOrganization ?? null);
    setBranding(payload.branding ?? null);
    persist(payload.token, {
      user: payload.user,
      activeOrganization: payload.activeOrganization,
      branding: payload.branding,
      navItems: [],
    });
  }, []);

  const refreshSession = useCallback(async () => {
    if (!token) return null;
    const session = await enterpriseApi.session(token);
    setUser(session.user);
    setActiveOrganization(session.activeOrganization ?? null);
    setBranding(session.branding ?? null);
    return session;
  }, [token]);

  const loadNavigation = useCallback(async () => {
    if (!token) {
      setNavItems([]);
      return;
    }
    try {
      const res = await enterpriseApi.navigation(token);
      const items = Array.isArray(res.items)
        ? res.items
        : Array.isArray(res.data)
        ? res.data
        : [];
      setNavItems(items);
    } catch {
      setNavItems([]);
    }
  }, [token]);

  const loadPermissions = useCallback(async () => {
    if (!token) {
      setPermissions([]);
      return;
    }
    try {
      const res = await enterpriseApi.myPermissions(token);
      setPermissions(res.permissions ?? []);
    } catch {
      setPermissions([]);
    }
  }, [token]);

  // Session validation effect on token change
  useEffect(() => {
    if (!token) {
      setBootstrapping(false);
      return undefined;
    }

    if (skipSessionOnceRef.current) {
      skipSessionOnceRef.current = false;
      setBootstrapping(false);
      return undefined;
    }

    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const session = await enterpriseApi.session(token);
        if (cancelled) return;
        setUser(session.user);
        setActiveOrganization(session.activeOrganization ?? null);
        setBranding(session.branding ?? null);
      } catch {
        if (cancelled) return;
        await logout({ audit: false });
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, logout]);

  // Listen for 401 unauthorized events (fired when account is deactivated or session invalid)
  useEffect(() => {
    if (!token) return undefined;

    const handleUnauthorized = () => {
      logout({ audit: false });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [token, logout]);

  // Navigation and permissions loading effect
  useEffect(() => {
    if (!token) return;
    loadNavigation();
    loadPermissions();
  }, [token, loadNavigation, loadPermissions]);

  const login = useCallback(
    async ({ email, password }) => {
      setError(null);
      const body = await enterpriseApi.login({
        email,
        password,
      });
      skipSessionOnceRef.current = true;
      applyAuthPayload(body);
      setBootstrapping(false);
      try {
        const [navRes, permRes] = await Promise.all([
          enterpriseApi.navigation(body.token).catch(() => ({ items: [] })),
          enterpriseApi.myPermissions(body.token).catch(() => ({ permissions: [] })),
        ]);
        const items = Array.isArray(navRes.items) ? navRes.items : [];
        setNavItems(items);
        setPermissions(permRes.permissions ?? []);
        persist(body.token, {
          user: body.user,
          activeOrganization: body.activeOrganization,
          branding: body.branding,
          navItems: items,
        });
      } catch {
        setNavItems([]);
        setPermissions([]);
      }
      return body;
    },
    [applyAuthPayload],
  );

  const value = useMemo(
    () => ({
      token,
      user,
      activeOrganization,
      branding,
      setBranding,
      bootstrapping,
      error,
      setError,
      login,
      logout,
      refreshSession,
      navItems,
      refreshNavigation: loadNavigation,
      permissions,
      refreshPermissions: loadPermissions,
      isAuthenticated: Boolean(token && user && activeOrganization),
      sidebarCollapsed,
      setSidebarCollapsed,
      bulkUploading,
      setBulkUploading,
    }),
    [
      token,
      user,
      activeOrganization,
      branding,
      bootstrapping,
      error,
      login,
      logout,
      refreshSession,
      navItems,
      loadNavigation,
      permissions,
      loadPermissions,
      sidebarCollapsed,
      setSidebarCollapsed,
      bulkUploading,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
