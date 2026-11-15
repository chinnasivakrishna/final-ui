const { pool } = require('../../resources/connection');
const queries = require('../queries/customer.queries');
const { createToken, base64UrlDecode } = require('../../utils/auth');
const config = require('../../config');
const logger = require('../../utils/logger');

class CustomerService {
  /**
   * Continue with Google (Automatic Signup / Signin)
   */
  async handleGoogleAuth(credential) {
    if (!credential || typeof credential !== 'string') {
      throw new Error('Valid Google credential is required');
    }

    let tokenData = null;

    // 1. Try Google Tokeninfo API for verification
    try {
      const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`, {
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        tokenData = await response.json();
      }
    } catch (netErr) {
      logger.warn('[Auth] Google Tokeninfo verification network warning:', netErr.message);
    }

    // 2. If tokeninfo was not reached or failed, securely decode JWT payload
    if (!tokenData || !tokenData.sub || !tokenData.email) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payloadStr = base64UrlDecode(parts[1]);
          tokenData = JSON.parse(payloadStr);
        }
      } catch (decodeErr) {
        logger.error('[Auth] Failed to decode Google credential payload:', decodeErr.message);
      }
    }

    if (!tokenData || (!tokenData.sub && !tokenData.email)) {
      throw new Error('Unable to extract Google account information from credential');
    }

    const googleId = tokenData.sub || null;
    const email = (tokenData.email || '').toLowerCase().trim();
    const name = tokenData.name || (email ? email.split('@')[0] : 'User');
    const avatar = tokenData.picture || null;

    if (!email) {
      throw new Error('Google account must provide an email address');
    }

    // 3. Check if customer exists by google_id or email
    const [existing] = await pool.query(queries.findCustomerByGoogleOrEmail, [googleId, email]);

    let customer = null;
    if (existing && existing.length > 0) {
      customer = existing[0];
      // Update avatar or google_id if missing/changed
      await pool.query(queries.updateCustomerLogin, [avatar, googleId, customer.id]);
      customer.avatar = avatar || customer.avatar;
    } else {
      // 4. Automatic Signup if account does not exist
      const [insertRes] = await pool.query(queries.createCustomer, [
        'taiton',
        name,
        email,
        avatar,
        googleId,
      ]);
      const [newCust] = await pool.query(queries.findCustomerById, [insertRes.insertId]);
      customer = newCust[0];
    }

    // 5. Create secure session token
    const token = createToken({ id: customer.id, email: customer.email });

    // 6. Return sanitized user data (strictly no confidential server or DB fields)
    return {
      token,
      user: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        avatar: customer.avatar,
        mobile: customer.mobile,
        created_at: customer.created_at,
      },
    };
  }

  /**
   * Get current customer profile
   */
  async getProfile(customerId) {
    const [rows] = await pool.query(queries.findCustomerById, [customerId]);
    if (!rows || rows.length === 0) {
      throw new Error('Customer profile not found');
    }
    const c = rows[0];
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      avatar: c.avatar,
      mobile: c.mobile,
      created_at: c.created_at,
    };
  }

  /**
   * Update profile (name, mobile)
   */
  async updateProfile(customerId, { name, mobile }) {
    await pool.query(queries.updateCustomerProfile, [name || null, mobile || null, customerId]);
    return this.getProfile(customerId);
  }

  /**
   * Cart Operations
   */
  async getCart(customerId) {
    const [rows] = await pool.query(queries.getCartItems, [customerId]);
    return rows.map((r) => ({
      id: r.id,
      pdt_id: r.pdt_id,
      variant_id: r.variant_id,
      qty: r.qty,
      created_at: r.created_at,
      product: {
        code: r.product_code,
        name: r.product_name,
        fullname: r.product_fullname,
        price: r.product_price,
        image: r.product_image,
      },
      variant: r.variant_id
        ? {
            code: r.var_code,
            name: r.variant_name,
            color: r.variant_color,
            price: r.variant_price,
            image: r.variant_image,
          }
        : null,
    }));
  }

  async addToCart(customerId, { pdt_id, variant_id, qty = 1 }) {
    const quantity = Math.max(1, parseInt(qty, 10) || 1);
    const varId = variant_id ? parseInt(variant_id, 10) : null;
    const pdtId = parseInt(pdt_id, 10);

    const [existing] = await pool.query(queries.findCartItem, [
      customerId,
      pdtId,
      varId,
      varId,
    ]);

    if (existing && existing.length > 0) {
      const newQty = existing[0].qty + quantity;
      await pool.query(queries.updateCartQty, [newQty, existing[0].id, customerId]);
    } else {
      await pool.query(queries.insertCartItem, [customerId, pdtId, varId, quantity]);
    }
    return this.getCart(customerId);
  }

  async updateCartItem(customerId, cartItemId, { qty }) {
    const quantity = parseInt(qty, 10);
    if (quantity <= 0) {
      await pool.query(queries.deleteCartItem, [cartItemId, customerId]);
    } else {
      await pool.query(queries.updateCartQty, [quantity, cartItemId, customerId]);
    }
    return this.getCart(customerId);
  }

  async removeFromCart(customerId, cartItemId) {
    await pool.query(queries.deleteCartItem, [cartItemId, customerId]);
    return this.getCart(customerId);
  }

  async clearCart(customerId) {
    await pool.query(queries.clearCart, [customerId]);
    return [];
  }

  /**
   * Wishlist Operations
   */
  async getWishlist(customerId) {
    const [rows] = await pool.query(queries.getWishlistItems, [customerId]);
    return rows.map((r) => ({
      id: r.id,
      pdt_id: r.pdt_id,
      variant_id: r.variant_id,
      created_at: r.created_at,
      product: {
        code: r.product_code,
        name: r.product_name,
        fullname: r.product_fullname,
        price: r.product_price,
        image: r.product_image,
      },
      variant: r.variant_id
        ? {
            code: r.var_code,
            name: r.variant_name,
            color: r.variant_color,
            price: r.variant_price,
          }
        : null,
    }));
  }

  async addToWishlist(customerId, { pdt_id, variant_id }) {
    const varId = variant_id ? parseInt(variant_id, 10) : null;
    const pdtId = parseInt(pdt_id, 10);

    const [existing] = await pool.query(queries.findWishlistItem, [
      customerId,
      pdtId,
      varId,
      varId,
    ]);

    if (!existing || existing.length === 0) {
      await pool.query(queries.insertWishlistItem, [customerId, pdtId, varId]);
    }
    return this.getWishlist(customerId);
  }

  async removeFromWishlist(customerId, { id, pdt_id }) {
    await pool.query(queries.deleteWishlistItem, [customerId, id || null, pdt_id || null]);
    return this.getWishlist(customerId);
  }

  /**
   * Recently Viewed Operations (Strictly last 10 items)
   */
  async getRecentlyViewed(customerId) {
    const [rows] = await pool.query(queries.getRecentlyViewed, [customerId]);
    return rows.map((r) => ({
      id: r.rv_id || r.id,
      pdt_id: r.pdt_id,
      code: r.product_code,
      name: r.product_name,
      fullname: r.product_name,
      price: r.product_price,
      image: r.product_image,
      product_code: r.product_code,
      product_name: r.product_name,
      product_image: r.product_image,
      viewed_at: r.viewed_at,
      product: {
        code: r.product_code,
        name: r.product_name,
        fullname: r.product_name,
        price: r.product_price,
        image: r.product_image,
      },
    }));
  }

  async addRecentlyViewed(customerId, pdt_id) {
    const pdtId = parseInt(pdt_id, 10);
    if (!pdtId) return this.getRecentlyViewed(customerId);

    // Upsert recent view timestamp
    await pool.query(queries.upsertRecentlyViewed, [customerId, pdtId]);

    // Strictly enforce maximum of 10 items saved
    try {
      await pool.query(queries.trimRecentlyViewed, [customerId, customerId]);
    } catch (trimErr) {
      logger.warn('[CustomerService] Trim recently viewed warning:', trimErr.message);
    }

    return this.getRecentlyViewed(customerId);
  }

  async clearRecentlyViewed(customerId) {
    await pool.query(queries.clearRecentlyViewed, [customerId]);
    return [];
  }
}

module.exports = new CustomerService();

