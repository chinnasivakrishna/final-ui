import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';

export default function ComingSoonPage({ title = 'Blogs & Insights' }) {
  return (
    <div className="coming-soon-page bg-white">
      {/* 1. Hero Banner */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt={`TAITON ${title} - Coming Soon`}
      />

      {/* 2. Breadcrumb */}
      <Breadcrumb items={[{ label: title }]} />

      {/* 3. Main Notice Section */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div
            className="card border shadow-xs rounded-4 p-4 p-md-5 text-center mx-auto position-relative overflow-hidden"
            style={{
              maxWidth: '860px',
              backgroundColor: '#ffffff',
              borderColor: '#e2e8f0',
              boxShadow: '0 10px 30px rgba(0, 43, 92, 0.06)'
            }}
          >
            {/* Background Decorative Circles */}
            <div
              className="position-absolute top-0 start-50 translate-middle-x rounded-circle pointer-events-none"
              style={{
                width: '380px',
                height: '380px',
                background: 'radial-gradient(circle, rgba(0, 84, 166, 0.05) 0%, rgba(255, 255, 255, 0) 70%)',
                zIndex: 0,
                pointerEvents: 'none'
              }}
            />

            <div className="position-relative z-1">
              {/* Animated Status Pill */}
              <div
                className="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill mb-4"
                style={{ backgroundColor: '#edf5ff', border: '1px solid #bfdbfe' }}
              >
                <span
                  className="spinner-grow spinner-grow-sm text-primary"
                  role="status"
                  aria-hidden="true"
                  style={{ width: '8px', height: '8px' }}
                ></span>
                <span className="fw-semibold text-primary" style={{ fontSize: '0.78rem', letterSpacing: '0.4px' }}>
                  CPANEL INTEGRATION IN PROGRESS
                </span>
              </div>

              {/* Server / cPanel Icon Illustration */}
              <div className="mb-4 d-flex justify-content-center">
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{
                    width: '90px',
                    height: '90px',
                    backgroundColor: '#f0f6ff',
                    border: '2px solid #dbeafe',
                    color: '#0054a6',
                    fontSize: '2.4rem'
                  }}
                >
                  <i className="fas fa-server"></i>
                </div>
              </div>

              {/* Main Heading */}
              <h2
                className="fw-bold mb-3"
                style={{
                  fontFamily: 'var(--taiton-font-heading, "Outfit", sans-serif)',
                  fontSize: 'clamp(1.5rem, 3.2vw, 2.1rem)',
                  color: '#002b5c',
                  letterSpacing: '-0.01em'
                }}
              >
                Content Will Display Once cPanel Is Ready
              </h2>

              <p
                className="text-secondary mx-auto mb-4"
                style={{ maxWidth: '620px', fontSize: '0.96rem', lineHeight: '1.65' }}
              >
                We are actively configuring our backend services and cPanel hosting environment. The official TAITON blogs, architectural project showcases, technical installation guides, and engineering news will be published and available here once the cPanel setup is complete.
              </p>

              {/* 3 Value Highlight Cards */}
              <div className="row g-3 justify-content-center text-start my-4">
                <div className="col-12 col-md-4">
                  <div
                    className="p-3 rounded-3 h-100 border"
                    style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                      <i className="fas fa-newspaper fs-5"></i>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                        Architectural Insights
                      </h6>
                    </div>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                      Deep dives into minimal frames, frameless glass fittings, and contemporary interior concepts.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div
                    className="p-3 rounded-3 h-100 border"
                    style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                      <i className="fas fa-tools fs-5"></i>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                        Technical Guides
                      </h6>
                    </div>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                      Load tolerances, glass thickness compatibility, and professional installation instructions.
                    </p>
                  </div>
                </div>

                <div className="col-12 col-md-4">
                  <div
                    className="p-3 rounded-3 h-100 border"
                    style={{ backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                  >
                    <div className="d-flex align-items-center gap-2 mb-2 text-primary">
                      <i className="fas fa-building fs-5"></i>
                      <h6 className="fw-bold mb-0 text-dark" style={{ fontSize: '0.9rem' }}>
                        Landmark Projects
                      </h6>
                    </div>
                    <p className="text-muted small mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>
                      Case studies and project showcases from hotels, airports, corporate offices, and luxury homes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Action Buttons */}
              <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 gap-sm-3 pt-3">
                <Link
                  to="/"
                  className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: '#0054a6',
                    borderColor: '#0054a6',
                    fontSize: '0.88rem',
                    boxShadow: '0 2px 8px rgba(0, 84, 166, 0.25)'
                  }}
                >
                  <i className="fas fa-home"></i>
                  <span>Back to Home</span>
                </Link>

                <Link
                  to="/products"
                  className="btn btn-outline-dark rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                  style={{ fontSize: '0.88rem', borderColor: '#cbd5e1' }}
                >
                  <i className="fas fa-th-large text-primary"></i>
                  <span>Browse Products</span>
                </Link>

                <Link
                  to="/contact"
                  className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                  style={{ fontSize: '0.88rem' }}
                >
                  <i className="fas fa-envelope"></i>
                  <span>Contact Support</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
