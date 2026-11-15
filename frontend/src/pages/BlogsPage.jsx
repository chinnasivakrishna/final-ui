import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import blogsData from '../data/blogsData.json';

export default function BlogsPage() {
  const { pills, featured, sidebarCategories, posts, trending } = blogsData;
  const [activePill, setActivePill] = useState('All');
  const [activeSidebarCat, setActiveSidebarCat] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPosts = posts.filter((post) => {
    const matchesPill = activePill === 'All' || post.category === activePill;
    const matchesSidebar = !activeSidebarCat || post.category === activeSidebarCat;
    const matchesSearch = !searchQuery || post.title.toLowerCase().includes(searchQuery.toLowerCase()) || post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPill && matchesSidebar && matchesSearch;
  });

  return (
    <div className="blogs-page bg-white">
      {/* 1. Hero Banner (Image Only, No Text/Buttons) */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="TAITON Blogs & Articles"
      />

      {/* 2. Breadcrumb ALWAYS below banner */}
      <Breadcrumb items={[{ label: 'Blogs' }]} />

      {/* 3. Category Filter Pills & Search */}
      <section className="py-3 bg-white border-bottom">
        <div className="site-container">
          <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
            <div className="d-flex flex-wrap align-items-center gap-2">
              {pills.map((pill) => (
                <button
                  key={pill}
                  type="button"
                  className={`btn rounded-pill px-3 py-1 small fw-semibold transition-all ${
                    activePill === pill
                      ? 'btn-primary shadow-sm'
                      : 'btn-outline-secondary border text-secondary bg-white'
                  }`}
                  style={{ fontSize: '0.78rem' }}
                  onClick={() => {
                    setActivePill(pill);
                    setActiveSidebarCat('');
                  }}
                >
                  {pill}
                </button>
              ))}
            </div>

            <div className="position-relative" style={{ minWidth: '240px', maxWidth: '340px', width: '100%' }}>
              <input
                type="text"
                className="form-control rounded-3 ps-3 pe-5 border-secondary-subtle shadow-sm"
                placeholder="Search blogs..."
                style={{ fontSize: '0.85rem' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="btn position-absolute top-50 end-0 translate-middle-y me-2 text-muted border-0 p-0"
                aria-label="Search"
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Blog Card */}
      <section className="py-4 bg-white">
        <div className="site-container">
          <div className="card rounded-4 border shadow-sm overflow-hidden bg-white">
            <div className="row g-0 align-items-center">
              <div className="col-12 col-lg-5 p-4 p-md-5">
                <span className="badge bg-primary px-3 py-1 rounded-pill fw-semibold small mb-3">
                  {featured.badge}
                </span>
                <h2 className="display-6 fw-bold text-taiton-dark mb-2" style={{ fontSize: '1.8rem' }}>
                  {featured.title}
                </h2>
                <p className="text-secondary small mb-4 lh-base">
                  {featured.subtitle}
                </p>
                <Link
                  to="/blog-detail"
                  className="btn btn-outline-dark rounded-pill px-4 py-2 small fw-semibold d-inline-flex align-items-center gap-2"
                  style={{ fontSize: '0.85rem' }}
                >
                  <span>Read More</span> <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              <div className="col-12 col-lg-7">
                <div style={{ height: '320px' }}>
                  <img
                    src={featured.image}
                    alt={featured.title}
                    className="w-100 h-100 object-fit-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Main Content: Sidebar + Latest Blogs Grid */}
      <section className="py-4 bg-white">
        <div className="site-container">
          <div className="row g-4">
            {/* Left Sidebar: Filter Categories */}
            <div className="col-12 col-lg-3">
              <div className="card rounded-3 border shadow-sm p-3 bg-white sticky-top" style={{ top: '100px' }}>
                <h6 className="fw-bold text-dark text-uppercase mb-3 small" style={{ letterSpacing: '0.5px' }}>
                  FILTER CATEGORIES
                </h6>

                <div className="d-flex flex-column gap-1">
                  {sidebarCategories.map((cat, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`btn w-100 text-start py-2 px-3 rounded-2 border-0 d-flex align-items-center justify-content-between transition-all ${
                        activeSidebarCat === cat ? 'bg-light text-primary fw-bold' : 'text-secondary hover-blue'
                      }`}
                      style={{ fontSize: '0.82rem' }}
                      onClick={() => setActiveSidebarCat(activeSidebarCat === cat ? '' : cat)}
                    >
                      <span>{cat}</span>
                      <i className="fas fa-chevron-right small text-muted"></i>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Main Area: Latest Blogs Grid */}
            <div className="col-12 col-lg-9">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold text-dark mb-0 text-uppercase small" style={{ letterSpacing: '0.5px' }}>
                  LATEST BLOGS
                </h5>
                <Link to="/blogs" className="btn-action-link" style={{ fontSize: '0.82rem' }}>
                  View All Blogs <i className="fas fa-arrow-right"></i>
                </Link>
              </div>

              <div className="row g-4">
                {filteredPosts.map((post) => (
                  <div className="col-12 col-sm-6 col-md-4" key={post.id}>
                    <div className="card rounded-3 border-0 shadow-sm overflow-hidden h-100 bg-white hover-lift">
                      <div style={{ height: '140px' }} className="overflow-hidden bg-light">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-100 h-100 object-fit-cover hover-scale"
                        />
                      </div>
                      <div className="p-3 d-flex flex-column justify-content-between flex-grow-1">
                        <div>
                          <div className="text-muted small mb-1" style={{ fontSize: '0.72rem' }}>
                            {post.date}
                          </div>
                          <h6 className="fw-bold text-dark mb-2 lh-sm" style={{ fontSize: '0.85rem' }}>
                            {post.title}
                          </h6>
                          <p className="text-secondary small mb-3 lh-sm" style={{ fontSize: '0.76rem' }}>
                            {post.excerpt}
                          </p>
                        </div>
                        <div>
                          <Link
                            to="/blog-detail"
                            className="text-primary fw-semibold small text-decoration-none d-inline-flex align-items-center gap-1"
                            style={{ fontSize: '0.78rem' }}
                          >
                            <span>Read More</span> <i className="fas fa-arrow-right"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trending Section */}
      <section className="py-5 bg-taiton-gray border-top">
        <div className="site-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-bold text-dark mb-0 text-uppercase" style={{ fontSize: '1.05rem' }}>
              Trending
            </h5>
            <div className="d-flex gap-2">
              <button className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: '32px', height: '32px' }} aria-label="Previous">
                <i className="fas fa-chevron-left small"></i>
              </button>
              <button className="btn btn-sm btn-outline-secondary rounded-circle" style={{ width: '32px', height: '32px' }} aria-label="Next">
                <i className="fas fa-chevron-right small"></i>
              </button>
            </div>
          </div>

          <div className="row g-3">
            {trending.map((item, idx) => (
              <div className="col-12 col-sm-6 col-lg-3" key={idx}>
                <div className="card rounded-3 border-0 shadow-sm p-3 bg-white h-100 d-flex flex-row align-items-center gap-3 hover-lift">
                  <div className="rounded-2 overflow-hidden flex-shrink-0" style={{ width: '60px', height: '60px' }}>
                    <img src={item.image} alt={item.title} className="w-100 h-100 object-fit-cover" />
                  </div>
                  <div>
                    <div className="text-muted fw-bold small" style={{ fontSize: '0.72rem' }}>{item.num}</div>
                    <div className="fw-bold text-dark lh-sm" style={{ fontSize: '0.8rem' }}>
                      {item.title}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Never Miss an Update Newsletter */}
      <section className="py-4 bg-taiton-dark text-white border-top">
        <div className="site-container">
          <div className="row g-3 align-items-center justify-content-between">
            <div className="col-12 col-lg-7">
              <h5 className="fw-bold text-white mb-1">Never Miss an Update</h5>
              <p className="text-white-50 small mb-0">
                Subscribe to our newsletter for the latest articles and design ideas.
              </p>
            </div>

            <div className="col-12 col-lg-5 d-flex justify-content-lg-end align-items-center gap-2">
              <a href="#linkedin" className="taiton-social-icon" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
              <a href="#instagram" className="taiton-social-icon" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="#facebook" className="taiton-social-icon" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
              <a href="#twitter" className="taiton-social-icon" aria-label="X"><i className="fab fa-x-twitter"></i></a>
              <a href="#youtube" className="taiton-social-icon" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

