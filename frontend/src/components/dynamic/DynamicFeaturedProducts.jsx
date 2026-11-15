import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../api/catalogApi';

export default function DynamicFeaturedProducts({ config }) {
  if (!config || !Array.isArray(config.items) || config.items.length === 0) return null;

  const title = config.title || 'Featured Products';
  const rangeText = 'View Our Products';
  const rangeUrl = config.rangeUrl || '/products';
  const fullRangeButtonText = 'View Our Products';
  const fullRangeButtonUrl = config.fullRangeButtonUrl || config.rangeUrl || '/products';
  const items = Array.isArray(config.items) ? config.items : [];

  return (
    <div className="products">
      <section className="py-5 bg-white dynamic-featured-products-section">
        <div className="site-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="section-main-title mb-0">{title}</h3>
            <Link to={rangeUrl} className="btn-action-link">
              {rangeText} <i className="fas fa-arrow-right"></i>
            </Link>
          </div>

          <div className="row g-4">
            {items.map((product, idx) => (
              <div key={product.id || idx} className="col-12 col-sm-6 col-lg-3">
                <div className="product-card h-100 d-flex flex-column">
                  {product.image && (
                    <img
                      src={resolveImageUrl(product.image)}
                      alt={product.title || 'Product'}
                      className="product-card-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  <div className="p-3 d-flex flex-column flex-grow-1">
                    <h6 className="fw-bold text-dark mb-2 product-card-title">{product.title}</h6>
                    {product.description && (
                      <p className="text-muted small mb-3 flex-grow-1 product-card-desc">
                        {product.description}
                      </p>
                    )}
                    <Link to={product.linkUrl || product.url || '/products'} className="card-view-more">
                      {product.linkText || 'Know More'} <i className="fas fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-5">
            <Link to={fullRangeButtonUrl} className="btn btn-taiton-primary">
              {fullRangeButtonText} <i className="fas fa-arrow-right ms-2"></i>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
