import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchProducts, fetchSubcategories, fetchCategories, resolveImageUrl } from '../api/catalogApi';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import RecentlyViewed from '../components/RecentlyViewed';
import { extractVariantSwatches } from '../utils/swatchUtils';
import { useAuth } from '../context/AuthContext';

export default function ProductListPage() {
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat') || searchParams.get('catId') || '';
  const searchParam = searchParams.get('search') || '';

  const { addToWishlist, removeFromWishlist, isWishlisted } = useAuth();

  const [products, setProducts] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState('All');
  const [selectedColors, setSelectedColors] = useState([]);
  const [activeView, setActiveView] = useState('3x3');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileFilterOpen]);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchProducts({ cat: catParam, search: searchParam }),
      fetchSubcategories(catParam || null),
      fetchCategories(),
    ]).then(([prs, scs, cats]) => {
      if (!mounted) return;

      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      } else {
        setCategories([]);
      }

      if (Array.isArray(prs) && prs.length > 0) {
        setProducts(
          prs.map((p) => {
            const swatches = extractVariantSwatches(p.variants);
            return {
              id: p.id || p.code,
              code: p.code || String(p.id),
              title: p.fullname || p.name || '',
              categoryId: p.categoryId,
              category: p.category || '',
              subcategory: p.subcategory || '',
              subSubcategory: p.subSubcategory || '',
              img: resolveImageUrl(p.image) || '',
              swatches,
              visibleSwatches: swatches.slice(0, 5),
              moreCount: swatches.length > 5 ? `+${swatches.length - 5}` : null,
            };
          })
        );
      } else {
        setProducts([]);
      }

      if (Array.isArray(scs) && scs.length > 0) {
        const scList = scs.map((sc) => sc.name || sc.title);
        setSubcategories(scList);
      } else {
        setSubcategories([]);
      }
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, [catParam, searchParam]);

  const toggleFavorite = async (prod) => {
    const pdtId = prod.id || prod.code;
    if (isWishlisted(pdtId)) {
      await removeFromWishlist(pdtId);
    } else {
      await addToWishlist(pdtId, null);
    }
  };

  const toggleColor = (colorName) => {
    setSelectedColors((prev) =>
      prev.includes(colorName) ? prev.filter((c) => c !== colorName) : [...prev, colorName]
    );
  };

  const removeColor = (colorName) => {
    setSelectedColors((prev) => prev.filter((c) => c !== colorName));
  };

  const clearAllFilters = () => {
    setSelectedColors([]);
  };

  const categoryContext = (() => {
    if (!catParam || categories.length === 0) return null;
    for (const c of categories) {
      if (String(c.id) === String(catParam)) {
        return { cat: c, sc: null, s2c: null };
      }
      for (const sc of c.subcategories || []) {
        if (String(sc.id) === String(catParam)) {
          return { cat: c, sc, s2c: null };
        }
        for (const s2c of sc.items || []) {
          if (String(s2c.id) === String(catParam)) {
            return { cat: c, sc, s2c };
          }
        }
      }
    }
    return null;
  })();

  const availableColors = (() => {
    const map = new Map();
    for (const p of products) {
      for (const sw of p.swatches || []) {
        const key = sw.name.toLowerCase();
        if (!map.has(key)) {
          map.set(key, sw);
        }
      }
    }
    return Array.from(map.values());
  })();

  const activeSelectedColors = (() => {
    const valid = new Set(availableColors.map((c) => c.name));
    return selectedColors.filter((col) => valid.has(col));
  })();

  const effectiveActiveSub = (categoryContext?.sc || categoryContext?.s2c) ? 'All' : activeSub;

  const displayedProducts = products.filter((p) => {
    if (effectiveActiveSub && effectiveActiveSub !== 'All') {
      const subMatch = (p.subcategory || '').toLowerCase().includes(effectiveActiveSub.toLowerCase())
        || (p.subSubcategory || '').toLowerCase().includes(effectiveActiveSub.toLowerCase())
        || (p.title || '').toLowerCase().includes(effectiveActiveSub.toLowerCase())
        || String(p.categoryId) === String(effectiveActiveSub);
      if (!subMatch) return false;
    }
    if (activeSelectedColors.length > 0) {
      const hasColorMatch = activeSelectedColors.some((col) =>
        p.swatches?.some((sw) => sw.name === col)
      );
      if (!hasColorMatch) return false;
    }
    return true;
  });

  const pageTitle = (
    effectiveActiveSub !== 'All'
      ? effectiveActiveSub
      : (categoryContext?.s2c?.name ||
        categoryContext?.sc?.name ||
        categoryContext?.cat?.name ||
        products[0]?.subSubcategory ||
        products[0]?.subcategory ||
        products[0]?.category ||
        (searchParam ? `Search: ${searchParam}` : ''))
  ).toUpperCase();

  const getGridColumnClass = () => {
    if (activeView === '2x2') return 'col-6 col-sm-6';
    if (activeView === '4x4') return 'col-6 col-sm-6 col-md-3';
    if (activeView === '5x5') return 'col-6 col-sm-4 col-md-2';
    if (activeView === '2row') return 'col-6 col-sm-6 col-md-4 col-lg-3';
    if (activeView === 'list') return 'col-12';
    return 'col-6 col-sm-6 col-md-4';
  };

  const breadcrumbItems = [
    { label: 'Home', url: '/' },
    { label: 'Products', url: '/products' },
    ...(categoryContext?.cat
      ? [{ label: categoryContext.cat.name, url: `/product-category?catId=${categoryContext.cat.id}` }]
      : (products[0]?.category ? [{ label: products[0].category, url: `/product-category?catId=${products[0].categoryId || ''}` }] : [])),
    ...(categoryContext?.sc
      ? [{
        label: categoryContext.sc.name,
        url: Array.isArray(categoryContext.sc.items) && categoryContext.sc.items.length > 0
          ? `/product-category?catId=${categoryContext.cat.id}&subId=${categoryContext.sc.id}`
          : `/product-list?catId=${categoryContext.sc.id}`,
      }]
      : (products[0]?.subcategory ? [{ label: products[0].subcategory }] : [])),
    ...(categoryContext?.s2c ? [{ label: categoryContext.s2c.name }] : []),
  ];

  const siblingNavItems = (() => {
    if (categoryContext?.s2c && categoryContext?.sc?.items?.length > 0) {
      return {
        heading: categoryContext.sc.name,
        allUrl: `/product-list?catId=${categoryContext.sc.id}`,
        links: categoryContext.sc.items.map((item) => ({
          id: item.id,
          name: item.name || item.title,
          url: `/product-list?catId=${item.id}`,
          active: String(item.id) === String(catParam),
        })),
      };
    }
    if (categoryContext?.sc && categoryContext?.cat?.subcategories?.length > 0) {
      return {
        heading: categoryContext.cat.name,
        allUrl: `/product-category?catId=${categoryContext.cat.id}`,
        links: categoryContext.cat.subcategories.map((sc) => ({
          id: sc.id,
          name: sc.name || sc.title,
          url: Array.isArray(sc.items) && sc.items.length > 0
            ? `/product-category?catId=${categoryContext.cat.id}&subId=${sc.id}`
            : `/product-list?catId=${sc.id}`,
          active: String(sc.id) === String(catParam),
        })),
      };
    }
    return null;
  })();

  const hasCategorySidebar = Boolean(siblingNavItems) || subcategories.length > 0;
  const hasSidebar = hasCategorySidebar || availableColors.length > 0;

  return (
    <div className="product-list-page bg-white">
      <PageHeroBanner imageUrl="/images/about_hero_banner.webp" alt="TAITON Architectural Hardware" />
      <Breadcrumb items={breadcrumbItems} />

      <section className="py-4 bg-white">
        <div className="site-container">

          <div className="row g-4">

            {hasSidebar && (
              <div className="col-12 col-lg-3 d-none d-lg-block">
                {siblingNavItems ? (
                  <div className="filter-sidebar-box mb-4 border rounded-3 overflow-hidden bg-white shadow-xs">
                    <div
                      className="sidebar-cat-heading fw-bold px-3 py-2 text-uppercase"
                      style={{ backgroundColor: '#f0f4f8', color: '#003875', fontSize: '0.95rem' }}
                    >
                      {siblingNavItems.heading}
                    </div>
                    <div className="d-flex flex-column">
                      {siblingNavItems.links.map((item) => (
                        <Link
                          key={item.id}
                          to={item.url}
                          className={`filter-sidebar-item w-100 text-start text-decoration-none py-2 px-3 border-bottom ${item.active ? 'active fw-bold text-primary bg-light' : 'text-secondary'
                            }`}
                          style={{ fontSize: '0.88rem' }}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : subcategories.length > 0 && (
                  <div className="filter-sidebar-box mb-4 border rounded-3 overflow-hidden bg-white shadow-xs">
                    <div
                      className="sidebar-cat-heading fw-bold px-3 py-2 text-uppercase"
                      style={{ backgroundColor: '#f0f4f8', color: '#003875', fontSize: '0.95rem' }}
                    >
                      {products[0]?.category || 'Categories'}
                    </div>
                    <div className="d-flex flex-column">
                      <button
                        type="button"
                        className={`filter-sidebar-item w-100 text-start border-0 bg-transparent py-2 px-3 border-bottom ${activeSub === 'All' ? 'active fw-bold text-primary bg-light' : 'text-secondary'
                          }`}
                        onClick={() => setActiveSub('All')}
                        style={{ fontSize: '0.88rem' }}
                      >
                        All
                      </button>
                      {subcategories.map((item, idx) => {
                        const isActive = activeSub === item;
                        return (
                          <button
                            key={idx}
                            type="button"
                            className={`filter-sidebar-item w-100 text-start border-0 bg-transparent py-2 px-3 border-bottom ${isActive ? 'active fw-bold text-primary bg-light' : 'text-secondary'
                              }`}
                            onClick={() => setActiveSub(item)}
                            style={{ fontSize: '0.88rem' }}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {availableColors.length > 0 && (
                  <div className="bg-white pt-2 mb-4 border-top">
                    <h6 className="fw-bold text-dark mb-3 mt-3" style={{ fontSize: '0.9rem' }}>Color</h6>
                    <div className="d-flex flex-column gap-1 color-swatch-list">
                      {availableColors.map((color) => {
                        const isChecked = activeSelectedColors.includes(color.name);
                        return (
                          <div
                            key={color.name}
                            className="sidebar-color-row d-flex align-items-center gap-2 py-1 cursor-pointer user-select-none"
                            onClick={() => toggleColor(color.name)}
                            role="button"
                            tabIndex={0}
                          >
                            <span
                              className={`sidebar-color-box ${color.dotClass}`}
                              style={{
                                width: '15px',
                                height: '15px',
                                borderRadius: '2px',
                                display: 'inline-block',
                                flexShrink: 0,
                                border: isChecked ? '2px solid #0054a6' : '1px solid rgba(15, 23, 42, 0.2)',
                                boxShadow: isChecked ? '0 0 0 1px #0054a6' : 'none',
                                ...(color.style || {}),
                              }}
                            />
                            <span className={isChecked ? 'fw-bold text-dark' : 'text-secondary'} style={{ fontSize: '0.85rem' }}>
                              {color.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className={`col-12 ${hasSidebar ? 'col-lg-9' : 'col-lg-12'}`}>

              <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3 pb-2 border-bottom">
                <h3 className="product-listing-title mb-0">
                  {pageTitle}
                </h3>

                <div className="d-flex align-items-center gap-1">
                  {hasSidebar && (
                    <button
                      type="button"
                      className="btn btn-outline-dark rounded-pill d-lg-none d-inline-flex align-items-center gap-2 py-1 px-3 fw-semibold shadow-xs me-2"
                      style={{ fontSize: '0.85rem', borderColor: '#cbd5e1' }}
                      onClick={() => setMobileFilterOpen(true)}
                      aria-label="Open Filters"
                    >
                      <i className="fas fa-filter text-primary"></i>
                      <span>Filters</span>
                      {activeSelectedColors.length > 0 && (
                        <span className="badge bg-primary text-white rounded-pill px-2 py-0" style={{ fontSize: '0.7rem' }}>
                          {activeSelectedColors.length}
                        </span>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    className={`view-switch-btn ${activeView === '2x2' ? 'active' : ''}`}
                    title="2x2 View"
                    onClick={() => setActiveView('2x2')}
                    aria-label="2x2 Grid View"
                  >
                    <i className="fas fa-th-large"></i>
                  </button>
                  <button
                    type="button"
                    className={`view-switch-btn ${activeView === '3x3' ? 'active' : ''}`}
                    title="3x3 View"
                    onClick={() => setActiveView('3x3')}
                    aria-label="3x3 Grid View"
                  >
                    <i className="fas fa-th"></i>
                  </button>
                  <button
                    type="button"
                    className={`view-switch-btn ${activeView === '4x4' ? 'active' : ''}`}
                    title="4x4 View"
                    onClick={() => setActiveView('4x4')}
                    aria-label="4x4 Grid View"
                  >
                    <i className="fas fa-grip-horizontal"></i>
                  </button>
                  <button
                    type="button"
                    className={`view-switch-btn ${activeView === '5x5' ? 'active' : ''}`}
                    title="5x5 View"
                    onClick={() => setActiveView('5x5')}
                    aria-label="5x5 Grid View"
                  >
                    <i className="fas fa-border-all"></i>
                  </button>
                  <button
                    type="button"
                    className={`view-switch-btn ${activeView === '2row' ? 'active' : ''}`}
                    title="2-Row Grid View"
                    onClick={() => setActiveView('2row')}
                    aria-label="2-Row Grid View"
                  >
                    <i className="fas fa-grip-lines"></i>
                  </button>
                  <button
                    type="button"
                    className={`view-switch-btn ${activeView === 'list' ? 'active' : ''}`}
                    title="List View"
                    onClick={() => setActiveView('list')}
                    aria-label="List View"
                  >
                    <i className="fas fa-list"></i>
                  </button>
                </div>
              </div>

              {activeSelectedColors.length > 0 && (
                <div className="d-flex align-items-center flex-wrap gap-2 mb-4">
                  {activeSelectedColors.map((colName) => {
                    const swatchObj = availableColors.find((c) => c.name === colName);
                    return (
                      <div
                        key={colName}
                        className="bg-white border rounded-2 px-3 py-1 d-inline-flex flex-column gap-1 position-relative shadow-xs"
                        style={{ borderColor: '#cbd5e1', minWidth: '110px' }}
                      >
                        <span className="text-muted" style={{ fontSize: '0.65rem' }}>Color</span>
                        <div className="d-flex align-items-center gap-2">
                          {swatchObj && (
                            <span
                              className={`swatch-box ${swatchObj.dotClass}`}
                              style={{
                                width: '14px',
                                height: '14px',
                                borderRadius: '2px',
                                display: 'inline-block',
                                ...(swatchObj.style || {}),
                              }}
                            />
                          )}
                          <span className="fw-semibold text-dark small" style={{ fontSize: '0.8rem' }}>{colName}</span>
                          <button
                            type="button"
                            className="btn-close ms-auto"
                            style={{ fontSize: '0.55rem' }}
                            onClick={() => removeColor(colName)}
                            aria-label={`Remove filter ${colName}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    className="btn btn-link text-danger text-decoration-none small p-0 fw-bold ms-2"
                    onClick={clearAllFilters}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Clear All
                  </button>
                </div>
              )}

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary mb-2" role="status"></div>
                  <div className="text-muted small fw-semibold">Loading products...</div>
                </div>
              ) : displayedProducts.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-3 border">
                  <p className="text-muted mb-0">No products found matching the criteria.</p>
                </div>
              ) : (
                <div className="row g-2 g-sm-3 g-md-4 mb-4">
                  {displayedProducts.map((prod, pIdx) => (
                    <div className={getGridColumnClass()} key={prod.id || pIdx}>
                      <div className={`product-listing-card ${activeView === 'list' ? 'list-layout' : ''}`}>
                        {(() => {
                          const isFav = isWishlisted(prod.id) || isWishlisted(prod.code);
                          return (
                            <button
                              type="button"
                              className={`product-listing-card-fav ${isFav ? 'active' : ''}`}
                              aria-label={isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}
                              onClick={() => toggleFavorite(prod)}
                            >
                              <i className={`${isFav ? 'fas text-danger' : 'far'} fa-heart`}></i>
                            </button>
                          );
                        })()}

                        <div className="product-listing-card-img-wrap">
                          <Link
                            to={`/product-detail?code=${encodeURIComponent(prod.code)}`}
                            className="text-decoration-none d-flex align-items-center justify-content-center w-100 h-100"
                          >
                            <img
                              src={prod.img}
                              alt={`${prod.code} ${prod.title}`}
                              className="product-listing-card-img"
                              onError={(e) => { e.currentTarget.src = '/placeholder-hardware.png'; }}
                            />
                          </Link>
                        </div>

                        <div className="product-listing-card-body">
                          <Link to={`/product-detail?code=${encodeURIComponent(prod.code)}`} className="text-decoration-none">
                            <div className="product-listing-card-code">{prod.code}</div>
                            <div className="product-listing-card-title" title={prod.title}>
                              {prod.title}
                            </div>
                          </Link>

                          {prod.visibleSwatches.length > 0 && (
                            <div className="product-listing-card-swatches">
                              {prod.visibleSwatches.map((sw) => (
                                <span
                                  key={sw.name}
                                  className={`product-listing-swatch ${sw.dotClass}`}
                                  title={sw.label}
                                  style={sw.style || {}}
                                />
                              ))}
                              {prod.moreCount && (
                                <span className="product-listing-swatch-count">
                                  {prod.moreCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}

              {displayedProducts.length > 0 && (
                <div className="d-flex align-items-center justify-content-center gap-2 my-5">
                  <button type="button" className="btn btn-link text-decoration-none text-muted small fw-bold p-0 me-3">
                    <i className="fas fa-arrow-left me-1"></i> Previous
                  </button>
                  <button type="button" className="page-num-circle active">1</button>
                  <button type="button" className="btn btn-link text-decoration-none text-muted small fw-bold p-0 ms-3">
                    Next <i className="fas fa-arrow-right ms-1"></i>
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      </section>

      {/* <section className="py-3 bg-white">
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

      {/* Mobile Floating Filter Button */}
      {hasSidebar && (
        <div className="d-lg-none position-fixed start-50 translate-middle-x" style={{ bottom: '24px', zIndex: 1020 }}>
          <button
            type="button"
            className="btn btn-dark rounded-pill px-4 py-2 shadow-lg d-flex align-items-center gap-2 fw-semibold"
            style={{ backgroundColor: '#002b5c', borderColor: '#002b5c', fontSize: '0.88rem' }}
            onClick={() => setMobileFilterOpen(true)}
            aria-label="Open Filters"
          >
            <i className="fas fa-filter text-warning"></i>
            <span>Filters</span>
            {activeSelectedColors.length > 0 && (
              <span className="badge bg-danger text-white rounded-pill">
                {activeSelectedColors.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Mobile Filter Bottom Sheet Drawer (Slides up from the bottom) */}
      {hasSidebar && (
        <>
          <div
            className={`mobile-filter-backdrop ${mobileFilterOpen ? 'open' : ''}`}
            onClick={() => setMobileFilterOpen(false)}
            aria-hidden="true"
          />

          <div
            className={`mobile-filter-drawer ${mobileFilterOpen ? 'open' : ''}`}
            role="dialog"
            aria-modal="true"
            aria-label="Filter Products"
          >
            <div className="mobile-filter-handle" />

            <div className="mobile-filter-header">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-filter text-primary"></i>
                <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>Filters</h5>
              </div>
              <div className="d-flex align-items-center gap-2">
                {activeSelectedColors.length > 0 && (
                  <button
                    type="button"
                    className="btn btn-link text-danger text-decoration-none small p-0 fw-bold"
                    onClick={clearAllFilters}
                    style={{ fontSize: '0.85rem' }}
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close filters"
                  onClick={() => setMobileFilterOpen(false)}
                />
              </div>
            </div>

            <div className="mobile-filter-body">
              {siblingNavItems ? (
                <div className="mb-4">
                  <div
                    className="fw-bold text-uppercase mb-2 text-dark"
                    style={{ fontSize: '0.82rem', letterSpacing: '0.5px' }}
                  >
                    {siblingNavItems.heading}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {siblingNavItems.links.map((item) => (
                      <Link
                        key={item.id}
                        to={item.url}
                        onClick={() => setMobileFilterOpen(false)}
                        className={`btn btn-sm rounded-pill px-3 py-1 text-decoration-none ${
                          item.active ? 'btn-primary text-white shadow-xs' : 'btn-outline-secondary bg-light text-dark border'
                        }`}
                        style={item.active ? { backgroundColor: '#0054a6', borderColor: '#0054a6', fontSize: '0.82rem' } : { fontSize: '0.82rem' }}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : subcategories.length > 0 && (
                <div className="mb-4">
                  <div
                    className="fw-bold text-uppercase mb-2 text-dark"
                    style={{ fontSize: '0.82rem', letterSpacing: '0.5px' }}
                  >
                    {products[0]?.category || 'Categories'}
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 ${
                        activeSub === 'All' ? 'btn-primary text-white shadow-xs' : 'btn-outline-secondary bg-light text-dark border'
                      }`}
                      style={activeSub === 'All' ? { backgroundColor: '#0054a6', borderColor: '#0054a6', fontSize: '0.82rem' } : { fontSize: '0.82rem' }}
                      onClick={() => { setActiveSub('All'); setMobileFilterOpen(false); }}
                    >
                      All
                    </button>
                    {subcategories.map((item, idx) => {
                      const isActive = activeSub === item;
                      return (
                        <button
                          key={idx}
                          type="button"
                          className={`btn btn-sm rounded-pill px-3 py-1 ${
                            isActive ? 'btn-primary text-white shadow-xs' : 'btn-outline-secondary bg-light text-dark border'
                          }`}
                          style={isActive ? { backgroundColor: '#0054a6', borderColor: '#0054a6', fontSize: '0.82rem' } : { fontSize: '0.82rem' }}
                          onClick={() => { setActiveSub(item); setMobileFilterOpen(false); }}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div className="mb-2">
                  <div
                    className="fw-bold text-uppercase mb-2 text-dark"
                    style={{ fontSize: '0.82rem', letterSpacing: '0.5px' }}
                  >
                    Color Swatches
                  </div>
                  <div className="row g-2">
                    {availableColors.map((color) => {
                      const isChecked = activeSelectedColors.includes(color.name);
                      return (
                        <div className="col-6" key={color.name}>
                          <label
                            className={`d-flex align-items-center gap-2 p-2 rounded-2 border cursor-pointer user-select-none ${
                              isChecked ? 'border-primary bg-light fw-bold text-primary shadow-xs' : 'bg-white text-secondary'
                            }`}
                            style={{ fontSize: '0.82rem' }}
                          >
                            <input
                              type="checkbox"
                              className="form-check-input mt-0"
                              checked={isChecked}
                              onChange={() => toggleColor(color.name)}
                            />
                            <span
                              className={`swatch-box ${color.dotClass}`}
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '3px',
                                display: 'inline-block',
                                flexShrink: 0,
                                border: '1px solid rgba(15, 23, 42, 0.2)',
                                ...(color.style || {}),
                              }}
                            />
                            <span className="text-truncate">{color.label}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="mobile-filter-footer p-3 border-top bg-white d-flex gap-2">
              {activeSelectedColors.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill w-50 py-2 fw-semibold"
                  style={{ fontSize: '0.85rem' }}
                  onClick={clearAllFilters}
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary rounded-pill w-100 py-2 fw-semibold"
                style={{ backgroundColor: '#0054a6', borderColor: '#0054a6', fontSize: '0.88rem' }}
                onClick={() => setMobileFilterOpen(false)}
              >
                Apply Filters ({displayedProducts.length})
              </button>
            </div>
          </div>
        </>
      )}

      {/* Dynamic Recently Viewed Products (for authenticated users with history) */}
      <RecentlyViewed />

      <section className="py-4 bg-white">
        <div className="site-container">
          <div className="cat-download-banner">
            <div className="row align-items-center gy-4">
              <div className="col-12 col-lg-7">
                <h3 className="section-main-title mb-2 text-uppercase" style={{ fontSize: '1.5rem' }}>
                  DOWNLOAD OUR LATEST CATALOGUE
                </h3>
                <p className="text-secondary mb-4">
                  Explore the complete range of TAITON architectural hardware.
                </p>
                <Link to="/catalogues" className="btn-taiton-pill">
                  Download Catalogue <i className="fas fa-arrow-right ms-1"></i>
                </Link>
              </div>
              <div className="col-12 col-lg-5 text-center">
                <img
                  src="/images/catalogues_hero_stack.png"
                  alt="Catalogue Stack"
                  className="img-fluid catalogue-stack-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
