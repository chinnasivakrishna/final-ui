import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProductDetail, fetchProducts, resolveImageUrl } from '../api/catalogApi';
import Breadcrumb from '../components/Breadcrumb';
import { extractVariantSwatches } from '../utils/swatchUtils';
import { useAuth } from '../context/AuthContext';

const COLOR_NAMES_MAP = {
  SSS: 'Satin Stainless Steel',
  PSS: 'Polished Stainless Steel',
  BM: 'Black Matte',
  'Rose Gold': 'Rose Gold M PVD',
  GOLD: 'Gold M PVD'
};

function mapRelatedProductCard(p) {
  return {
    id: p.code || String(p.id),
    pdtId: p.id || p.pdt_id || null,
    code: p.code || String(p.id),
    title: p.fullname || p.name || '',
    img: resolveImageUrl(p.image) || '',
    swatches: extractVariantSwatches(p.variants),
  };
}

export default function ProductDetailPage() {
  const [searchParams] = useSearchParams();
  const prodId = searchParams.get('code') || searchParams.get('id') || '';

  const {
    addToCart,
    addToWishlist,
    removeFromWishlist,
    isWishlisted,
    recordProductView,
  } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loadedProdId, setLoadedProdId] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [cartAdded, setCartAdded] = useState(false);
  const [quoteRequested, setQuoteRequested] = useState(false);

  const [featuresOpen, setFeaturesOpen] = useState(true);
  const [productDataOpen, setProductDataOpen] = useState(true);
  const [technicalOpen, setTechnicalOpen] = useState(false);
  const [uspOpen, setUspOpen] = useState(false);
  const [applicationsOpen, setApplicationsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const loadDetailAndRelated = async () => {
      try {
        const data = prodId ? await fetchProductDetail(prodId) : null;
        if (!mounted) return;

        setActiveImageIndex(0);
        if (!data) {
          setProduct(null);
          setRelatedProducts([]);
          return;
        }

        const mapped = {
          id: data.id,
          code: data.code || prodId,
          fullname: data.fullname || data.name || '',
          price: data.price ? (String(data.price).startsWith('₹') ? data.price : `₹${data.price}`) : '',
          category: data.category || '',
          categoryId: data.categoryId,
          rootCategoryId: data.rootCategoryId || data.categoryId,
          subcategory: data.subcategory || '',
          subcategoryId: data.subcategoryId || data.subId || null,
          subSubcategory: data.subSubcategory || '',
          subSubcategoryId: data.subSubcategoryId || null,
          images: Array.isArray(data.images) && data.images.length > 0
            ? data.images.map((img) => resolveImageUrl(img)).filter(Boolean)
            : (data.image ? [resolveImageUrl(data.image)].filter(Boolean) : []),
          features: Array.isArray(data.features) ? data.features : [],
          data: Array.isArray(data.specifications) && data.specifications.length > 0
            ? data.specifications.map((s) => ({ label: `${s.label || s.key || s[0] || 'Specification'}:`, value: s.value || s[1] || '' }))
            : (Array.isArray(data.data) ? data.data : []),
          variants: Array.isArray(data.variants) ? data.variants : [],
          dimensions: Array.isArray(data.dimensions) ? data.dimensions : [],
          usp: Array.isArray(data.usp)
            ? data.usp
            : (typeof data.usp === 'string' && data.usp.trim() ? [data.usp] : []),
          applications: Array.isArray(data.applications)
            ? data.applications
            : (typeof data.applications === 'string' && data.applications.trim() ? [data.applications] : []),
        };
        setProduct(mapped);
        recordProductView(mapped);
        if (mapped.variants && mapped.variants.length > 0) {
          setSelectedColor(mapped.variants[0].color || mapped.variants[0].colour || mapped.variants[0].name || '');
        }

        const isSameProduct = (p) =>
          (data.id != null && String(p.id) === String(data.id)) ||
          (data.code && String(p.code || '') === String(data.code)) ||
          (prodId && String(p.code || p.id) === String(prodId));

        const seen = new Set();
        const collected = [];
        const addUnique = (list) => {
          if (!Array.isArray(list)) return;
          for (const item of list) {
            if (isSameProduct(item)) continue;
            const key = String(item.code || item.id);
            if (seen.has(key)) continue;
            seen.add(key);
            collected.push(item);
            if (collected.length >= 5) break;
          }
        };

        const primaryCatTarget = data.subSubcategoryId || data.categoryId || data.subcategoryId;
        if (primaryCatTarget) {
          const sameGroup = await fetchProducts({ catId: primaryCatTarget, limit: 12 });
          if (!mounted) return;
          addUnique(sameGroup);
        }

        if (collected.length < 5 && data.subcategoryId && String(data.subcategoryId) !== String(primaryCatTarget)) {
          const subGroup = await fetchProducts({ catId: data.subcategoryId, limit: 12 });
          if (!mounted) return;
          addUnique(subGroup);
        }

        setRelatedProducts(collected.slice(0, 5).map(mapRelatedProductCard));
      } finally {
        if (mounted) setLoadedProdId(prodId);
      }
    };

    loadDetailAndRelated();

    return () => { mounted = false; };
  }, [prodId]);

  const loading = loadedProdId !== prodId;

  const isFavorite = product?.id ? isWishlisted(product.id) : false;

  const handleWishlistToggle = async () => {
    if (!product?.id) return;
    if (isFavorite) {
      await removeFromWishlist(product.id);
    } else {
      const activeVariant = product.variants?.find(
        (v) => (v.color || v.colour || v.name || '').toLowerCase() === String(selectedColor || '').toLowerCase()
      );
      await addToWishlist(product.id, activeVariant?.id || null);
    }
  };

  const handleCartClick = async () => {
    if (!product?.id) return;
    const activeVariant = product.variants?.find(
      (v) => (v.color || v.colour || v.name || '').toLowerCase() === String(selectedColor || '').toLowerCase()
    );
    const ok = await addToCart(product.id, activeVariant?.id || null, 1);
    if (ok) {
      setCartAdded(true);
      setTimeout(() => setCartAdded(false), 2500);
    }
  };

  const handleQuoteClick = () => {
    setQuoteRequested(true);
    setTimeout(() => setQuoteRequested(false), 2500);
  };

  if (loading || !product) {
    return (
      <div className="product-detail-page bg-white py-5 text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <div className="text-muted small fw-semibold">Loading Product Details...</div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Products', url: '/products' },
    ...(product.category
      ? [{ label: product.category, url: `/product-category?catId=${product.rootCategoryId || product.categoryId || ''}` }]
      : []),
    ...(product.subcategory && product.subcategory !== product.category
      ? [{ label: product.subcategory, url: `/product-category?catId=${product.rootCategoryId || product.categoryId || ''}&subId=${product.subcategoryId || ''}` }]
      : []),
    ...(product.subSubcategory && product.subSubcategory !== product.subcategory && product.subSubcategory !== product.category
      ? [{ label: product.subSubcategory, url: `/product-list?catId=${product.subSubcategoryId || product.categoryId || ''}` }]
      : []),
    { label: product.code.includes('-') && !product.code.includes(' - ') ? product.code.replace('-', ' - ') : product.code }
  ];

  const swatchList = extractVariantSwatches(product.variants);

  const formattedCode = product.code && product.code.includes('-') && !product.code.includes(' - ')
    ? product.code.replace('-', ' - ')
    : (product.code || '');

  const baseTitle = product.fullname && product.fullname.includes('|')
    ? product.fullname.split('|')[0].trim()
    : (product.fullname || '');
  const finishLabel = COLOR_NAMES_MAP[selectedColor] || selectedColor || '';
  const displayFullname = finishLabel && baseTitle ? `${baseTitle} | ${finishLabel}` : baseTitle;

  return (
    <div className="product-detail-page bg-white">
      <Breadcrumb items={breadcrumbItems} />

      <section className="py-3 bg-white">
        <div className="site-container">
          <div className="row g-4 align-items-start">

            <div className="col-12 col-lg-6">
              <div className="d-flex gap-2 gap-md-3 flex-column flex-md-row align-items-start">

                <div className="gallery-thumbs-col order-3 order-md-1">


                  {product.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className={`pdt-detail-thumb-box ${activeImageIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImageIndex(idx)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View Image ${idx + 1}`}
                      onKeyDown={(e) => { if (e.key === 'Enter') setActiveImageIndex(idx); }}
                    >
                      <img src={imgUrl} alt={`Thumb ${idx + 1}`} />
                    </div>
                  ))}
                </div>

                <div className="pdt-detail-main-img-wrap flex-grow-1 w-100 order-2 order-md-2 position-relative">
                  {/* Floating Action Buttons on Top Right of Main Image */}
                  <div className="position-absolute top-0 end-0 m-3 d-flex flex-column gap-2" style={{ zIndex: 5 }}>
                    {/* Wishlist Button */}
                    <button
                      type="button"
                      className={`btn rounded-circle shadow-sm d-flex align-items-center justify-content-center pdt-img-action-btn ${isFavorite ? 'active text-danger' : 'text-secondary'
                        }`}
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s ease',
                        padding: 0
                      }}
                      title={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      aria-label={isFavorite ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      onClick={handleWishlistToggle}
                    >
                      <i className={`${isFavorite ? 'fas text-danger' : 'far'} fa-heart fs-6`}></i>
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      className="btn rounded-circle shadow-sm d-flex align-items-center justify-content-center pdt-img-action-btn text-secondary"
                      style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        transition: 'all 0.2s ease',
                        padding: 0
                      }}
                      title="Share Product"
                      aria-label="Share Product"
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({ title: product.code, url: window.location.href });
                        } else {
                          navigator.clipboard?.writeText(window.location.href);
                          alert('Product link copied to clipboard!');
                        }
                      }}
                    >
                      <i className="fas fa-share-alt fs-6"></i>
                    </button>
                  </div>

                  <img
                    id="main-product-img"
                    className="pdt-detail-main-img"
                    src={product.images[activeImageIndex] || product.images[0]}
                    alt={`${product.code} Main Product`}
                  />
                </div>

              </div>
            </div>

            <div className="col-12 col-lg-6">

              <div className="mb-1">
                <h1 className="prod-detail-code mb-0">
                  {formattedCode}
                </h1>
              </div>

              <div className="prod-detail-fullname mb-2">
                {displayFullname}
              </div>

              {swatchList.length > 0 && (
                <div className="mb-2">
                  <div className="prod-swatch-label mb-1 text-muted" style={{ fontSize: '0.88rem' }}>
                    Color : <span className="text-dark fw-bold">{selectedColor}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    {swatchList.map((opt) => (
                      <button
                        key={opt.name}
                        type="button"
                        className={`color-swatch-square ${selectedColor === opt.name ? 'active' : ''} ${opt.dotClass}`}
                        style={opt.style}
                        onClick={() => setSelectedColor(opt.name)}
                        title={opt.label || opt.name}
                        aria-label={opt.label || opt.name}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-2" style={{ fontSize: '0.95rem' }}>
                {(() => {
                  const activeVariant = product.variants?.find(
                    (v) => (v.color || v.colour || v.name || '').toLowerCase() === String(selectedColor || '').toLowerCase()
                  );
                  const mrpValue = (activeVariant?.price || product.price || '').replace('₹', '');
                  return (
                    <span className="fw-bold text-dark">
                      MRP : {mrpValue} /{' '}
                    </span>
                  );
                })()}
                <Link to="/contact-us" className="text-primary fw-semibold text-decoration-none">
                  Log in to See Price
                </Link>
              </div>

              <div className="d-flex align-items-center gap-2 mb-3">
                <button
                  type="button"
                  className="btn-outline-action flex-fill text-center justify-content-center"
                  style={{ width: 'auto', flex: '1 1 0', minWidth: 0, padding: '8px 12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  onClick={handleQuoteClick}
                >
                  <i className={`fas ${quoteRequested ? 'fa-check text-success' : 'fa-file-alt'}`}></i>
                  <span>{quoteRequested ? 'Quote Requested!' : 'Get a Quote'}</span>
                </button>
                <button
                  type="button"
                  className="btn-outline-action flex-fill text-center justify-content-center"
                  style={{ width: 'auto', flex: '1 1 0', minWidth: 0, padding: '8px 12px', fontSize: '0.85rem', whiteSpace: 'nowrap' }}
                  onClick={handleCartClick}
                >
                  <i className={`fas ${cartAdded ? 'fa-check text-success' : 'fa-shopping-cart'}`}></i>
                  <span>{cartAdded ? 'Added to Cart!' : 'Add to Cart'}</span>
                </button>
              </div>

              <div className="mb-2 pt-1">
                <div className="d-flex flex-wrap align-items-center justify-content-start gap-2 gap-sm-3">
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" style={{ width: '30px', height: '30px', background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 100%)', color: '#fff', fontSize: '0.78rem' }}>
                      <i className="fas fa-mobile-alt"></i>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.73rem', whiteSpace: 'nowrap' }}>Mobile App</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" style={{ width: '30px', height: '30px', background: '#10b981', color: '#fff', fontSize: '0.78rem' }}>
                      <i className="fas fa-fingerprint"></i>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.73rem', whiteSpace: 'nowrap' }}>Fingerprint</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" style={{ width: '30px', height: '30px', background: '#f59e0b', color: '#fff', fontSize: '0.78rem' }}>
                      <i className="fas fa-key"></i>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.73rem', whiteSpace: 'nowrap' }}>Password</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" style={{ width: '30px', height: '30px', background: '#3b82f6', color: '#fff', fontSize: '0.78rem' }}>
                      <i className="fas fa-id-card"></i>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.73rem', whiteSpace: 'nowrap' }}>RFID Card</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="rounded-circle d-flex align-items-center justify-content-center shadow-xs flex-shrink-0" style={{ width: '30px', height: '30px', background: '#06b6d4', color: '#fff', fontSize: '0.78rem' }}>
                      <i className="fas fa-unlock-alt"></i>
                    </div>
                    <span className="text-muted" style={{ fontSize: '0.73rem', whiteSpace: 'nowrap' }}>Emergency Key</span>
                  </div>
                </div>
              </div>

              <div className="accordion custom-detail-accordion mb-2" id="productDetailAccordion">

                <div className="accordion-item border-0 border-bottom">
                  <h2 className="accordion-header" id="headingFeatures">
                    <button
                      className="accordion-button bg-transparent shadow-none px-0 fw-bold text-dark d-flex align-items-center justify-content-between w-100"
                      type="button"
                      onClick={() => setFeaturesOpen(!featuresOpen)}
                      aria-expanded={featuresOpen}
                    >
                      <span className="fw-bold" style={{ fontSize: '0.96rem' }}>Features</span>
                      <i className={`fas ${featuresOpen ? 'fa-minus-circle text-primary' : 'fa-plus-circle text-muted'} fs-6`}></i>
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${featuresOpen ? 'show' : ''}`}
                    aria-labelledby="headingFeatures"
                  >
                    <div className="accordion-body px-0 py-1 text-secondary">
                      <ul className="ps-3 mb-2 lh-base" style={{ fontSize: '0.78rem' }}>
                        {product.features.map((feat, fIdx) => (
                          <li key={fIdx}>{feat}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 border-bottom">
                  <h2 className="accordion-header" id="headingData">
                    <button
                      className="accordion-button bg-transparent shadow-none px-0 fw-bold text-dark d-flex align-items-center justify-content-between w-100"
                      type="button"
                      onClick={() => setProductDataOpen(!productDataOpen)}
                      aria-expanded={productDataOpen}
                    >
                      <span className="fw-bold text-uppercase" style={{ fontSize: '0.92rem', letterSpacing: '0.5px' }}>PRODUCT DATA</span>
                      <i className={`fas ${productDataOpen ? 'fa-minus-circle text-primary' : 'fa-plus-circle text-muted'} fs-6`}></i>
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${productDataOpen ? 'show' : ''}`}
                    aria-labelledby="headingData"
                  >
                    <div className="accordion-body px-0 py-1 pb-2">
                      <div className="table-responsive rounded border">
                        <table className="table table-sm table-bordered mb-0 text-center align-middle" style={{ fontSize: '0.72rem' }}>
                          <thead style={{ backgroundColor: '#0a2f7a', color: '#ffffff' }}>
                            <tr>
                              <th className="py-1 px-2" style={{ backgroundColor: '#0a2f7a', color: '#fff' }}>Product Code</th>
                              <th className="py-1 px-2" style={{ backgroundColor: '#0a2f7a', color: '#fff' }}>Size (A)</th>
                              <th className="py-1 px-2" style={{ backgroundColor: '#0a2f7a', color: '#fff' }}>Handle Diameter (B)</th>
                              <th className="py-1 px-2" style={{ backgroundColor: '#0a2f7a', color: '#fff' }}>Center to Center (C)</th>
                              <th className="py-1 px-2" style={{ backgroundColor: '#0a2f7a', color: '#fff' }}>Overall Length (L)</th>
                              <th className="py-1 px-2" style={{ backgroundColor: '#0a2f7a', color: '#fff' }}>Projection (P)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Array.isArray(product.dimensions) && product.dimensions.length > 0 ? (
                              product.dimensions.map((row, rIdx) => (
                                <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-light' : 'bg-white'}>
                                  <td className="fw-bold text-taiton-navy">{row.code || row.name || ''}</td>
                                  <td>{row.size || row.sizeA || ''}</td>
                                  <td>{row.diameter || row.diameterB || ''}</td>
                                  <td>{row.c2c || row.c2cC || ''}</td>
                                  <td>{row.length || row.lengthL || ''}</td>
                                  <td>{row.projection || row.projectionP || ''}</td>
                                </tr>
                              ))
                            ) : null}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 border-bottom">
                  <h2 className="accordion-header" id="headingTech">
                    <button
                      className="accordion-button bg-transparent shadow-none px-0 fw-bold text-dark d-flex align-items-center justify-content-between w-100"
                      type="button"
                      onClick={() => setTechnicalOpen(!technicalOpen)}
                      aria-expanded={technicalOpen}
                    >
                      <span className="fw-bold" style={{ fontSize: '0.96rem' }}>Technical Specifications</span>
                      <i className={`fas ${technicalOpen ? 'fa-minus-circle text-primary' : 'fa-plus-circle text-muted'} fs-6`}></i>
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${technicalOpen ? 'show' : ''}`}
                    aria-labelledby="headingTech"
                  >
                    <div className="accordion-body px-0 py-2 text-secondary small">
                      {product.data.map((d, i) => (
                        <div key={i} className="d-flex justify-content-between py-1 border-bottom">
                          <span className="fw-bold text-dark">{d.label}</span>
                          <span>{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0 border-bottom">
                  <h2 className="accordion-header" id="headingUSP">
                    <button
                      className="accordion-button bg-transparent shadow-none px-0 fw-bold text-dark d-flex align-items-center justify-content-between w-100"
                      type="button"
                      onClick={() => setUspOpen(!uspOpen)}
                      aria-expanded={uspOpen}
                    >
                      <span className="fw-bold" style={{ fontSize: '0.96rem' }}>USP</span>
                      <i className={`fas ${uspOpen ? 'fa-minus-circle text-primary' : 'fa-plus-circle text-muted'} fs-6`}></i>
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${uspOpen ? 'show' : ''}`}
                    aria-labelledby="headingUSP"
                  >
                    <div className="accordion-body px-0 py-2 text-secondary small">
                      {Array.isArray(product.usp) && product.usp.length > 0 ? (
                        product.usp.map((item, idx) => (
                          <p key={idx} className={idx === product.usp.length - 1 ? 'mb-0' : 'mb-1'}>
                            • {typeof item === 'string' ? item : item.text || item.value || JSON.stringify(item)}
                          </p>
                        ))
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="accordion-item border-0">
                  <h2 className="accordion-header" id="headingApps">
                    <button
                      className="accordion-button bg-transparent shadow-none px-0 fw-bold text-dark d-flex align-items-center justify-content-between w-100"
                      type="button"
                      onClick={() => setApplicationsOpen(!applicationsOpen)}
                      aria-expanded={applicationsOpen}
                    >
                      <span className="fw-bold" style={{ fontSize: '0.96rem' }}>Applications</span>
                      <i className={`fas ${applicationsOpen ? 'fa-minus-circle text-primary' : 'fa-plus-circle text-muted'} fs-6`}></i>
                    </button>
                  </h2>
                  <div
                    className={`accordion-collapse collapse ${applicationsOpen ? 'show' : ''}`}
                    aria-labelledby="headingApps"
                  >
                    <div className="accordion-body px-0 py-2 text-secondary small">
                      {Array.isArray(product.applications) && product.applications.length > 0 ? (
                        product.applications.map((item, idx) => (
                          <p key={idx} className={idx === product.applications.length - 1 ? 'mb-0' : 'mb-1'}>
                            • {typeof item === 'string' ? item : item.text || item.value || JSON.stringify(item)}
                          </p>
                        ))
                      ) : null}
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* <section className="py-2 bg-white">
        <div className="site-container">
          <Link to="/products" className="d-block text-decoration-none">
            <img
              src="/images/elevate_every_space_banner.png"
              alt="New Collection - Elevate Every Space"
              className="w-100 img-fluid d-block rounded-3"
            />
          </Link>
        </div>
      </section> */}

      <section className="pt-3 pb-5 bg-white">
        <div className="site-container">
          <h3 className="section-title-navy mb-3" style={{ fontSize: '1.55rem', fontWeight: 700, color: '#002b5c' }}>
            Related Products
          </h3>

          <div
            className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3 flex-nowrap overflow-x-auto pb-2 pb-md-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {relatedProducts.slice(0, 5).map((item) => {
              const isFav = isWishlisted(item.pdtId || item.id) || isWishlisted(item.code);
              return (
                <div className="col" key={item.id}>
                  <div className="product-listing-card">
                    <button
                      type="button"
                      className={`product-listing-card-fav ${isFav ? 'active' : ''}`}
                      aria-label={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      title={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      onClick={() => {
                        if (isFav) {
                          removeFromWishlist(item.pdtId || item.id);
                        } else {
                          addToWishlist(item.pdtId || item.id, null);
                        }
                      }}
                    >
                      <i className={`${isFav ? 'fas text-danger' : 'far'} fa-heart`}></i>
                    </button>

                    <div className="product-listing-card-img-wrap">
                      <Link
                        to={`/product-detail?code=${encodeURIComponent(item.code)}`}
                        className="text-decoration-none d-flex align-items-center justify-content-center w-100 h-100"
                      >
                        <img
                          src={item.img || '/placeholder-hardware.png'}
                          alt={`${item.code} ${item.title}`}
                          className="product-listing-card-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/placeholder-hardware.png';
                          }}
                        />
                      </Link>
                    </div>

                    <div className="product-listing-card-body">
                      <Link to={`/product-detail?code=${encodeURIComponent(item.code)}`} className="text-decoration-none">
                        <div className="product-listing-card-code">{item.code}</div>
                        <div className="product-listing-card-title" title={item.title}>
                          {item.title}
                        </div>
                      </Link>

                      {Array.isArray(item.swatches) && item.swatches.length > 0 && (
                        <div className="product-listing-card-swatches">
                          {item.swatches.slice(0, 5).map((sw) => (
                            <span
                              key={sw.name}
                              className={`product-listing-swatch ${sw.dotClass}`}
                              title={sw.label}
                              style={sw.style || {}}
                            />
                          ))}
                          {item.swatches.length > 5 && (
                            <span className="product-listing-swatch-count">
                              +{item.swatches.length - 5}
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
      </section>
    </div>
  );
}
