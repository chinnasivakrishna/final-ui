import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import { fetchCatalogs, resolveImageUrl } from '../api/catalogApi';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'catalogues', label: 'Catalogues' },
  { id: 'brochures', label: 'Brochures' },
  { id: 'magazines', label: 'Magazines' },
  { id: 'social', label: 'Social Media Creatives' },
  { id: 'posters', label: 'Advertisement Posters' },
  { id: 'technical', label: 'Technical Documents' },
  { id: 'installation', label: 'Installation Guides' }
];

export const STATIC_CATALOGUES = [
  {
    id: 'all-in-one',
    title: 'ALL IN ONE',
    edition: '2026\nEdition #7',
    pages: '128 Pages',
    updated: 'Mar 2026',
    image: '/images/catalogues/all_in_one.png',
    category: 'catalogues',
    orientation: 'portrait',
    downloadUrl: '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp'
  },
  {
    id: 'master-catalogue',
    title: 'MASTER CATALOGUE',
    edition: '2026\nEdition #7',
    pages: '128 Pages',
    updated: 'Mar 2026',
    image: '/images/catalogues/master_catalogue.png',
    category: 'catalogues',
    orientation: 'portrait',
    downloadUrl: '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp'
  },
  {
    id: 'digital-locks',
    title: 'TAITON DIGITAL LOCKS',
    edition: '2026\nEdition #7',
    pages: '128 Pages',
    updated: 'Mar 2026',
    image: '/images/catalogues/digital_locks.png',
    category: 'catalogues',
    orientation: 'portrait',
    downloadUrl: '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp'
  },
  {
    id: 'tavic-office-partition',
    title: 'TAVIC OFFICE PARTITION',
    edition: '2026\nEdition #7',
    pages: '128 Pages',
    updated: 'Mar 2026',
    image: '/images/catalogues/tavic_partition.png',
    category: 'catalogues',
    orientation: 'portrait',
    downloadUrl: '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp'
  },
  {
    id: 'maxia-shower-cubicles',
    title: 'MAXIA SHOWER CUBICLES',
    edition: '2026\nEdition #7',
    pages: '128 Pages',
    updated: 'Mar 2026',
    image: '/images/catalogues/maxia_shower.png',
    category: 'brochures',
    orientation: 'portrait',
    downloadUrl: '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp'
  },
  {
    id: 'turbozip',
    title: 'TURBOZIP',
    edition: '2026\nEdition #7',
    pages: '128 Pages',
    updated: 'Mar 2026',
    image: '/images/catalogues/turbozip.png',
    category: 'catalogues',
    orientation: 'portrait',
    downloadUrl: '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp'
  },
  {
    id: 'glass',
    title: 'GLASS',
    edition: '2026\nEdition #7',
    pages: '128 Pages',
    updated: 'Mar 2026',
    image: '/images/catalogues/glass.png',
    category: 'catalogues',
    orientation: 'portrait',
    downloadUrl: '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp'
  },
  {
    id: 'prochil',
    title: 'PROCHIL',
    edition: '2026\nEdition #7',
    pages: '128 Pages',
    updated: 'Mar 2026',
    image: '/images/catalogues/prochil.png',
    category: 'brochures',
    orientation: 'portrait',
    downloadUrl: '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp'
  }
];

export default function CataloguesPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogues, setCatalogues] = useState(STATIC_CATALOGUES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    fetchCatalogs(activeFilter)
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          const apiItems = data.map((c, idx) => ({
            id: c.id || `api-cat-${idx}`,
            title: c.title || c.name || '',
            category: c.category || 'catalogues',
            image: resolveImageUrl(c.image || c.thumbnail_img) || '/images/catalogues/master_catalogue.png',
            edition: c.edition || '2026\nEdition #7',
            pages: c.pages || '128 Pages',
            updated: c.updated || 'Mar 2026',
            orientation: c.orientation || 'portrait',
            downloadUrl: c.downloadUrl || c.file_url || '/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-0001.webp',
          }));
          setCatalogues([...STATIC_CATALOGUES, ...apiItems.filter(a => !STATIC_CATALOGUES.some(s => s.id === a.id))]);
        } else {
          setCatalogues(STATIC_CATALOGUES);
        }
      })
      .catch(() => {
        if (mounted) setCatalogues(STATIC_CATALOGUES);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [activeFilter]);

  const filteredItems = catalogues.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="catalogues-page bg-white">
      {/* Hero Banner: Same as About Us */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="TAITON Catalogues & Resources"
      />

      {/* Breadcrumb after banner */}
      <Breadcrumb items={[{ label: 'Catalogue' }]} />

      {/* Main Content Area in site-container for proper site margins */}
      <section className="py-4 bg-white">
        <div className="site-container">
          {/* Centered Filter Tabs - Single Line Horizontally Scrollable on Mobile */}
          <div
            className="cat-filter-bar mb-4 overflow-x-auto flex-nowrap justify-content-start justify-content-md-center"
            style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}
          >
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`filter-btn flex-shrink-0 text-nowrap ${activeFilter === tab.id ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary mb-2" role="status"></div>
              <div className="text-muted small fw-semibold">Loading catalogues...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-5 bg-light rounded-3 border">
              <p className="text-muted mb-0">No catalogues found matching "{searchQuery || activeFilter}".</p>
            </div>
          ) : (
            <div className="row g-2 g-md-3" id="cataloguesGrid">
              {filteredItems.map((item) => (
                <div className="col-6 col-md-6 col-lg-3" key={item.id}>
                  <div className="cat-doc-card h-100">
                    {/* Cover Thumbnail Container - exact 108x158 dimension matching UI */}
                    <Link
                      to={`/catalogue-view?id=${item.id}&title=${encodeURIComponent(item.title)}`}
                      className="cat-doc-thumb-container"
                      title={`View ${item.title} in 3D Flipbook`}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="cat-doc-thumb"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = '/images/catalogues/master_catalogue.png';
                        }}
                      />
                      {item.orientation === 'landscape' && (
                        <span className="cat-landscape-badge">Landscape</span>
                      )}
                    </Link>

                    {/* Metadata & Actions */}
                    <div className="flex-grow-1 d-flex flex-column justify-content-between py-1">
                      <div>
                        <h6 className="cat-card-title">
                          <Link to={`/catalogue-view?id=${item.id}&title=${encodeURIComponent(item.title)}`}>
                            {item.title}
                          </Link>
                        </h6>
                        {item.edition && (
                          <div className="cat-meta-text">
                            {item.edition.split('\n').map((line, lIdx) => (
                              <React.Fragment key={lIdx}>
                                {line}
                                {lIdx === 0 && <br />}
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                        {item.pages && (
                          <span className="cat-badge-pages">
                            {item.pages}
                          </span>
                        )}
                        {item.updated && (
                          <div className="cat-updated-text">
                            Updated : <strong className="text-dark">{item.updated}</strong>
                          </div>
                        )}
                      </div>

                      {/* Action buttons: View with eye icon & Download */}
                      <div className="d-flex align-items-center gap-2 mt-auto pt-2">
                        <Link
                          to={`/catalogue-view?id=${item.id}&title=${encodeURIComponent(item.title)}`}
                          className="cat-btn-view"
                          title="View 3D Flipbook"
                        >
                          <i className="fas fa-eye"></i> View
                        </Link>
                        <a
                          href={item.downloadUrl}
                          download={`${item.title}.pdf`}
                          className="cat-btn-download"
                          title="Download PDF"
                          onClick={(e) => {
                            if (!item.downloadUrl || item.downloadUrl === '#') {
                              e.preventDefault();
                              alert(`Downloading ${item.title} Catalogue PDF`);
                            }
                          }}
                        >
                          <i className="fas fa-download"></i>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
