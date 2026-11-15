import { APP_CONFIG } from '../config/appConfig';

const API_BASE = APP_CONFIG.apiBaseUrl;

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Google Sign In / Sign Up
 */
export async function googleAuthApi(credential) {
  const res = await fetch(`${API_BASE}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Google authentication failed');
  }
  return data;
}

/**
 * Customer Profile
 */
export async function getProfileApi(token) {
  const res = await fetch(`${API_BASE}/api/customer/profile`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');
  return data.user;
}

export async function updateProfileApi(token, { name, mobile }) {
  const res = await fetch(`${API_BASE}/api/customer/profile`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ name, mobile }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data.user;
}

/**
 * Cart
 */
export async function getCartApi(token) {
  const res = await fetch(`${API_BASE}/api/customer/cart`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch cart');
  return data.cart || [];
}

export async function addToCartApi(token, { pdt_id, variant_id, qty = 1 }) {
  const res = await fetch(`${API_BASE}/api/customer/cart`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ pdt_id, variant_id, qty }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add item to cart');
  return data.cart || [];
}

export async function updateCartItemApi(token, id, qty) {
  const res = await fetch(`${API_BASE}/api/customer/cart/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify({ qty }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update cart');
  return data.cart || [];
}

export async function removeFromCartApi(token, id) {
  const res = await fetch(`${API_BASE}/api/customer/cart/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove from cart');
  return data.cart || [];
}

export async function clearCartApi(token) {
  const res = await fetch(`${API_BASE}/api/customer/cart`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to clear cart');
  return data.cart || [];
}

/**
 * Wishlist
 */
export async function getWishlistApi(token) {
  const res = await fetch(`${API_BASE}/api/customer/wishlist`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch wishlist');
  return data.wishlist || [];
}

export async function addToWishlistApi(token, { pdt_id, variant_id }) {
  const res = await fetch(`${API_BASE}/api/customer/wishlist`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ pdt_id, variant_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to add to wishlist');
  return data.wishlist || [];
}

export async function removeFromWishlistApi(token, id) {
  const res = await fetch(`${API_BASE}/api/customer/wishlist/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove from wishlist');
  return data.wishlist || [];
}

/**
 * Recently Viewed (Strictly Last 10 items)
 */
export async function getRecentlyViewedApi(token) {
  const res = await fetch(`${API_BASE}/api/customer/recently-viewed`, {
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch recently viewed');
  return data.items || [];
}

export async function addRecentlyViewedApi(token, pdt_id) {
  const res = await fetch(`${API_BASE}/api/customer/recently-viewed`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ pdt_id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to record product view');
  return data.items || [];
}

export async function clearRecentlyViewedApi(token) {
  const res = await fetch(`${API_BASE}/api/customer/recently-viewed`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to clear recently viewed');
  return data.items || [];
}

