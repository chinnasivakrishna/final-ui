import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '../config/appConfig';
import {
  googleAuthApi,
  getProfileApi,
  updateProfileApi,
  getCartApi,
  addToCartApi,
  updateCartItemApi,
  removeFromCartApi,
  clearCartApi,
  getWishlistApi,
  addToWishlistApi,
  removeFromWishlistApi,
  getRecentlyViewedApi,
  addRecentlyViewedApi,
  clearRecentlyViewedApi,
} from '../api/customerApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'taiton_auth_token';
const USER_KEY = 'taiton_auth_user';
const RECENT_KEY = 'taiton_recent_products';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.slice(0, 10) : [];
    } catch {
      return [];
    }
  });

  const [authLoading, setAuthLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load customer data when token is available
  const loadCustomerData = useCallback(async (authToken) => {
    if (!authToken) {
      setCart([]);
      setWishlist([]);
      return;
    }

    try {
      const [userProfile, cartData, wishlistData, recentData] = await Promise.allSettled([
        getProfileApi(authToken),
        getCartApi(authToken),
        getWishlistApi(authToken),
        getRecentlyViewedApi(authToken),
      ]);

      if (userProfile.status === 'fulfilled' && userProfile.value) {
        setUser(userProfile.value);
        localStorage.setItem(USER_KEY, JSON.stringify(userProfile.value));
      }

      if (cartData.status === 'fulfilled') {
        setCart(cartData.value || []);
      }

      if (wishlistData.status === 'fulfilled') {
        setWishlist(wishlistData.value || []);
      }

      if (recentData.status === 'fulfilled' && Array.isArray(recentData.value)) {
        const list = recentData.value.slice(0, 10);
        setRecentlyViewed(list);
        localStorage.setItem(RECENT_KEY, JSON.stringify(list));
      }
    } catch (err) {
      console.warn('[AuthContext] Error loading customer data:', err.message);
    }
  }, []);

  // Handle Google Auth Response from One Tap or Continue Button
  const handleGoogleCredentialResponse = useCallback(async (response) => {
    if (!response || !response.credential) return;
    try {
      setAuthLoading(true);
      const data = await googleAuthApi(response.credential);
      if (data.token && data.user) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        setIsLoginModalOpen(false);
        await loadCustomerData(data.token);
      }
    } catch (err) {
      console.error('[AuthContext] Google sign-in failed:', err.message);
      alert(err.message || 'Google Sign-In failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  }, [loadCustomerData]);

  // Initialize Google One Tap / Identity Services
  useEffect(() => {
    const clientId = APP_CONFIG.googleClientId;

    const initializeGoogle = () => {
      if (typeof window === 'undefined' || !window.google?.accounts?.id) return;

      if (clientId) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: true,
          cancel_on_tap_outside: true,
        });

        // Display Google One Tap directly in top right if not logged in
        if (!token) {
          window.google.accounts.id.prompt((notification) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // One Tap was closed or suppressed by browser
            }
          });
        }
      }
    };

    if (window.google?.accounts?.id) {
      initializeGoogle();
    } else {
      const scriptId = 'google-gsi-client';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = initializeGoogle;
        document.head.appendChild(script);
      }
    }
  }, [token, handleGoogleCredentialResponse]);

  // Initial token load
  useEffect(() => {
    if (token) {
      loadCustomerData(token).finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, [token, loadCustomerData]);

  // Logout
  const logout = useCallback(() => {
    setToken('');
    setUser(null);
    setCart([]);
    setWishlist([]);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  // Update Profile
  const updateProfile = useCallback(async ({ name, mobile }) => {
    if (!token) throw new Error('Not authenticated');
    const updatedUser = await updateProfileApi(token, { name, mobile });
    setUser(updatedUser);
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  }, [token]);

  // Cart Functions
  const addToCart = useCallback(async (pdt_id, variant_id = null, qty = 1) => {
    if (!token) {
      setIsLoginModalOpen(true);
      return false;
    }
    try {
      const updatedCart = await addToCartApi(token, { pdt_id, variant_id, qty });
      setCart(updatedCart);
      return true;
    } catch (err) {
      console.error('[AuthContext.addToCart]', err.message);
      return false;
    }
  }, [token]);

  const updateCartQty = useCallback(async (cartItemId, qty) => {
    if (!token) return;
    try {
      const updatedCart = await updateCartItemApi(token, cartItemId, qty);
      setCart(updatedCart);
    } catch (err) {
      console.error('[AuthContext.updateCartQty]', err.message);
    }
  }, [token]);

  const removeFromCart = useCallback(async (cartItemId) => {
    if (!token) return;
    try {
      const updatedCart = await removeFromCartApi(token, cartItemId);
      setCart(updatedCart);
    } catch (err) {
      console.error('[AuthContext.removeFromCart]', err.message);
    }
  }, [token]);

  const clearCart = useCallback(async () => {
    if (!token) return;
    try {
      await clearCartApi(token);
      setCart([]);
    } catch (err) {
      console.error('[AuthContext.clearCart]', err.message);
    }
  }, [token]);

  // Wishlist Functions
  const addToWishlist = useCallback(async (pdt_id, variant_id = null) => {
    if (!token) {
      setIsLoginModalOpen(true);
      return false;
    }
    try {
      const updated = await addToWishlistApi(token, { pdt_id, variant_id });
      setWishlist(updated);
      return true;
    } catch (err) {
      console.error('[AuthContext.addToWishlist]', err.message);
      return false;
    }
  }, [token]);

  const removeFromWishlist = useCallback(async (idOrPdtId) => {
    if (!token) return;
    try {
      const updated = await removeFromWishlistApi(token, idOrPdtId);
      setWishlist(updated);
    } catch (err) {
      console.error('[AuthContext.removeFromWishlist]', err.message);
    }
  }, [token]);

  const isWishlisted = useCallback((pdtId) => {
    if (!pdtId) return false;
    const target = String(pdtId).toLowerCase();
    return wishlist.some((item) => 
      String(item.pdt_id || '').toLowerCase() === target ||
      String(item.id || '').toLowerCase() === target ||
      String(item.product_id || '').toLowerCase() === target ||
      String(item.code || '').toLowerCase() === target ||
      String(item.product?.code || '').toLowerCase() === target
    );
  }, [wishlist]);

  // Recently Viewed (Strictly Last 10 items)
  const recordProductView = useCallback(async (product) => {
    if (!product || (!product.id && !product.pdt_id)) return;
    const pdtId = product.id || product.pdt_id;

    // Update local recently viewed list (strictly capped at 10)
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => String(item.pdt_id || item.id) !== String(pdtId));
      const code = product.code || product.pdt_code || '';
      const name = product.fullname || product.name || product.product || '';
      const image = product.image || product.primary_img || (Array.isArray(product.images) ? product.images[0] : '');

      const newItem = {
        id: pdtId,
        pdt_id: pdtId,
        code,
        name,
        fullname: name,
        image,
        product_code: code,
        product_name: name,
        product_image: image,
        viewed_at: new Date().toISOString(),
        product: {
          code,
          name,
          fullname: name,
          image,
        },
      };
      const updated = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });

    // If authenticated, sync with backend
    if (token) {
      try {
        const backendItems = await addRecentlyViewedApi(token, pdtId);
        if (Array.isArray(backendItems)) {
          const capped = backendItems.slice(0, 10);
          setRecentlyViewed(capped);
          localStorage.setItem(RECENT_KEY, JSON.stringify(capped));
        }
      } catch (err) {
        console.warn('[AuthContext.recordProductView]', err.message);
      }
    }
  }, [token]);

  const clearRecentlyViewed = useCallback(async () => {
    setRecentlyViewed([]);
    localStorage.removeItem(RECENT_KEY);
    if (token) {
      try {
        await clearRecentlyViewedApi(token);
      } catch (err) {
        console.error('[AuthContext.clearRecentlyViewed]', err.message);
      }
    }
  }, [token]);

  // Trigger Google Login Modal / Prompt
  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    authLoading,
    cart,
    cartCount: cart.reduce((sum, item) => sum + (parseInt(item.qty, 10) || 1), 0),
    wishlist,
    wishlistCount: wishlist.length,
    recentlyViewed,
    recentlyViewedCount: recentlyViewed.length,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    handleGoogleCredentialResponse,
    logout,
    updateProfile,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    recordProductView,
    clearRecentlyViewed,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

