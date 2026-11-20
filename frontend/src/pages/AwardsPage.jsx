import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import awardsData from '../data/awardsData.json';

export default function AwardsPage() {
  const { stats, featuredAward, awardsList, milestones, certifications } = awardsData;

  const renderStatOutlineIcon = (idx) => {
    if (idx === 0) {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00458b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
          <path d="M4 22h16" />
          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
          <polygon points="12 5 12.8 6.8 14.7 7 13.3 8.3 13.7 10.2 12 9.2 10.3 10.2 10.7 8.3 9.3 7 11.2 6.8 12 5" />
        </svg>
      );
    }
    if (idx === 1) {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00458b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m11 17 2 2a1 1 0 1 0 3-3" />
          <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
          <path d="m21 3 1 11h-2" />
          <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
          <path d="M3 4h8" />
        </svg>
      );
    }
    if (idx === 2) {
      return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00458b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="9" r="6.5" />
          <polygon points="12 5.6 13 7.7 15.3 8 13.6 9.6 14 11.9 12 10.8 10 11.9 10.4 9.6 8.7 8 11 7.7 12 5.6" />
          <path d="M9 14.5 7.5 22l4.5-2.2 4.5 2.2-1.5-7.5" />
        </svg>
      );
    }
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00458b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  };

  return (
    <div className="awards-page bg-white">
      {/* 1. Hero Banner (Image Only, No Text/Buttons) */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="TAITON Awards & Achievements"
      />

      {/* 2. Breadcrumb ALWAYS below banner */}
      <Breadcrumb items={[{ label: 'Awards & Achievements' }]} />

      {/* 3. Top Stats Strip: Single rounded strip matching Figma */}
      <section className="pt-2 pb-4 bg-white">
        <div className="site-container">
          <div
            className="rounded-4 overflow-hidden border shadow-xs p-3 p-md-4"
            style={{ backgroundColor: '#f0f6fc', borderColor: '#e2e8f0', borderRadius: '16px' }}
          >
            <div className="row g-0 align-items-center text-center">
              {stats.map((stat, idx) => (
                <div
                  className={`col-6 col-md-3 py-2 px-3 ${
                    idx < stats.length - 1 ? 'border-end' : ''
                  }`}
                  key={idx}
                  style={{ borderColor: '#d0e0f0' }}
                >
                  <div className="d-flex align-items-center justify-content-center gap-3">
                    <div className="flex-shrink-0">
                      {renderStatOutlineIcon(idx)}
                    </div>
                    <div className="text-start">
                      <div className="fw-extrabold lh-1 mb-1" style={{ fontSize: '1.9rem', color: '#003875' }}>
                        {stat.value}
                      </div>
                      <div className="fw-medium" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Recognition Card (NO padding around left image matching Figma) */}
      <section className="py-3 bg-white">
        <div className="site-container">
          <div
            className="card border shadow-xs overflow-hidden position-relative p-0"
            style={{
              background: 'linear-gradient(90deg, #ffffff 42%, #e8f1fb 100%)',
              borderColor: '#e2e8f0',
              borderRadius: '14px'
            }}
          >
            <span
              className="position-absolute top-0 end-0 px-3 py-1 text-white fw-semibold"
              style={{
                backgroundColor: '#004282',
                borderBottomLeftRadius: '6px',
                borderTopRightRadius: '14px',
                fontSize: '0.8rem',
                letterSpacing: '0.3px',
                zIndex: 2
              }}
            >
              {featuredAward.badge}
            </span>

            <div className="row g-0 align-items-stretch">
              <div className="col-12 col-md-5 p-0 overflow-hidden">
                <img
                  src={featuredAward.image}
                  alt={featuredAward.title}
                  className="w-100 h-100 object-fit-cover d-block featured-award-img"
                  style={{ minHeight: '260px', maxHeight: '360px' }}
                />
              </div>

              <div className="col-12 col-md-7 p-4 p-md-5 d-flex flex-column justify-content-center">
                <h3 className="fw-bold mb-1" style={{ fontSize: '1.45rem', color: '#004282' }}>
                  {featuredAward.title}
                </h3>
                <div className="fw-bold mb-2" style={{ fontSize: '0.88rem', color: '#0f172a' }}>
                  {featuredAward.presenter}
                </div>
                <div className="d-inline-flex align-items-center gap-2 mb-3" style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                  </svg>
                  <span>Year : <strong className="text-dark">{featuredAward.year}</strong></span>
                </div>
                <p className="mb-4 lh-base" style={{ fontSize: '0.84rem', color: '#1e293b' }}>
                  {featuredAward.description}
                </p>

                <div>
                  <Link
                    to="/about"
                    className="btn text-white px-3 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                    style={{ backgroundColor: '#004282', borderRadius: '6px', fontSize: '0.82rem' }}
                  >
                    <span>Know more</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Our Awards & Recognitions with SIDE LINES */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4 mb-md-5 text-center px-2">
            <span style={{ display: 'inline-block', width: '48px', height: '2px', backgroundColor: '#004282', flexShrink: 0 }}></span>
            <h2 className="section-main-title mb-0 text-uppercase text-center" style={{ color: '#003875' }}>
              OUR AWARDS &amp; RECOGNITIONS
            </h2>
            <span style={{ display: 'inline-block', width: '48px', height: '2px', backgroundColor: '#004282', flexShrink: 0 }}></span>
          </div>

          <div className="row g-4">
            {awardsList.map((award) => (
              <div className="col-12 col-sm-6 col-lg-3" key={award.id}>
                <div
                  className="card border shadow-sm overflow-hidden h-100 bg-white hover-lift"
                  style={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
                >
                  <div style={{ padding: '10px 10px 0 10px' }}>
                    <div style={{ height: '175px', borderRadius: '8px' }} className="overflow-hidden bg-light">
                      <img
                        src={award.image}
                        alt={award.title}
                        className="w-100 h-100 object-fit-cover"
                      />
                    </div>
                  </div>
                  <div className="p-3">
                    <h6 className="fw-bold mb-1" style={{ fontSize: '0.94rem', color: '#004282', lineHeight: '1.3' }}>
                      {award.title}
                    </h6>
                    <div className="fw-medium mb-2" style={{ fontSize: '0.8rem', color: '#0f172a' }}>
                      {award.presenter}
                    </div>
                    <div className="d-flex flex-column gap-1" style={{ fontSize: '0.78rem', color: '#1e293b' }}>
                      <div className="d-flex align-items-center gap-2">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{award.location}</span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="18" x="3" y="4" rx="2" />
                          <line x1="16" x2="16" y1="2" y2="6" />
                          <line x1="8" x2="8" y1="2" y2="6" />
                          <line x1="3" x2="21" y1="10" y2="10" />
                        </svg>
                        <span>{award.year}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Our Milestones with SIDE LINES */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4 mb-md-5 text-center px-2">
            <span style={{ display: 'inline-block', width: '48px', height: '2px', backgroundColor: '#004282', flexShrink: 0 }}></span>
            <h2 className="section-main-title mb-0 text-uppercase text-center" style={{ color: '#003875' }}>
              OUR MILESTONES
            </h2>
            <span style={{ display: 'inline-block', width: '48px', height: '2px', backgroundColor: '#004282', flexShrink: 0 }}></span>
          </div>

          {/* Timeline visualization */}
          <div className="position-relative py-4 px-2">
            {/* Horizontal timeline connecting line with terminating arrow after 2026 */}
            <div
              className="position-absolute start-0 end-0 d-none d-md-flex align-items-center"
              style={{ top: '56px', zIndex: 1, paddingLeft: '24px', paddingRight: '8px' }}
            >
              <div style={{ flex: 1, height: '3.5px', backgroundColor: '#003875' }}></div>
              <svg width="20" height="22" viewBox="0 0 20 22" style={{ flexShrink: 0, marginLeft: '-2px' }}>
                <polygon points="0,2 20,11 0,20" fill="#003875" />
              </svg>
            </div>

            <div className="row g-4 justify-content-between position-relative z-2">
              {milestones.map((ms, idx) => (
                <div className="col-12 col-md text-center" key={idx}>
                  <div
                    className="rounded-circle text-white d-inline-flex align-items-center justify-content-center fw-bold shadow-sm mx-auto mb-3"
                    style={{ width: '68px', height: '68px', fontSize: '1.1rem', backgroundColor: '#003875', border: '5px solid #ffffff' }}
                  >
                    {ms.year}
                  </div>
                  <h6 className="fw-bold mb-1" style={{ fontSize: '0.96rem', color: '#003875' }}>{ms.title}</h6>
                  <p className="mb-0 lh-sm mx-auto" style={{ fontSize: '0.8rem', color: '#334155', maxWidth: '170px' }}>
                    {ms.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Certifications & Recognition with SIDE LINES */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="d-flex align-items-center justify-content-center gap-3 mb-4 text-center px-2">
            <span style={{ display: 'inline-block', width: '48px', height: '2px', backgroundColor: '#004282', flexShrink: 0 }}></span>
            <h2 className="section-main-title mb-0 text-uppercase text-center" style={{ color: '#003875' }}>
              CERTIFICATIONS &amp; RECOGNITION
            </h2>
            <span style={{ display: 'inline-block', width: '48px', height: '2px', backgroundColor: '#004282', flexShrink: 0 }}></span>
          </div>

          <div className="text-center">
            <img
              src="/images/certifications_full_row.png"
              alt="Certifications: ISO 9001:2015, CE, Make in India, IIDC, IIID"
              className="w-100 h-auto rounded-3"
              style={{ maxWidth: '1240px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA Banner matching Figma */}
      <section className="py-4 bg-white">
        <div className="site-container">
          <div
            className="rounded-4 px-4 py-3 px-md-5 py-md-4 text-white d-flex flex-wrap align-items-center justify-content-between gap-4"
            style={{
              background: 'linear-gradient(90deg, #041d42 0%, #093b75 55%, #04214b 100%)',
              borderRadius: '14px'
            }}
          >
            <div className="d-flex align-items-center gap-3">
              <img
                src="/images/awards_cta_trophy.png"
                alt="Award Trophy"
                style={{ width: '64px', height: '82px', objectFit: 'contain', flexShrink: 0 }}
              />
              <div>
                <div style={{ color: '#ffffff', fontSize: '1.22rem', fontWeight: 400, lineHeight: '1.35' }}>
                  Our Journey is Built on Trust,
                </div>
                <div style={{ color: '#ffffff', fontSize: '1.3rem', fontWeight: 700, lineHeight: '1.35' }}>
                  Quality &amp; Innovation.
                </div>
              </div>
            </div>

            <div className="d-none d-lg-block" style={{ width: '1px', height: '48px', backgroundColor: 'rgba(255,255,255,0.28)' }}></div>

            <div className="text-center text-lg-start">
              <p className="mb-0" style={{ color: '#ffffff', fontSize: '0.92rem', fontWeight: 400, lineHeight: '1.45', maxWidth: '250px' }}>
                Join hands with TAITON for better architectural solutions.
              </p>
            </div>

            <div className="d-none d-lg-block" style={{ width: '1px', height: '48px', backgroundColor: 'rgba(255,255,255,0.28)' }}></div>

            <div className="d-flex align-items-center gap-3 ms-auto ms-lg-0">
              <Link
                to="/contact"
                className="btn bg-white fw-bold px-4 py-2"
                style={{ color: '#003875', borderRadius: '6px', fontSize: '0.86rem' }}
              >
                Contact Us
              </Link>
              <Link
                to="/contact"
                className="btn fw-semibold px-4 py-2 text-white"
                style={{ borderRadius: '6px', fontSize: '0.86rem', border: '1.5px solid #ffffff', backgroundColor: 'transparent' }}
              >
                Become a Dealer
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

