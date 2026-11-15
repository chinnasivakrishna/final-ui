const customerService = require('../services/customer.service');
const logger = require('../../utils/logger');

class CustomerController {
  /**
   * Google Sign In / Sign Up
   */
  async googleAuth(req, res) {
    try {
      const { credential } = req.body;
      if (!credential) {
        return res.status(400).json({
          success: false,
          message: 'Credential is required for Google Sign-In',
        });
      }

      const result = await customerService.handleGoogleAuth(credential);
      return res.status(200).json({
        success: true,
        message: 'Authentication successful',
        token: result.token,
        user: result.user,
      });
    } catch (err) {
      logger.error('[CustomerController] Google auth error:', err.message);
      return res.status(401).json({
        success: false,
        message: err.message || 'Google authentication failed',
      });
    }
  }

  /**
   * Profile
   */
  async getProfile(req, res) {
    try {
      const user = await customerService.getProfile(req.customer.id);
      return res.status(200).json({ success: true, user });
    } catch (err) {
      logger.error('[CustomerController] Get profile error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const { name, mobile } = req.body;
      const user = await customerService.updateProfile(req.customer.id, { name, mobile });
      return res.status(200).json({ success: true, user });
    } catch (err) {
      logger.error('[CustomerController] Update profile error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Cart
   */
  async getCart(req, res) {
    try {
      const cart = await customerService.getCart(req.customer.id);
      return res.status(200).json({ success: true, cart });
    } catch (err) {
      logger.error('[CustomerController] Get cart error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async addToCart(req, res) {
    try {
      const { pdt_id, variant_id, qty } = req.body;
      if (!pdt_id) {
        return res.status(400).json({ success: false, message: 'pdt_id is required' });
      }
      const cart = await customerService.addToCart(req.customer.id, { pdt_id, variant_id, qty });
      return res.status(200).json({ success: true, cart });
    } catch (err) {
      logger.error('[CustomerController] Add to cart error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async updateCartItem(req, res) {
    try {
      const { id } = req.params;
      const { qty } = req.body;
      const cart = await customerService.updateCartItem(req.customer.id, id, { qty });
      return res.status(200).json({ success: true, cart });
    } catch (err) {
      logger.error('[CustomerController] Update cart item error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async removeFromCart(req, res) {
    try {
      const { id } = req.params;
      const cart = await customerService.removeFromCart(req.customer.id, id);
      return res.status(200).json({ success: true, cart });
    } catch (err) {
      logger.error('[CustomerController] Remove from cart error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async clearCart(req, res) {
    try {
      const cart = await customerService.clearCart(req.customer.id);
      return res.status(200).json({ success: true, cart });
    } catch (err) {
      logger.error('[CustomerController] Clear cart error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Wishlist
   */
  async getWishlist(req, res) {
    try {
      const wishlist = await customerService.getWishlist(req.customer.id);
      return res.status(200).json({ success: true, wishlist });
    } catch (err) {
      logger.error('[CustomerController] Get wishlist error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async addToWishlist(req, res) {
    try {
      const { pdt_id, variant_id } = req.body;
      if (!pdt_id) {
        return res.status(400).json({ success: false, message: 'pdt_id is required' });
      }
      const wishlist = await customerService.addToWishlist(req.customer.id, { pdt_id, variant_id });
      return res.status(200).json({ success: true, wishlist });
    } catch (err) {
      logger.error('[CustomerController] Add to wishlist error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async removeFromWishlist(req, res) {
    try {
      const { id } = req.params;
      const wishlist = await customerService.removeFromWishlist(req.customer.id, { id, pdt_id: id });
      return res.status(200).json({ success: true, wishlist });
    } catch (err) {
      logger.error('[CustomerController] Remove from wishlist error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Recently Viewed (strictly last 10)
   */
  async getRecentlyViewed(req, res) {
    try {
      const items = await customerService.getRecentlyViewed(req.customer.id);
      return res.status(200).json({ success: true, items });
    } catch (err) {
      logger.error('[CustomerController] Get recently viewed error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async addRecentlyViewed(req, res) {
    try {
      const { pdt_id } = req.body;
      if (!pdt_id) {
        return res.status(400).json({ success: false, message: 'pdt_id is required' });
      }
      const items = await customerService.addRecentlyViewed(req.customer.id, pdt_id);
      return res.status(200).json({ success: true, items });
    } catch (err) {
      logger.error('[CustomerController] Add recently viewed error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  async clearRecentlyViewed(req, res) {
    try {
      const items = await customerService.clearRecentlyViewed(req.customer.id);
      return res.status(200).json({ success: true, items });
    } catch (err) {
      logger.error('[CustomerController] Clear recently viewed error:', err.message);
      return res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = new CustomerController();

