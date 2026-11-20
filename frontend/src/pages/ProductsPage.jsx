import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { fetchCategories, fetchProducts, resolveImageUrl } from '../api/catalogApi';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const searchFilter = searchParams.get('search') || '';
  const [categories, setCategories] = useState([]);
  const [dynamicProducts, setDynamicProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    Promise.all([fetchCategories(), fetchProducts()]).then(([cats, prs]) => {
      if (!mounted) return;

      if (Array.isArray(cats) && cats.length > 0) {
        const dynamicMapped = cats.map((c, idx) => {
          const hasSubcats = Array.isArray(c.subcategories) && c.subcategories.length > 0;
          const targetUrl = hasSubcats
            ? `/product-category?catId=${c.id}`
            : `/product-list?catId=${c.id}`;

          return {
            id: c.id || idx + 1,
            title: (c.title || c.name || '').toUpperCase(),
            hasSubcategories: hasSubcats,
            subcategories: c.subcategories || [],
            url: targetUrl,
            img: resolveImageUrl(c.image || c.img) || '',
          };
        });

        setCategories(dynamicMapped);
      } else {
        setCategories([]);
      }

      if (Array.isArray(prs) && prs.length > 0) {
        setDynamicProducts(prs);
      }
    }).finally(() => {
      if (mounted) setLoading(false);
    });

    return () => { mounted = false; };
  }, []);

  const allSearchSources = dynamicProducts.map((p) => ({
    code: p.code,
    name: p.name,
    category: p.category || '',
    url: `/product-detail?code=${encodeURIComponent(p.code)}`,
    desc: p.description || '',
  }));

  const searchedProducts = searchFilter
    ? allSearchSources.filter((p) => {
        const text = `${p.code} ${p.name} ${p.category} ${p.desc}`.toLowerCase();
        return text.includes(searchFilter.toLowerCase());
      })
    : [];

  return (
    <div className="products-overview-page bg-white">
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="The World of TAITON - Architectural Hardware"
      />

      <Breadcrumb items={[{ label: 'Products Page' }]} />

      {searchFilter && (
        <section className="py-4 bg-light border-bottom">
          <div className="site-container">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h4 className="fw-bold text-dark mb-0">
                Search Results for "{searchFilter}" ({searchedProducts.length})
              </h4>
              <Link to="/products" className="btn btn-outline-secondary btn-sm rounded-pill">
                Clear Search
              </Link>
            </div>
            {searchedProducts.length === 0 ? (
              <div className="p-4 bg-white rounded-3 border text-center">
                <p className="text-muted mb-0">No specific products matched. Browse all categories below.</p>
              </div>
            ) : (
              <div className="row g-3">
                {searchedProducts.map((item, idx) => (
                  <div className="col-12 col-md-6 col-lg-4" key={idx}>
                    <div className="p-3 bg-white rounded-3 border h-100 shadow-sm d-flex flex-column justify-content-between">
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="badge bg-taiton-dark text-white">{item.code}</span>
                          <span className="badge bg-light text-primary border">{item.category}</span>
                        </div>
                        <h6 className="fw-bold text-dark mb-1">{item.name}</h6>
                        <p className="text-muted small mb-3">{item.desc}</p>
                      </div>
                      <Link to={item.url} className="btn btn-outline-primary btn-sm rounded-pill w-100 fw-semibold">
                        View Product <i className="fas fa-arrow-right ms-1"></i>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section id="categories-sec" className="py-5 bg-white">
        <div className="site-container">
          <div className="text-center mb-5">
            <h2 className="fw-extrabold mb-2 text-taiton-navy fs-2">
              EXPLORE <span className="explore-underline-orange">OUR</span> CATEGORIES
            </h2>
            <p className="text-muted fs-6 mb-0">Innovative solutions for every architectural needs</p>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <div className="text-muted small">Loading categories...</div>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-3 border">
              <p className="text-muted mb-0">No categories found in database.</p>
            </div>
          ) : (
            <div className="row g-2 g-sm-3 g-md-4 justify-content-center">
              {categories.map((cat, idx) => (
                <div className="col-6 col-md-4 col-lg-3" key={cat.id || idx}>
                  <Link to={cat.url} className="text-decoration-none d-block h-100">
                    <div className="cat-grid-card shadow-sm hover-lift h-100 d-flex flex-column bg-white rounded-3 overflow-hidden border">
                      <div className="cat-grid-img-wrap">
                        <img
                          src={cat.img}
                          alt={cat.title}
                          className="cat-grid-img"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/Taiton/banners/1.webp';
                          }}
                        />
                      </div>
                      <div className="cat-title-bar">
                        {cat.title}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
