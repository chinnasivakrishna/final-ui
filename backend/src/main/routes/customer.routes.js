const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customer.controller');
const { requireAuth } = require('../../utils/auth');

// Public Google Authentication
router.post('/auth/google', (req, res) => customerController.googleAuth(req, res));

// Protected Customer Profile
router.get('/customer/profile', requireAuth, (req, res) => customerController.getProfile(req, res));
router.put('/customer/profile', requireAuth, (req, res) => customerController.updateProfile(req, res));

// Protected Cart Endpoints
router.get('/customer/cart', requireAuth, (req, res) => customerController.getCart(req, res));
router.post('/customer/cart', requireAuth, (req, res) => customerController.addToCart(req, res));
router.put('/customer/cart/:id', requireAuth, (req, res) => customerController.updateCartItem(req, res));
router.delete('/customer/cart/:id', requireAuth, (req, res) => customerController.removeFromCart(req, res));
router.delete('/customer/cart', requireAuth, (req, res) => customerController.clearCart(req, res));

// Protected Wishlist Endpoints
router.get('/customer/wishlist', requireAuth, (req, res) => customerController.getWishlist(req, res));
router.post('/customer/wishlist', requireAuth, (req, res) => customerController.addToWishlist(req, res));
router.delete('/customer/wishlist/:id', requireAuth, (req, res) => customerController.removeFromWishlist(req, res));

// Protected Recently Viewed Endpoints (strictly last 10)
router.get('/customer/recently-viewed', requireAuth, (req, res) => customerController.getRecentlyViewed(req, res));
router.post('/customer/recently-viewed', requireAuth, (req, res) => customerController.addRecentlyViewed(req, res));
router.delete('/customer/recently-viewed', requireAuth, (req, res) => customerController.clearRecentlyViewed(req, res));

module.exports = router;

