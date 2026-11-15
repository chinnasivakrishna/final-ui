import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams, useNavigate } from 'react-router-dom';
import { fetchCategories, fetchCatalogs, resolveImageUrl } from '../api/catalogApi';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';

export default function ProductCategoryPage({ categoryKey }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const catIdParam = searchParams.get('catId') || searchParams.get('cat') || '';
  const subIdParam = searchParams.get('subId') || searchParams.get('sub') || '';

  const [categories, setCategories] = useState([]);
  const [latestCatalog, setLatestCatalog] = useState(null);
  const [failedCardImages, setFailedCardImages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([
      fetchCategories(),
      fetchCatalogs(),
    ]).then(([cats, catalogs]) => {
      if (!mounted) return;
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
      if (Array.isArray(catalogs) && catalogs.length > 0) {
        setLatestCatalog(catalogs[0]);
      }
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  let currentCat = null;
  if (catIdParam) {
    currentCat = categories.find((c) => String(c.id) === String(catIdParam) || (c.name || '').toLowerCase().includes(String(catIdParam).toLowerCase()));
  }
  if (!currentCat && subIdParam) {
    for (const c of categories) {
      if (c.subcategories?.some((sc) => String(sc.id) === String(subIdParam))) {
        currentCat = c;
        break;
      }
    }
  }
  if (!currentCat && (categoryKey || location.pathname)) {
    if (categoryKey === 'cat-sliding' || location.pathname.includes('sliding-systems')) {
      currentCat = categories.find((c) => (c.name || '').toLowerCase().includes('sliding')) || null;
    } else if (categoryKey === 'cat-doors' || location.pathname.includes('automatic-doors')) {
      currentCat = categories.find((c) => (c.name || '').toLowerCase().includes('door') || (c.name || '').toLowerCase().includes('automation')) || null;
    } else if (categoryKey === 'cat-locks' || location.pathname.includes('digital-locks')) {
      currentCat = categories.find((c) => (c.name || '').toLowerCase().includes('lock')) || null;
    }
  }
  if (!currentCat && !catIdParam && !subIdParam && categories.length > 0) {
    currentCat = categories[0];
  }

  let currentSub = null;
  if (subIdParam && currentCat) {
    currentSub = (currentCat.subcategories || []).find((sc) => String(sc.id) === String(subIdParam) || (sc.name || '').toLowerCase().includes(String(subIdParam).toLowerCase()));
  }

  const isSubSubcategoryView = Boolean(currentSub && Array.isArray(currentSub.items) && currentSub.items.length > 0);

  useEffect(() => {
    if (!loading && currentCat) {
      const hasSubcategories = Array.isArray(currentCat.subcategories) && currentCat.subcategories.length > 0;
      if (!hasSubcategories && !catIdParam.includes('product-list')) {
        navigate(`/product-list?catId=${currentCat.id}`, { replace: true });
      }
    }
  }, [loading, currentCat, catIdParam, navigate]);

  if (loading) {
    return (
      <div className="product-category-page py-5 bg-white text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner-border text-primary mb-3" role="status"></div>
        <div className="text-muted small fw-semibold">Loading Category Data...</div>
      </div>
    );
  }

  if (!currentCat) {
    return (
      <div className="product-category-page py-5 bg-white text-center">
        <div className="site-container">
          <p className="text-muted">No category information found.</p>
          <Link to="/products" className="btn btn-primary rounded-pill px-4">Browse All Categories</Link>
        </div>
      </div>
    );
  }

  const heroTitle = isSubSubcategoryView
    ? (currentSub?.name || currentSub?.title || '')
    : (currentCat.name || currentCat.title || '');
  const sectionExploreTitle = (heroTitle || '').toUpperCase();

  const displayCards = isSubSubcategoryView
    ? (currentSub.items || []).map((item) => ({
      id: item.id,
      title: item.name || item.title,
      img: resolveImageUrl(item.image) || resolveImageUrl(currentSub.image) || resolveImageUrl(currentCat.image) || '',
      url: `/product-list?catId=${item.id}`,
    }))
    : (currentCat.subcategories || []).map((sc) => {
      const hasChildItems = Array.isArray(sc.items) && sc.items.length > 0;
      const targetUrl = hasChildItems
        ? `/product-category?catId=${currentCat.id}&subId=${sc.id}`
        : `/product-list?catId=${sc.id}`;

      return {
        id: sc.id,
        title: sc.name || sc.title,
        img: resolveImageUrl(sc.image) || resolveImageUrl(currentCat.image) || '',
        url: targetUrl,
      };
    });

  const sidebarTitle = isSubSubcategoryView
    ? (currentCat.name || currentCat.title)
    : 'Categories';

  const sidebarItems = isSubSubcategoryView
    ? (currentCat.subcategories || []).map((sc) => {
      const hasChildItems = Array.isArray(sc.items) && sc.items.length > 0;
      const targetUrl = hasChildItems
        ? `/product-category?catId=${currentCat.id}&subId=${sc.id}`
        : `/product-list?catId=${sc.id}`;

      return {
        id: sc.id,
        name: sc.name || sc.title,
        url: targetUrl,
        active: String(currentSub?.id) === String(sc.id),
      };
    })
    : categories.map((cat) => {
      const hasSubcategories = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
      return {
        id: cat.id,
        name: cat.name || cat.title,
        url: hasSubcategories ? `/product-category?catId=${cat.id}` : `/product-list?catId=${cat.id}`,
        active: String(currentCat.id) === String(cat.id),
      };
    });

  const breadcrumbItems = [
    { label: 'Products', url: '/products' },
    ...(isSubSubcategoryView
      ? [
        { label: currentCat.name || currentCat.title, url: `/product-category?catId=${currentCat.id}` },
        { label: currentSub?.name || currentSub?.title }
      ].filter((item) => Boolean(item.label))
      : [{ label: currentCat.name || currentCat.title }].filter((item) => Boolean(item.label)))
  ];

  const activeDescription = (isSubSubcategoryView
    ? (currentSub?.description || currentCat?.description || '')
    : (currentCat?.description || '')).trim();
  const showcaseImage = resolveImageUrl(
    isSubSubcategoryView ? (currentSub?.image || currentCat?.image) : currentCat?.image
  ) || '';
  const descriptionParagraphs = activeDescription
    ? activeDescription.split(/\r?\n+/).map((p) => p.trim()).filter(Boolean)
    : [];

  return (
    <div className="product-category-page bg-white">
      {/* 1. Top Banner */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt={heroTitle || 'TAITON Architectural Hardware'}
      />

      {/* 2. Breadcrumb below banner */}
      <Breadcrumb items={breadcrumbItems} />

      {/* 3. Explore Dynamic Subcategory / Sub-Subcategory Grid */}
      <section className="py-5 bg-white">
        <div className="site-container py-2">

          <div className="row g-4">
            {/* Left Sidebar */}
            <div className="col-12 col-lg-3">
              <div className="subcat-sidebar border rounded-3 overflow-hidden shadow-sm">
                <div className="subcat-sidebar-header p-3 bg-light fw-bold text-taiton-navy border-bottom" style={{ fontSize: '0.95rem' }}>
                  {sidebarTitle}
                </div>
                {sidebarItems.length > 0 ? (
                  sidebarItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.url}
                      className={`subcat-sidebar-item w-100 text-start text-decoration-none d-block py-2 px-3 border-bottom ${item.active ? 'active fw-bold' : ''
                        }`}
                      style={{ fontSize: '0.88rem' }}
                    >
                      {item.name}
                    </Link>
                  ))
                ) : (
                  <div className="p-3 text-muted small">No subcategories listed</div>
                )}
              </div>
            </div>

            {/* Right Cards Grid */}
            <div className="col-12 col-lg-9">
              {/* Explore with Name on Right Side Top of Items */}
              <div className="mb-4">
                <div className="section-kicker mb-1">
                  EXPLORE <span style={{ display: 'inline-block', width: '36px', height: '2px', backgroundColor: '#0084B4', verticalAlign: 'middle', marginLeft: '6px' }}></span>
                </div>
                <h2 className="section-main-title text-uppercase mb-0" style={{ fontSize: '1.95rem' }}>
                  {sectionExploreTitle}
                </h2>
              </div>

              {displayCards.length > 0 ? (
                <div className="row g-2 g-sm-3 g-md-4">
                  {displayCards.map((card, idx) => {
                    const cardKey = card.id || idx;
                    const showImg = Boolean(card.img) && !failedCardImages[cardKey];
                    return (
                      <div className="col-6 col-md-4" key={cardKey}>
                        <Link to={card.url} className="subcat-card text-decoration-none d-flex flex-column h-100">
                          <div className="subcat-card-img-wrap">
                            {showImg ? (
                              <img
                                src={card.img}
                                alt={card.title}
                                className="subcat-card-img"
                                onError={() => {
                                  setFailedCardImages((prev) => ({ ...prev, [cardKey]: true }));
                                }}
                              />
                            ) : (
                              <div className="d-flex align-items-center justify-content-center w-100 h-100 text-secondary">
                                <i className="fas fa-layer-group fa-2x opacity-50" aria-hidden="true"></i>
                              </div>
                            )}
                          </div>
                          <div className="subcat-card-title text-center py-2 px-2 fw-bold text-uppercase" style={{ fontSize: '0.86rem' }}>
                            {card.title}
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 border rounded-3 bg-light">
                  <p className="text-muted mb-2">No subcategory products found in this section.</p>
                  <Link to="/products" className="btn btn-outline-primary btn-sm rounded-pill px-3">
                    Browse All Products
                  </Link>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 4. Dynamic Category Description & Showcase Image */}
      {descriptionParagraphs.length > 0 && (
        <section className="py-5 bg-white">
          <div className="site-container py-2">
            <h2 className="section-main-title mb-4" style={{ fontSize: '1.65rem' }}>
              {heroTitle}
            </h2>

            <div className="showcase-flow-container clearfix">
              {showcaseImage && !failedCardImages.showcase && (
                <div className="showcase-float-right">
                  <div className="showcase-frame-wrap">
                    {/* <div className="showcase-frame-line" aria-hidden="true"></div> */}
                    <div className="" aria-hidden="true"></div>
                    <img
                      src={showcaseImage}
                      alt={heroTitle}
                      className="showcase-interior-img"
                      onError={() => {
                        setFailedCardImages((prev) => ({ ...prev, showcase: true }));
                      }}
                    />
                  </div>
                </div>
              )}

              {descriptionParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="mb-3 leading-relaxed"
                  style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.7' }}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5. Download Catalogue Banner (Dynamic from Catalogues API) */}
      {latestCatalog && (
        <section className="py-5 bg-white">
          <div className="site-container">
            <div className="cat-download-banner">
              <div className="row align-items-center gy-4">
                <div className="col-12 col-lg-7">
                  <h3 className="section-main-title mb-2 text-uppercase" style={{ fontSize: '1.5rem' }}>
                    {latestCatalog.title || 'DOWNLOAD OUR LATEST CATALOGUE'}
                  </h3>
                  <p className="text-secondary mb-4 fs-6">
                    {latestCatalog.category
                      ? `Explore the complete ${latestCatalog.category} range from TAITON architectural hardware.`
                      : 'Explore the complete range of TAITON architectural hardware.'}
                  </p>
                  <Link to="/catalogues" className="btn-taiton-pill">
                    Download Catalogue <i className="fas fa-arrow-right ms-1"></i>
                  </Link>
                </div>
                <div className="col-12 col-lg-5 text-center">
                  <img
                    src={resolveImageUrl(latestCatalog.image) || '/images/catalogues_hero_stack.png'}
                    alt={latestCatalog.title || 'TAITON Architectural Hardware Catalogue'}
                    className="img-fluid catalogue-stack-img"
                    onError={(e) => {
                      e.currentTarget.src = '/images/catalogues_hero_stack.png';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
