import React, { useState, useEffect } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import videosData from '../data/videosData.json';

export default function VideosPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeSubCategory, setActiveSubCategory] = useState(videosData.subCategories[0]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    if (mobileFilterOpen) {
      document.body.classList.add('mobile-filter-open');
    } else {
      document.body.classList.remove('mobile-filter-open');
    }
    return () => {
      document.body.classList.remove('mobile-filter-open');
    };
  }, [mobileFilterOpen]);

  const openVideo = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  const renderCategoryOutlineIcon = (id) => {
    switch (id) {
      case 'all':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
          </svg>
        );
      case 'products':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
          </svg>
        );
      case 'functionality':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
          </svg>
        );
      case 'installation':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        );
      case 'projects':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
            <path d="M9 22v-4h6v4" />
            <path d="M8 6h.01" />
            <path d="M16 6h.01" />
            <path d="M12 6h.01" />
            <path d="M12 10h.01" />
            <path d="M12 14h.01" />
            <path d="M16 10h.01" />
            <path d="M16 14h.01" />
            <path d="M8 10h.01" />
            <path d="M8 14h.01" />
          </svg>
        );
      case 'events':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
          </svg>
        );
      case 'company':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V7l8-4v18" />
            <path d="M19 21V11l-6-4" />
          </svg>
        );
      case 'stories':
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        );
      default:
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
        );
    }
  };

  return (
    <div className="videos-page-wrap bg-white">
      {/* 1. Hero Banner (Image Only, No Text/Buttons) */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="Taiton Architectural Videos"
      />

      {/* 2. Breadcrumb ALWAYS below banner */}
      <Breadcrumb items={[{ label: 'Videos' }]} />

      {/* 3. Featured Video Section Matching 25 - Videos.png */}
      <section className="py-4 bg-white">
        <div className="site-container">
          <div className="row g-4 align-items-stretch">
            {/* Main Featured Video Player */}
            <div className="col-12 col-lg-7">
              <div
                className="position-relative overflow-hidden shadow-sm h-100 bg-dark"
                style={{ minHeight: '355px', borderRadius: '10px', cursor: 'pointer' }}
                onClick={() => openVideo(videosData.featured.main)}
              >
                <img
                  src={videosData.featured.main.thumbnail}
                  alt={videosData.featured.main.title}
                  className="w-100 h-100 object-fit-cover"
                  style={{ opacity: 0.92 }}
                />
                <span
                  className="position-absolute top-0 start-0 m-3 px-3 py-1 rounded-pill fw-bold text-white text-uppercase"
                  style={{ backgroundColor: '#0062cc', fontSize: '0.7rem', letterSpacing: '0.4px' }}
                >
                  {videosData.featured.main.tag}
                </span>
                <span
                  className="position-absolute bottom-0 end-0 m-3 px-2 py-1 text-white fw-semibold"
                  style={{ backgroundColor: 'rgba(15, 23, 42, 0.78)', borderRadius: '6px', fontSize: '0.75rem' }}
                >
                  {videosData.featured.main.duration}
                </span>
                <div className="position-absolute top-50 start-50 translate-middle">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center text-white"
                    style={{
                      width: '62px',
                      height: '62px',
                      backgroundColor: 'rgba(15, 23, 42, 0.45)',
                      border: '2.5px solid #ffffff'
                    }}
                  >
                    <i className="fas fa-play fs-5 ps-1"></i>
                  </div>
                </div>
              </div>
            </div>

            {/* Featured Info + 2 Borderless Horizontal Video Sub-Cards */}
            <div className="col-12 col-lg-5 d-flex flex-column justify-content-between ps-lg-3">
              <div className="mb-3">
                <span className="text-uppercase fw-semibold d-block mb-1" style={{ color: '#0054a6', fontSize: '0.74rem', letterSpacing: '0.6px' }}>
                  FEATURED VIDEO
                </span>
                <h2 className="fw-bold mb-2" style={{ color: '#004282', fontSize: '1.5rem' }}>
                  {videosData.featured.main.title}
                </h2>
                <p className="mb-3" style={{ color: '#334155', fontSize: '0.88rem', lineHeight: '1.55' }}>
                  {videosData.featured.main.subtitle}
                </p>
                <button
                  type="button"
                  className="btn btn-link p-0 fw-semibold text-decoration-none d-inline-flex align-items-center gap-2"
                  style={{ color: '#0054a6', fontSize: '0.86rem' }}
                  onClick={() => openVideo(videosData.featured.main)}
                >
                  <span style={{ borderBottom: '1.5px solid #0054a6', paddingBottom: '2px' }}>Watch Video</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* 2 Smaller Cards (No border box, full 2-line wrapped description, #004282 title) */}
              <div className="d-flex flex-column gap-3 mt-1">
                {videosData.featured.sub.map((v) => (
                  <div
                    key={v.id}
                    className="d-flex align-items-center gap-3"
                    style={{ cursor: 'pointer' }}
                    onClick={() => openVideo(v)}
                  >
                    <div className="position-relative overflow-hidden flex-shrink-0 bg-dark" style={{ width: '162px', height: '94px', borderRadius: '8px' }}>
                      <img src={v.thumbnail} alt={v.title} className="w-100 h-100 object-fit-cover" />
                      <div className="position-absolute top-50 start-50 translate-middle">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center text-white"
                          style={{ width: '32px', height: '32px', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1.5px solid #ffffff' }}
                        >
                          <i className="fas fa-play" style={{ fontSize: '0.68rem', paddingLeft: '2px' }}></i>
                        </div>
                      </div>
                      <span
                        className="position-absolute bottom-0 end-0 m-2 px-1 py-0 text-white fw-semibold"
                        style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', fontSize: '0.66rem' }}
                      >
                        {v.duration}
                      </span>
                    </div>

                    <div className="flex-fill">
                      <span className="text-uppercase fw-semibold d-block" style={{ color: '#475569', fontSize: '0.68rem', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        {v.category}
                      </span>
                      <h6 className="fw-bold mb-1" style={{ color: '#004282', fontSize: '0.94rem', lineHeight: '1.3' }}>
                        {v.title}
                      </h6>
                      <p className="mb-0" style={{ color: '#334155', fontSize: '0.76rem', lineHeight: '1.4' }}>
                        {v.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Horizontal Category Tabs Strip */}
      <section className="py-3 bg-white">
        <div className="site-container">
          <div
            className="d-flex align-items-center overflow-x-auto bg-white"
            style={{ scrollbarWidth: 'none', border: '1px solid #e2e8f0', borderRadius: '6px' }}
          >
            {videosData.categories.map((cat, cIdx) => {
              const isCatActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="btn border-0 rounded-0 px-3 py-2 d-inline-flex align-items-center justify-content-center gap-2 flex-fill flex-shrink-0"
                  style={{
                    color: isCatActive ? '#004282' : '#1e293b',
                    backgroundColor: isCatActive ? '#f1f6fc' : '#ffffff',
                    fontWeight: isCatActive ? 700 : 500,
                    fontSize: '0.8rem',
                    borderRight: cIdx < videosData.categories.length - 1 ? '1px solid #e2e8f0' : 'none',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => setActiveCategory(cat.id)}
                >
                  <span style={{ color: isCatActive ? '#004282' : '#475569' }}>
                    {renderCategoryOutlineIcon(cat.id)}
                  </span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Sub-Categories Sidebar + Borderless Video Grid + Clean Circular Pagination */}
      <section className="pt-2 pb-5 bg-white">
        <div className="site-container">
          <div className="row g-4">
            {/* Left Sub-Categories List (Desktop Only) */}
            <div className="col-12 col-lg-3 d-none d-lg-block">
              <div className="bg-white overflow-hidden shadow-xs" style={{ border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div
                  className="sidebar-cat-heading fw-bold px-3 py-2 text-uppercase"
                  style={{ backgroundColor: '#f0f4f8', color: '#003875', fontSize: '0.9rem' }}
                >
                  Glass Fittings
                </div>
                {videosData.subCategories.map((sub, idx) => {
                  const isSubActive = activeSubCategory === sub;
                  return (
                    <button
                      key={idx}
                      type="button"
                      className="btn text-start w-100 rounded-0 border-0"
                      style={{
                        padding: '12px 16px',
                        fontSize: '0.86rem',
                        fontWeight: isSubActive ? 700 : 500,
                        color: isSubActive ? '#004282' : '#334155',
                        backgroundColor: isSubActive ? '#f1f5f9' : '#ffffff',
                        borderBottom: idx < videosData.subCategories.length - 1 ? '1px solid #f1f5f9' : 'none'
                      }}
                      onClick={() => setActiveSubCategory(sub)}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Video Grid */}
            <div className="col-12 col-lg-9">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 mb-5">
                {videosData.videos.map((vid) => (
                  <div className="col" key={vid.id}>
                    <div
                      className="h-100 bg-white video-grid-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => openVideo(vid)}
                    >
                      <div className="position-relative overflow-hidden bg-dark mb-2" style={{ height: '165px', borderRadius: '10px' }}>
                        <img
                          src={vid.thumbnail}
                          alt={vid.title}
                          className="w-100 h-100 object-fit-cover"
                        />
                        <div className="position-absolute top-50 start-50 translate-middle">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{ width: '40px', height: '40px', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '2px solid #ffffff' }}
                          >
                            <i className="fas fa-play" style={{ fontSize: '0.78rem', paddingLeft: '2px' }}></i>
                          </div>
                        </div>
                        <span
                          className="position-absolute bottom-0 end-0 m-2 px-2 py-0 text-white fw-semibold"
                          style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', borderRadius: '4px', fontSize: '0.7rem' }}
                        >
                          {vid.duration}
                        </span>
                      </div>

                      <div className="pt-1">
                        <span className="text-uppercase fw-medium d-block mb-1" style={{ color: '#475569', fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                          {vid.category} &nbsp;|&nbsp; {vid.year}
                        </span>
                        <h6 className="fw-bold mb-1" style={{ color: '#004282', fontSize: '0.96rem', lineHeight: '1.3' }}>
                          {vid.title}
                        </h6>
                        <p className="mb-0" style={{ color: '#334155', fontSize: '0.76rem', lineHeight: '1.45' }}>
                          {vid.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clean Borderless Pagination Matching 25 - Videos.png */}
              <div className="d-flex align-items-center justify-content-center gap-3 pt-2">
                <button
                  type="button"
                  className="btn border-0 bg-transparent px-2 py-1 d-inline-flex align-items-center gap-2"
                  style={{ color: currentPage === 1 ? '#64748b' : '#0f172a', fontSize: '0.84rem', fontWeight: 500 }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <span>&larr;</span>
                  <span>Previous</span>
                </button>
                <div className="d-flex align-items-center gap-2">
                  {[1, 2, 3, 4, 5].map((page) => {
                    const isPageActive = currentPage === page;
                    return (
                      <button
                        key={page}
                        type="button"
                        className="btn border-0 d-inline-flex align-items-center justify-content-center p-0"
                        style={
                          isPageActive
                            ? {
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: '#0054a6',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.84rem'
                              }
                            : {
                                width: '28px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: 'transparent',
                                color: '#1e293b',
                                fontWeight: 500,
                                fontSize: '0.84rem'
                              }
                        }
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <span className="px-1" style={{ color: '#334155', fontSize: '0.84rem' }}>...</span>
                </div>
                <button
                  type="button"
                  className="btn border-0 bg-transparent px-2 py-1 d-inline-flex align-items-center gap-2"
                  style={{ color: '#004282', fontSize: '0.84rem', fontWeight: 600 }}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <span>Next</span>
                  <span>&rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Floating Filter Button */}
      <div className="d-lg-none position-fixed start-50 translate-middle-x" style={{ bottom: '24px', zIndex: 1020 }}>
        <button
          type="button"
          className="btn btn-dark rounded-pill px-4 py-2 shadow-lg d-flex align-items-center gap-2 fw-semibold"
          style={{ backgroundColor: '#002b5c', borderColor: '#002b5c', fontSize: '0.88rem' }}
          onClick={() => setMobileFilterOpen(true)}
          aria-label="Open Video Filters"
        >
          <i className="fas fa-filter text-warning"></i>
          <span>Filters</span>
        </button>
      </div>

      {/* Mobile Filter Bottom Sheet Drawer */}
      <div
        className={`mobile-filter-backdrop ${mobileFilterOpen ? 'open' : ''}`}
        onClick={() => setMobileFilterOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`mobile-filter-drawer ${mobileFilterOpen ? 'open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filter Videos"
      >
        <div className="mobile-filter-handle" />

        <div className="mobile-filter-header">
          <div className="d-flex align-items-center gap-2">
            <i className="fas fa-filter text-primary"></i>
            <h5 className="mb-0 fw-bold text-dark" style={{ fontSize: '1.05rem' }}>Filters</h5>
          </div>
        </div>

        <div className="mobile-filter-body">
          <div className="mb-3">
            <div
              className="fw-bold text-uppercase mb-2 text-dark"
              style={{ fontSize: '0.82rem', letterSpacing: '0.5px' }}
            >
              Glass Fittings
            </div>
            <div className="d-flex flex-column gap-1">
              {videosData.subCategories.map((sub, idx) => {
                const isSubActive = activeSubCategory === sub;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`btn text-start w-100 py-2 px-3 rounded-2 border-0 ${
                      isSubActive ? 'bg-primary text-white fw-bold' : 'bg-light text-dark'
                    }`}
                    style={{ fontSize: '0.88rem' }}
                    onClick={() => {
                      setActiveSubCategory(sub);
                      setMobileFilterOpen(false);
                    }}
                  >
                    {sub}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mobile-filter-footer p-3 border-top bg-white d-flex gap-2">
          <button
            type="button"
            className="btn btn-primary flex-fill fw-bold"
            onClick={() => setMobileFilterOpen(false)}
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Video Player Modal */}
      {selectedVideo && (
        <div className="app-modal-backdrop" onClick={closeVideo}>
          <div
            className="app-modal-dialog"
            style={{ maxWidth: '860px', backgroundColor: '#000000' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="d-flex align-items-center justify-content-between p-3 bg-dark text-white">
              <h5 className="mb-0 text-white fw-bold">{selectedVideo.title}</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={closeVideo}
                aria-label="Close"
              ></button>
            </div>
            <div className="position-relative" style={{ paddingTop: '56.25%' }}>
              <iframe
                title={selectedVideo.title}
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                className="position-absolute top-0 start-0 w-100 h-100 border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
