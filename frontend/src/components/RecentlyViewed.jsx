import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resolveImageUrl } from '../api/catalogApi';
import { extractVariantSwatches } from '../utils/swatchUtils';

export default function RecentlyViewed() {
  const { isAuthenticated, recentlyViewed, isWishlisted, addToWishlist, removeFromWishlist } = useAuth();

  // If not logged in, or no recently viewed items yet, do not show the section
  if (!isAuthenticated || !Array.isArray(recentlyViewed) || recentlyViewed.length === 0) {
    return null;
  }

  // Strictly single row with fitted number of cards (5 items maximum).
  // Remaining items can be viewed in full on /profile?tab=recently-viewed
  const items = recentlyViewed.slice(0, 5);

  return (
    <div className="recents">
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="section-main-title mb-0 recent-section-title">Recently Viewed</h4>
              <Link to="/profile?tab=recently-viewed" className="btn-action-link recent-action-link">
                View History <i className="fas fa-chevron-right ms-1"></i>
              </Link>
            </div>
            <div
              className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3 flex-nowrap overflow-x-auto pb-2 pb-md-0"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {items.map((item, idx) => {
                const code = item.product?.code || item.product_code || item.code || '';
                const title = item.product?.fullname || item.product?.name || item.product_name || item.name || '';
                const image = resolveImageUrl(item.product?.image || item.product_image || item.image);
                const pdtId = item.pdt_id || item.product?.id || item.id;
                const swatches = extractVariantSwatches(item.product?.variants || item.variants);
                const isFav = isWishlisted ? (isWishlisted(pdtId) || isWishlisted(code)) : false;

                return (
                  <div className="col" key={item.id || idx}>
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
                            src={image || '/placeholder-hardware.png'}
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

                        {Array.isArray(swatches) && swatches.length > 0 && (
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
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
