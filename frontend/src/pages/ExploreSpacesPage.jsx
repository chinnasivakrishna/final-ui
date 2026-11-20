import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { fetchSpaces, fetchProducts, resolveImageUrl } from '../api/catalogApi';
import './ExploreSpaces.css';

const DEFAULT_MET_PALETTE = [
  ['SSS', '#c4c8cd'],
  ['PSS', '#e4e6e9'],
  ['BLACK', '#26272a'],
  ['GOLD', '#d2a24c'],
];

const DEFAULT_GLS_PALETTE = [
  ['CLEAR', '#cfe0e6'],
  ['GREY', '#9aa4ab'],
  ['BRONZE', '#a98a64'],
  ['BLACK', '#26272a'],
];

const getSpecIcon = (label) => {
  const l = (label || '').toLowerCase();
  if (l.includes('angle') || l.includes('degree') || l.includes('open')) return 'far fa-clock';
  if (l.includes('material') || l.includes('finish') || l.includes('grade')) return 'fas fa-cube';
  if (l.includes('thick') || l.includes('dimension') || l.includes('size') || l.includes('length') || l.includes('centre') || l.includes('width')) return 'fas fa-arrows-alt-v';
  if (l.includes('mount') || l.includes('type') || l.includes('fix') || l.includes('system')) return 'fas fa-tools';
  if (l.includes('warranty') || l.includes('guarantee')) return 'fas fa-shield-alt';
  return 'fas fa-check-circle';
};

export default function ExploreSpacesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [spaces, setSpaces] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [curSpaceId, setCurSpaceId] = useState(null);
  const [curProdCode, setCurProdCode] = useState('');
  const [curAngle, setCurAngle] = useState(0);
  const [curFinish, setCurFinish] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const rowRef = useRef(null);
  const toastTimerRef = useRef(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastMsg(''), 2500);
  };

  // Dynamic API load from live backend
  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        setLoading(true);
        const [apiSpaces, apiProducts] = await Promise.all([fetchSpaces(), fetchProducts()]);
        if (!mounted) return;

        if (Array.isArray(apiSpaces) && apiSpaces.length > 0) {
          setSpaces(apiSpaces);
          const currentUrlParam = new URLSearchParams(window.location.search).get('spaceId');
          const matchedSpace = currentUrlParam
            ? apiSpaces.find((s) => String(s.id) === String(currentUrlParam))
            : null;
          const targetSpace = matchedSpace || apiSpaces[0];
          setCurSpaceId(targetSpace.id);
          if (Array.isArray(targetSpace.pts) && targetSpace.pts.length > 0) {
            setCurProdCode(targetSpace.pts[0].c);
          } else {
            setCurProdCode('');
          }
        }

        if (Array.isArray(apiProducts) && apiProducts.length > 0) {
          const mapped = apiProducts.map((p) => ({
            c: p.pdt_code || p.code || String(p.id),
            name: p.product || p.name,
            label: p.product || p.name,
            type: p.type || 'prof',
            fin: p.fin || 0,
            d: p.description || p.desc || '',
            img: p.primary_img || p.image,
            s: Array.isArray(p.specifications)
              ? p.specifications.map((s) => [s.label || s.key || s[0] || '', s.value || s[1] || ''])
              : [],
            variants: Array.isArray(p.variants) ? p.variants : [],
          }));
          setProductsList(mapped);
        }
      } catch (err) {
        console.warn('[ExploreSpacesPage] Error fetching live data:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const currentSpace = spaces.find((s) => String(s.id) === String(curSpaceId)) || spaces[0] || null;

  const findProd = (code) => {
    if (!code) return null;
    const cleanCode = String(code).trim();
    const fromList = productsList.find((p) => String(p.c).trim() === cleanCode);
    const fromHotspot = (currentSpace?.pts || []).find((pt) => String(pt.c).trim() === cleanCode && pt.product)?.product;

    if (fromList && fromHotspot) {
      return {
        ...fromList,
        ...fromHotspot,
        c: cleanCode,
        name: fromHotspot.name || fromList.name || cleanCode,
        label: fromHotspot.label || fromList.label || cleanCode,
        d: fromHotspot.d || fromHotspot.description || fromList.d || fromList.description || '',
        img: fromHotspot.img || fromList.img || '',
        images: (fromHotspot.images && fromHotspot.images.length > 0) ? fromHotspot.images : (fromList.images || (fromList.img ? [fromList.img] : [])),
        s: (fromHotspot.s && fromHotspot.s.length > 0)
          ? fromHotspot.s.map((s) => [s.label || s.key || s[0] || '', s.value || s[1] || ''])
          : (fromList.s || []),
        variants: (fromHotspot.variants && fromHotspot.variants.length > 0) ? fromHotspot.variants : (fromList.variants || []),
      };
    }
    if (fromHotspot) {
      return {
        c: fromHotspot.c || cleanCode,
        name: fromHotspot.name || fromHotspot.label || cleanCode,
        label: fromHotspot.label || fromHotspot.name || cleanCode,
        type: fromHotspot.type || 'prof',
        fin: fromHotspot.fin || 0,
        d: fromHotspot.description || fromHotspot.d || '',
        img: fromHotspot.img || '',
        images: fromHotspot.images || (fromHotspot.img ? [fromHotspot.img] : []),
        s: Array.isArray(fromHotspot.specifications || fromHotspot.s)
          ? (fromHotspot.specifications || fromHotspot.s).map((s) => [s.label || s.key || s[0] || '', s.value || s[1] || ''])
          : [],
        variants: Array.isArray(fromHotspot.variants) ? fromHotspot.variants : [],
      };
    }
    if (fromList) return fromList;
    return null;
  };

  const currentSpaceProductCodes = currentSpace
    ? [...new Set((currentSpace.pts || []).map((pt) => pt.c))].filter(Boolean)
    : [];

  const activeProduct = curProdCode
    ? findProd(curProdCode)
    : (currentSpaceProductCodes.length > 0 ? findProd(currentSpaceProductCodes[0]) : null);

  useEffect(() => {
    const spaceIdFromUrl = new URLSearchParams(location.search).get('spaceId');
    if (spaceIdFromUrl && spaces.length > 0) {
      const sp = spaces.find((s) => String(s.id) === String(spaceIdFromUrl));
      if (sp) {
        setCurSpaceId(sp.id);
        if (Array.isArray(sp.pts) && sp.pts.length > 0) {
          setCurProdCode(sp.pts[0].c);
          setCurAngle(0);
          setCurFinish(0);
        } else {
          setCurProdCode('');
        }
      }
    }
  }, [location.search, spaces]);

  const handleSelectSpace = (spaceId) => {
    setCurSpaceId(spaceId);
    setSearchParams({ spaceId: String(spaceId) });
    const sp = spaces.find((s) => String(s.id) === String(spaceId));
    if (sp && Array.isArray(sp.pts) && sp.pts.length > 0) {
      setCurProdCode(sp.pts[0].c);
      setCurAngle(0);
      setCurFinish(0);
    } else {
      setCurProdCode('');
    }
  };

  const handleSelectProduct = (code) => {
    setCurProdCode(code);
    setCurAngle(0);
    setCurFinish(0);
    if (rowRef.current) {
      const cardEl = rowRef.current.querySelector(`[data-prod-code="${code}"]`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  };

  const scrollProductsRow = () => {
    if (!rowRef.current) return;
    const r = rowRef.current;
    if (r.scrollLeft + r.clientWidth >= r.scrollWidth - 10) {
      r.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      r.scrollBy({ left: 260, behavior: 'smooth' });
    }
  };

  const variants = activeProduct?.variants || [];
  const finishPalette = variants.length > 0
    ? variants.map((v) => [v.name || v.colour || 'Finish', v.hex || '#c4c8cd'])
    : (activeProduct?.fin === 1 ? DEFAULT_GLS_PALETTE : DEFAULT_MET_PALETTE);
  const activeColorHex = finishPalette[curFinish]?.[1] || '#c4c8cd';

  const renderArt = (type, gradId) => {
    const strokeAttr = 'stroke="#7d848c" strokeWidth="1"';
    switch (type) {
      case 'hinge':
        return (
          <svg className="art" viewBox="0 0 200 140" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="70" cy="82" rx="46" ry="36" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <ellipse cx="70" cy="78" rx="30" ry="22" fill="#0002" stroke="#7d848c" />
            <circle cx="70" cy="78" r="8" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <path d="M104 58L168 26l16 26-56 46z" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <circle cx="162" cy="42" r="6" fill="#0003" />
            <rect x="40" y="108" width="60" height="10" rx="4" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
          </svg>
        );
      case 'hinge2':
        return (
          <svg className="art" viewBox="0 0 200 140" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <path d="M30 70l60-26 70 20-20 40-60 14z" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <circle cx="60" cy="80" r="15" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <circle cx="130" cy="62" r="6" fill="#0003" />
            <rect x="100" y="86" width="50" height="9" rx="4" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
          </svg>
        );
      case 'handle':
        return (
          <svg className="art" viewBox="0 0 200 140" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <rect x="14" y="58" width="172" height="12" rx="6" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <rect x="34" y="66" width="10" height="26" rx="3" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <rect x="156" y="66" width="10" height="26" rx="3" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
          </svg>
        );
      case 'led':
        return (
          <svg className="art" viewBox="0 0 200 140" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <path d="M20 90l120-40h50v36l-120 40H20z" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <path d="M24 92l110-36 4 8-110 38z" fill="#e2b25a" />
          </svg>
        );
      case 'glass':
        return (
          <svg className="art" viewBox="0 0 200 140" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <rect x="30" y="14" width="140" height="112" fill="#cfdfe5" stroke="#7d848c" />
            {Array.from({ length: 14 }, (_, k) => (
              <rect key={k} x={34 + k * 10} y="16" width="4" height="108" fill="#fff" opacity="0.6" />
            ))}
          </svg>
        );
      case 'skirt':
        return (
          <svg className="art" viewBox="0 0 200 140" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <path d="M16 110l150-44h22v14l-150 46H16z" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <path d="M16 110l150-44h22l-60 22z" fill="#fff" opacity="0.4" />
          </svg>
        );
      default:
        return (
          <svg className="art" viewBox="0 0 200 140" aria-hidden="true" style={{ width: '100%', height: '100%' }}>
            <path d="M20 90l120-40h50v36l-120 40H20z" fill={`url(#${gradId})`} stroke="#7d848c" strokeWidth="1" />
            <path d="M20 90l120-40h50l-70 28z" fill="#fff" opacity="0.4" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="explore-spaces-page d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading Spaces...</span>
        </div>
      </div>
    );
  }

  if (!loading && spaces.length === 0) {
    return (
      <div className="explore-spaces-page text-center py-5">
        <div className="container py-5">
          <i className="fas fa-layer-group fs-1 text-muted mb-3 opacity-50"></i>
          <h4 className="fw-bold text-dark">No Spaces Available</h4>
          <p className="text-muted small">Explore spaces will appear here once configured in the catalog.</p>
          <Link to="/products" className="btn btn-primary btn-sm rounded-pill px-4">
            Browse Catalogues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-spaces-page">
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <linearGradient id="M" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6f8f9" />
            <stop offset="0.5" stopColor="#b3bbc4" />
            <stop offset="1" stopColor="#eceff1" />
          </linearGradient>
          <linearGradient id="G" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={activeColorHex} />
            <stop offset="0.5" stopColor={activeColorHex} />
            <stop offset="1" stopColor="#1c2740" />
          </linearGradient>
        </defs>
      </svg>

      <div className="taiton-layout-container">
        <main className="explore-spaces-wrap">
          {/* Left Spaces Sidebar (Desktop only; on mobile, spaces are accessed directly from main menu bar) */}
          <nav className="spaces-nav box d-none d-lg-block" aria-label="Spaces">
            <h2>Explore Spaces</h2>
            <div>
              {spaces.map((sp) => {
                const isOn = String(sp.id) === String(curSpaceId);
                return (
                  <button
                    key={sp.id}
                    className={`space-btn ${isOn ? 'on' : ''}`}
                    onClick={() => handleSelectSpace(sp.id)}
                  >
                    <span className="space-btn-text">{sp.name || sp.title}</span>
                    {isOn && <i className="fas fa-chevron-right space-chevron fs-8"></i>}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Center Room Image with Hotspots */}
          <section className="explore-imgbox box">
            {currentSpace ? (
              <div className="explore-img-canvas">
                <img
                  src={resolveImageUrl(currentSpace.img || currentSpace.image) || currentSpace.image}
                  alt={currentSpace.name || currentSpace.title}
                />
                {(currentSpace.pts || []).map((pt, idx) => {
                  const pData = findProd(pt.c);
                  const isSelected = curProdCode === pt.c;
                  const labelText = pt.label || pData?.label || pData?.name || pt.c;
                  const isNearBottom = Number(pt.y) > 80;
                  return (
                    <div
                      key={idx}
                      className={`explore-hotspot-pin ${isSelected ? 'on' : ''} ${isNearBottom ? 'badge-top' : ''}`}
                      style={{ left: `${pt.x}%`, top: `${pt.y}%` }}
                      onClick={() => handleSelectProduct(pt.c)}
                      role="button"
                      tabIndex={0}
                      aria-label={labelText}
                    >
                      <div className="hotspot-target-dot">
                        <div className="hotspot-target-inner"></div>
                      </div>
                      <div className="hotspot-target-badge">
                        {labelText}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7487' }}>
                No spaces configured yet.
              </div>
            )}
          </section>

          {/* Products Used in This Space - spans grid-column: 1 / 3 */}
          <section className="explore-prods">
            <h3>Products Used in This Space</h3>
            <div className="explore-row-wrap">
              <div className="explore-row" ref={rowRef}>
                {currentSpaceProductCodes.length > 0 ? (
                  currentSpaceProductCodes.map((code) => {
                    const prod = findProd(code);
                    if (!prod) return null;
                    const isSelected = curProdCode === code;
                    return (
                      <button
                        key={code}
                        data-prod-code={code}
                        className={`explore-pc ${isSelected ? 'on' : ''}`}
                        onClick={() => handleSelectProduct(code)}
                      >
                        <div className="explore-pc-img">
                          {prod.img ? (
                            <img src={resolveImageUrl(prod.img)} alt={prod.name} />
                          ) : (
                            renderArt(prod.type, 'M')
                          )}
                        </div>
                        <b>{prod.c}</b>
                        <small title={prod.name}>{prod.name}</small>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-muted small py-3 px-2">No products attached to this space.</div>
                )}
              </div>
              {currentSpaceProductCodes.length > 3 && (
                <button
                  className="explore-nx"
                  onClick={scrollProductsRow}
                  aria-label="Show more products"
                >
                  <i className="fas fa-chevron-right text-dark fs-8"></i>
                </button>
              )}
            </div>
          </section>

          {/* Right Detail Panel */}
          <aside className="explore-det box" aria-live="polite">
            {activeProduct && (
              <>
                <button
                  className={`det-heart ${isFavorite ? 'on' : ''}`}
                  onClick={() => {
                    setIsFavorite(!isFavorite);
                    showToast(isFavorite ? 'Removed from favourites' : 'Saved to favourites');
                  }}
                  aria-label="Save to favourites"
                >
                  <i className={`${isFavorite ? 'fas text-danger' : 'far'} fa-heart fs-5`}></i>
                </button>

                <div className="det-tp">
                  <div className="det-thumbs">
                    {[0, 1, 2].map((k) => (
                      <button
                        key={k}
                        className={`det-th ${curAngle === k ? 'on' : ''}`}
                        onClick={() => setCurAngle(k)}
                        aria-label={`Angle ${k + 1}`}
                      >
                        {activeProduct.img ? (
                          <img src={resolveImageUrl(activeProduct.img)} alt="" />
                        ) : (
                          renderArt(activeProduct.type, 'G')
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="det-big">
                    {activeProduct.img ? (
                      <img src={resolveImageUrl(activeProduct.img)} alt={activeProduct.name} />
                    ) : (
                      renderArt(activeProduct.type, 'G')
                    )}
                  </div>
                </div>

                <h1 className="det-code">{activeProduct.c}</h1>
                <div className="det-name">{activeProduct.name}</div>
                <p className="det-desc">{activeProduct.d}</p>

                <div className="det-finishes-title">Available Finishes</div>
                <div className="det-fins-row">
                  {finishPalette.map((item, idx) => {
                    const isFinOn = curFinish === idx;
                    return (
                      <div
                        key={idx}
                        className={`det-fin-item ${isFinOn ? 'on' : ''}`}
                        onClick={() => setCurFinish(idx)}
                      >
                        <div
                          className="det-fin-swatch"
                          style={{ backgroundColor: item[1] }}
                        ></div>
                        <span className="det-fin-label">{item[0]}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="det-actions-row">
                  <Link
                    to={`/product-detail?sku=${encodeURIComponent(activeProduct.c)}`}
                    className="btn-det-view-more"
                  >
                    View More <i className="fas fa-arrow-right fs-8"></i>
                  </Link>
                  <Link to="/contact-us" className="btn-det-get-quote">
                    Get a Quote
                  </Link>
                </div>

                {activeProduct.s && activeProduct.s.length > 0 && (
                  <div className="det-specs-list">
                    {activeProduct.s.map((spec, idx) => {
                      const label = Array.isArray(spec) ? spec[0] : (spec.key || spec.label || '');
                      const val = Array.isArray(spec) ? spec[1] : (spec.value || spec.val || '');
                      const iconClass = getSpecIcon(label);
                      return (
                        <div className="det-spec-row" key={idx}>
                          <div className="det-spec-label">
                            <i className={`${iconClass} det-spec-icon`}></i>
                            <span>{label}</span>
                          </div>
                          <div className="det-spec-val">{val}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </aside>
        </main>
      </div>

      {toastMsg && <div className="det-toast">{toastMsg}</div>}
    </div>
  );
}
