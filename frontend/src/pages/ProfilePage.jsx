import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../api/catalogApi';
import { extractVariantSwatches } from '../utils/swatchUtils';
import Breadcrumb from '../components/Breadcrumb';

export default function ProfilePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get('tab') || 'profile';
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const {
    user,
    isAuthenticated,
    openLoginModal,
    updateProfile,
    cart,
    cartCount,
    updateCartQty,
    removeFromCart,
    clearCart,
    wishlist,
    wishlistCount,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    addToCart,
    recentlyViewed,
    recentlyViewedCount,
    clearRecentlyViewed,
  } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [mobileInput, setMobileInput] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  useEffect(() => {
    setActiveTab(activeTabParam);
  }, [activeTabParam]);

  useEffect(() => {
    if (user) {
      setNameInput(user.name || '');
      setMobileInput(user.mobile || '');
    }
  }, [user]);

  const switchTab = (tabName) => {
    setActiveTab(tabName);
    setSearchParams({ tab: tabName });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg('');
    try {
      await updateProfile({ name: nameInput, mobile: mobileInput });
      setIsEditing(false);
      setProfileSuccessMsg('Profile updated successfully!');
      setTimeout(() => setProfileSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const tabTitles = {
    profile: 'My Profile',
    wishlist: 'Wishlist',
    'recently-viewed': 'Recently Viewed',
    cart: 'My Cart',
  };

  const breadcrumbItems = [
    { label: tabTitles[activeTab] || 'My Profile' },
  ];

  if (!isAuthenticated) {
    return (
      <div className="profile-page-wrapper bg-white min-vh-70">
        <Breadcrumb items={breadcrumbItems} />
        <div className="site-container py-5 text-center">
          <div
            className="p-5 mx-auto rounded-4 bordezr bg-light shadow-xs"
            style={{ maxWidth: '520px' }}
          >
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 text-primary"
              style={{ width: '70px', height: '70px', backgroundColor: '#eef5fc', fontSize: '1.8rem' }}
            >
              <i className="fas fa-user-lock"></i>
            </div>
            <h3
              className="fw-bold mb-2"
              style={{ fontFamily: 'var(--taiton-font-heading)', color: '#002b5c' }}
            >
              Sign In to Your Account
            </h3>
            <p className="text-muted mb-4 small">
              Continue with Google to view your Profile, Cart, Wishlist, and your last 10 Recently Viewed items.
            </p>
            <button
              type="button"
              className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 shadow-sm"
              style={{ backgroundColor: '#0054a6', borderColor: '#0054a6' }}
              onClick={openLoginModal}
            >
              <i className="fab fa-google"></i> Continue with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate cart subtotal
  const cartSubtotal = cart.reduce((sum, item) => {
    const rawPrice = item.variant?.price || item.product?.price || 0;
    const numPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice).replace(/[^\d.]/g, '')) || 0;
    return sum + numPrice * (item.qty || 1);
  }, 0);

  return (
    <div className="profile-page-wrapper bg-white">
      <Breadcrumb items={breadcrumbItems} />

      <section className="py-4">
        <div className="site-container">
          {/* Tab Navigation */}
          <div className="d-flex flex-wrap align-items-center gap-2 mb-4 border-bottom pb-3">
            <button
              type="button"
              className={`btn rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${activeTab === 'profile'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-outline-secondary bg-white text-dark border'
                }`}
              style={activeTab === 'profile' ? { backgroundColor: '#0054a6', borderColor: '#0054a6' } : {}}
              onClick={() => switchTab('profile')}
            >
              <i className="far fa-user"></i> My Profile
            </button>
            <button
              type="button"
              className={`btn rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${activeTab === 'wishlist'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-outline-secondary bg-white text-dark border'
                }`}
              style={activeTab === 'wishlist' ? { backgroundColor: '#0054a6', borderColor: '#0054a6' } : {}}
              onClick={() => switchTab('wishlist')}
            >
              <i className="far fa-heart"></i> Wishlist
              <span className={`badge rounded-pill ${activeTab === 'wishlist' ? 'bg-white text-primary' : 'bg-light text-dark border'}`}>
                {wishlistCount}
              </span>
            </button>
            <button
              type="button"
              className={`btn rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${activeTab === 'recently-viewed'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-outline-secondary bg-white text-dark border'
                }`}
              style={activeTab === 'recently-viewed' ? { backgroundColor: '#0054a6', borderColor: '#0054a6' } : {}}
              onClick={() => switchTab('recently-viewed')}
            >
              <i className="far fa-clock"></i> Recently Viewed
              <span className={`badge rounded-pill ${activeTab === 'recently-viewed' ? 'bg-white text-primary' : 'bg-light text-dark border'}`}>
                {recentlyViewedCount}
              </span>
            </button>
            <button
              type="button"
              className={`btn rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 ${activeTab === 'cart'
                ? 'btn-primary text-white shadow-sm'
                : 'btn-outline-secondary bg-white text-dark border'
                }`}
              style={activeTab === 'cart' ? { backgroundColor: '#0054a6', borderColor: '#0054a6' } : {}}
              onClick={() => switchTab('cart')}
            >
              <i className="fas fa-shopping-cart"></i> My Cart
              <span className={`badge rounded-pill ${activeTab === 'cart' ? 'bg-white text-primary' : 'bg-light text-dark border'}`}>
                {cartCount}
              </span>
            </button>
          </div>


          {profileSuccessMsg && (
            <div className="alert alert-success alert-dismissible fade show rounded-3 py-2" role="alert">
              <i className="fas fa-check-circle me-2"></i> {profileSuccessMsg}
            </div>
          )}

          {/* TAB 1: Profile Details */}
          {activeTab === 'profile' && (
            <div className="row g-4">
              <div className="col-12 col-md-7">
                <div className="border rounded-4 p-4 bg-white shadow-xs">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5
                      className="fw-bold mb-0"
                      style={{ fontFamily: 'var(--taiton-font-heading)', color: '#002b5c' }}
                    >
                      Personal Information
                    </h5>
                    {!isEditing && (
                      <button
                        type="button"
                        className="btn btn-outline-primary btn-sm rounded-pill px-3"
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="fas fa-edit me-1"></i> Edit Details
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <form onSubmit={handleSaveProfile}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark">Full Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark">Email Address</label>
                        <input
                          type="email"
                          className="form-control bg-light"
                          value={user.email}
                          disabled
                        />
                        <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Email linked to your Google Account cannot be altered.
                        </span>
                      </div>
                      <div className="mb-4">
                        <label className="form-label small fw-semibold text-dark">Contact Phone / Mobile</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Enter your phone number"
                          value={mobileInput}
                          onChange={(e) => setMobileInput(e.target.value)}
                        />
                      </div>
                      <div className="d-flex gap-2">
                        <button
                          type="submit"
                          className="btn btn-primary rounded-pill px-4 fw-semibold"
                          style={{ backgroundColor: '#0054a6', borderColor: '#0054a6' }}
                          disabled={savingProfile}
                        >
                          {savingProfile ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary rounded-pill px-4"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Full Name</div>
                        <div className="fw-semibold text-dark">{user.name}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Email Address</div>
                        <div className="fw-semibold text-dark">{user.email}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Phone / Mobile</div>
                        <div className="fw-semibold text-dark">{user.mobile || 'Not provided'}</div>
                      </div>
                      <div className="col-12 col-sm-6">
                        <div className="text-muted small">Member Since</div>
                        <div className="fw-semibold text-dark">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Active Member'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="col-12 col-md-5">
                <div className="border rounded-4 p-4 bg-white shadow-xs">
                  <h5
                    className="fw-bold mb-3"
                    style={{ fontFamily: 'var(--taiton-font-heading)', color: '#002b5c' }}
                  >
                    Account Summary
                  </h5>
                  <div className="d-flex flex-column gap-3">
                    <div
                      className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light cursor-pointer"
                      onClick={() => switchTab('cart')}
                      role="button"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="fas fa-shopping-cart text-dark"></i>
                        <span className="fw-semibold text-dark">Cart Items</span>
                      </div>
                      <span className="badge bg-light text-dark border rounded-pill">{cartCount}</span>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light cursor-pointer"
                      onClick={() => switchTab('wishlist')}
                      role="button"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="far fa-heart text-dark"></i>
                        <span className="fw-semibold text-dark">Wishlist Items</span>
                      </div>
                      <span className="badge bg-light text-dark border rounded-pill">{wishlistCount}</span>
                    </div>

                    <div
                      className="d-flex align-items-center justify-content-between p-3 rounded-3 bg-light cursor-pointer"
                      onClick={() => switchTab('recently-viewed')}
                      role="button"
                    >
                      <div className="d-flex align-items-center gap-2">
                        <i className="far fa-clock text-dark"></i>
                        <span className="fw-semibold text-dark">Recently Viewed (Last 10)</span>
                      </div>
                      <span className="badge bg-light text-dark border rounded-pill">{recentlyViewedCount}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: My Cart */}
          {activeTab === 'cart' && (
            <div>
              {cart.length === 0 ? (
                <div className="text-center py-5 border rounded-4 bg-light">
                  <i className="fas fa-shopping-cart fa-3x text-muted mb-3 opacity-50"></i>
                  <h5 className="fw-bold text-dark mb-2">Your Cart is Empty</h5>
                  <p className="text-muted small mb-4">Explore our architectural hardware collections and add items to your cart.</p>
                  <Link to="/products" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold" style={{ backgroundColor: '#0054a6' }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="row g-4">
                  <div className="col-12 col-lg-8">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5 className="fw-bold mb-0" style={{ fontFamily: 'var(--taiton-font-heading)', color: '#002b5c' }}>
                        Cart Items ({cartCount})
                      </h5>
                      <button
                        type="button"
                        className="btn btn-link text-danger text-decoration-none small p-0"
                        onClick={clearCart}
                      >
                        <i className="fas fa-trash-alt me-1"></i> Clear Cart
                      </button>
                    </div>

                    <div className="d-flex flex-column gap-3">
                      {cart.map((item) => (
                        <div key={item.id} className="border rounded-3 p-3 bg-white shadow-xs d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
                          <div className="d-flex align-items-center gap-3">
                            <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                              <img
                                src={resolveImageUrl(item.variant?.image || item.product?.image)}
                                alt={item.product?.code || 'Product'}
                                className="w-100 h-100 object-fit-contain rounded border p-1"
                              />
                            </div>
                            <div>
                              <Link
                                to={`/product-detail?code=${encodeURIComponent(item.product?.code || '')}`}
                                className="fw-bold text-dark text-decoration-none hover-blue"
                              >
                                {item.product?.code}
                              </Link>
                              <div className="text-muted small mb-1">{item.product?.name}</div>
                              {item.variant?.color && (
                                <span className="badge bg-light text-dark border small me-2">
                                  Finish: {item.variant.color}
                                </span>
                              )}
                              {item.product?.price && (
                                <div className="fw-bold text-primary small">
                                  {item.product.price}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="d-flex align-items-center gap-3">
                            <div className="input-group input-group-sm" style={{ width: '110px' }}>
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => updateCartQty(item.id, Math.max(1, item.qty - 1))}
                              >
                                -
                              </button>
                              <span className="input-group-text bg-white fw-bold px-3">{item.qty}</span>
                              <button
                                className="btn btn-outline-secondary"
                                type="button"
                                onClick={() => updateCartQty(item.id, item.qty + 1)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              type="button"
                              className="btn btn-link text-danger p-1"
                              title="Remove item"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="col-12 col-lg-4">
                    <div className="border rounded-4 p-4 bg-white shadow-xs position-sticky" style={{ top: '100px' }}>
                      <h5 className="fw-bold mb-3" style={{ fontFamily: 'var(--taiton-font-heading)', color: '#002b5c' }}>
                        Cart Summary
                      </h5>
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted">Total Products:</span>
                        <span className="fw-bold text-dark">{cart.length}</span>
                      </div>
                      <div className="d-flex justify-content-between py-2 border-bottom">
                        <span className="text-muted">Total Quantity:</span>
                        <span className="fw-bold text-dark">{cartCount} items</span>
                      </div>
                      {cartSubtotal > 0 && (
                        <div className="d-flex justify-content-between py-2 border-bottom">
                          <span className="text-muted">Estimated Price:</span>
                          <span className="fw-bold text-primary fs-5">₹{cartSubtotal.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="mt-4 d-grid gap-2">
                        <Link
                          to="/contact-us"
                          className="btn btn-primary rounded-pill py-2 fw-semibold"
                          style={{ backgroundColor: '#0054a6', borderColor: '#0054a6' }}
                        >
                          Request Project Quote
                        </Link>
                        <Link to="/products" className="btn btn-outline-secondary rounded-pill py-2 small">
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Wishlist */}
          {activeTab === 'wishlist' && (
            <div>
              {wishlist.length === 0 ? (
                <div className="text-center py-5 border rounded-4 bg-light">
                  <i className="far fa-heart fa-3x text-muted mb-3 opacity-50"></i>
                  <h5 className="fw-bold text-dark mb-2">Your Wishlist is Empty</h5>
                  <p className="text-muted small mb-4">Click the heart icon on any product to save it to your wishlist.</p>
                  <Link to="/products" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold" style={{ backgroundColor: '#0054a6' }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="row g-2 g-sm-3 g-md-4 mb-4">
                  {wishlist.map((item) => {
                    const code = item.code || item.product?.code || item.product_code || '';
                    const title = item.name || item.product?.name || item.product_name || '';
                    const img = resolveImageUrl(item.image || item.product?.image || item.product_image || item.variant?.image);
                    const pdtId = item.pdt_id || item.id;

                    return (
                      <div className="col-6 col-md-4 col-lg-3" key={item.id}>
                        <div className="product-listing-card">
                          <button
                            type="button"
                            className="product-listing-card-fav active"
                            aria-label="Remove from Wishlist"
                            title="Remove from Wishlist"
                            onClick={() => removeFromWishlist(item.id || pdtId)}
                          >
                            <i className="fas fa-heart text-danger"></i>
                          </button>

                          <div className="product-listing-card-img-wrap">
                            <Link
                              to={`/product-detail?code=${encodeURIComponent(code)}`}
                              className="text-decoration-none d-flex align-items-center justify-content-center w-100 h-100"
                            >
                              <img
                                src={img || '/placeholder-hardware.png'}
                                alt={`${code} ${title}`}
                                className="product-listing-card-img"
                                onError={(e) => { e.currentTarget.src = '/placeholder-hardware.png'; }}
                              />
                            </Link>
                          </div>

                          <div className="product-listing-card-body">
                            <Link to={`/product-detail?code=${encodeURIComponent(code)}`} className="text-decoration-none">
                              <div className="product-listing-card-code">{code}</div>
                              <div className="product-listing-card-title" title={title}>
                                {title}
                              </div>
                            </Link>

                            {item.variantName && (
                              <div className="mb-2">
                                <span className="badge bg-light text-secondary border small" style={{ fontSize: '0.72rem' }}>
                                  Finish: {item.variantName}
                                </span>
                              </div>
                            )}

                            <div className="pt-2 border-top mt-auto">
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm rounded-pill w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                                style={{ fontSize: '0.8rem' }}
                                onClick={() => {
                                  addToCart(pdtId, item.variant_id, 1);
                                  removeFromWishlist(item.id || pdtId);
                                }}
                              >
                                <i className="fas fa-shopping-cart"></i> Move to Cart
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: Recently Viewed (Strictly Last 10 items) */}
          {activeTab === 'recently-viewed' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold mb-0" style={{ fontFamily: 'var(--taiton-font-heading)', color: '#002b5c' }}>
                    Recently Viewed Products
                  </h5>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                    Showing your browsing history ({recentlyViewed.length} {recentlyViewed.length === 1 ? 'product' : 'products'})
                  </span>
                </div>
                {recentlyViewed.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link text-danger text-decoration-none small p-0"
                    onClick={clearRecentlyViewed}
                  >
                    <i className="fas fa-trash-alt me-1"></i> Clear History
                  </button>
                )}
              </div>

              {recentlyViewed.length === 0 ? (
                <div className="text-center py-5 border rounded-4 bg-light">
                  <i className="fas fa-history fa-3x text-muted mb-3 opacity-50"></i>
                  <h5 className="fw-bold text-dark mb-2">No Recently Viewed Products</h5>
                  <p className="text-muted small mb-4">Products you browse will automatically appear here.</p>
                  <Link to="/products" className="btn btn-primary rounded-pill px-4 py-2 fw-semibold" style={{ backgroundColor: '#0054a6' }}>
                    Browse Products
                  </Link>
                </div>
              ) : (
                <div className="row g-2 g-sm-3 g-md-4 mb-4">
                  {recentlyViewed.map((item, idx) => {
                    const code = item.product?.code || item.product_code || item.code || '';
                    const title = item.product?.fullname || item.product?.name || item.product_name || item.name || '';
                    const img = resolveImageUrl(item.product?.image || item.product_image || item.image);
                    const pdtId = item.pdt_id || item.product?.id || item.id;
                    const isFav = isWishlisted ? isWishlisted(pdtId) : false;

                    return (
                      <div className="col-6 col-md-4 col-lg-3" key={idx}>
                        <div className="product-listing-card">
                          <button
                            type="button"
                            className={`product-listing-card-fav ${isFav ? 'active' : ''}`}
                            aria-label={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                            onClick={async () => {
                              if (isFav) {
                                await removeFromWishlist(pdtId);
                              } else {
                                await addToWishlist(pdtId, null);
                              }
                            }}
                          >
                            <i className={`${isFav ? 'fas text-danger' : 'far'} fa-heart`}></i>
                          </button>

                          <div className="product-listing-card-img-wrap">
                            <Link
                              to={`/product-detail?code=${encodeURIComponent(code)}`}
                              className="text-decoration-none d-flex align-items-center justify-content-center w-100 h-100"
                            >
                              <img
                                src={img || '/placeholder-hardware.png'}
                                alt={`${code} ${title}`}
                                className="product-listing-card-img"
                                onError={(e) => { e.currentTarget.src = '/placeholder-hardware.png'; }}
                              />
                            </Link>
                          </div>

                          <div className="product-listing-card-body">
                            <Link to={`/product-detail?code=${encodeURIComponent(code)}`} className="text-decoration-none">
                              <div className="product-listing-card-code">{code}</div>
                              <div className="product-listing-card-title" title={title}>
                                {title}
                              </div>
                            </Link>

                            {(() => {
                              const swatches = extractVariantSwatches(item.product?.variants || item.variants);
                              if (!Array.isArray(swatches) || swatches.length === 0) return null;
                              return (
                                <div className="product-listing-card-swatches">
                                  {swatches.slice(0, 5).map((sw) => (
                                    <span
                                      key={sw.name}
                                      className={`product-listing-swatch ${sw.dotClass}`}
                                      title={sw.label}
                                      style={sw.style || {}}
                                    />
                                  ))}
                                  {swatches.length > 5 && (
                                    <span className="product-listing-swatch-count">
                                      +{swatches.length - 5}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

