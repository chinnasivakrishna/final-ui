import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';

const LEADERSHIP_MEMBERS = [
  { name: 'Shiva Reddy', role: 'General Manager', image: '/images/about_leader_1.webp' },
  { name: 'Rajesh Kumar', role: 'VP - Operations', image: '/images/about_leader_2.webp' },
  { name: 'Priya Sharma', role: 'Head of Sales', image: '/images/about_leader_3.webp' },
  { name: 'Amit Patel', role: 'Technical Director', image: '/images/about_leader_4.webp' }
];

const ACHIEVEMENT_STATS = [
  { value: '2500+', label: 'Products' },
  { value: '500+', label: 'Projects' },
  { value: '100+', label: 'Dealers' },
  { value: '50+', label: 'Cities' },
  { value: '10+', label: 'Years Experience' },
  { value: '25+', label: 'Industry Partnerships' }
];

const COMMITMENTS = [
  { title: 'Quality', subtitle: 'Products that you can trust', image: '/images/about_commit_quality.webp' },
  { title: 'Innovation', subtitle: 'Solutions for a better tomorrow', image: '/images/about_commit_innovation.webp' },
  { title: 'Customer Focus', subtitle: 'Your Success is our Priority', image: '/images/about_commit_customer_focus.webp' },
  { title: 'Partnership', subtitle: 'Growing together always', image: '/images/about_commit_partnership.webp' },
  { title: 'Reliability', subtitle: 'Engineered for exceptional endurance', image: '/images/about_commit_reliability.webp' },
  { title: 'Excellence', subtitle: 'Raising standards in every detail', image: '/images/about_commit_excellence.webp' }
];

const CERTIFICATIONS = [
  { src: '/images/about_cert_iso.webp', alt: 'ISO 9001:2015 Certified', height: 52 },
  { src: '/images/about_cert_ce.webp', alt: 'CE Certified', height: 46 },
  { src: '/images/about_cert_bis.webp', alt: 'BIS / ISI Certified', height: 52 }
];

const ArrowRightIcon = ({ size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const DocumentOutlineIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="13" y2="17" />
  </svg>
);

const PlayCircleOutlineIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9.5" />
    <polygon points="10 8.5 16 12 10 15.5 10 8.5" />
  </svg>
);

const DownloadOutlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export default function AboutPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);

  return (
    <div className="about-page bg-white">
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="About TAITON Architectural Hardware"
      />

      <Breadcrumb items={[{ label: 'About us' }]} />

      {/* WHO WE ARE */}
      <section id="video-sec" className="pt-2 pb-4 bg-white">
        <div className="site-container">
          <div className="row align-items-center gy-4 gx-lg-5">
            <div className="col-12 col-lg-6">
              <span
                className="text-uppercase fw-bold d-block mb-1"
                style={{ color: '#004282', fontSize: '0.85rem', letterSpacing: '0.03em' }}
              >
                WHO WE ARE
              </span>
              <h2 className="section-main-title fw-bold mb-3" style={{ color: '#004282' }}>
                What Does TAITON Do?
              </h2>
              <p className="mb-3" style={{ color: '#334155', fontSize: '0.96rem', lineHeight: 1.65 }}>
                TAITON Architectural Hardware is a growing brand delivering premium architectural hardware glass solutions and access systems for residential, commercial and hospitality spaces.
              </p>
              <p className="mb-4" style={{ color: '#334155', fontSize: '0.96rem', lineHeight: 1.65 }}>
                Our focus is to deliver innovation, reliability and value through quality products and professional service.
              </p>

              <div className="d-flex flex-wrap gap-3 pt-1">
                <Link
                  to="/catalogues"
                  className="btn bg-white fw-semibold d-inline-flex align-items-center gap-2 hover-lift"
                  style={{
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '9px 20px',
                    fontSize: '0.9rem'
                  }}
                >
                  <DocumentOutlineIcon />
                  <span>Profile PDF</span>
                </Link>
                <button
                  type="button"
                  className="btn bg-white fw-semibold d-inline-flex align-items-center gap-2 hover-lift"
                  style={{
                    color: '#0f172a',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '9px 20px',
                    fontSize: '0.9rem'
                  }}
                  onClick={() => setShowVideoModal(true)}
                >
                  <PlayCircleOutlineIcon />
                  <span>Profile Video</span>
                </button>
              </div>
            </div>

            <div className="col-12 col-lg-6">
              <div
                className="position-relative overflow-hidden shadow-sm about-office-card ms-lg-auto"
                style={{ borderRadius: '12px', maxWidth: '588px', cursor: 'pointer' }}
                onClick={() => setShowVideoModal(true)}
              >
                <img
                  src="/images/about_building_office.webp"
                  alt="TAITON Corporate Office — Watch Our Story"
                  className="img-fluid w-100 d-block"
                />
                <button
                  type="button"
                  className="about-watch-story-hotspot d-flex align-items-center gap-2 text-start"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowVideoModal(true);
                  }}
                  aria-label="Watch Our Story video"
                >
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                    style={{ width: '36px', height: '36px', backgroundColor: '#004282', color: '#ffffff' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="8 5 19 12 8 19 8 5" />
                    </svg>
                  </span>
                  <span className="lh-sm">
                    <span className="d-block fw-bold" style={{ fontSize: '0.78rem', color: '#004282' }}>
                      Watch Our Story
                    </span>
                    <span className="d-block" style={{ fontSize: '0.66rem', color: '#475569' }}>
                      Discover how TAITON began and what drives us forward.
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR JOURNEY OF TAITON */}
      <section className="py-4 bg-white">
        <div className="site-container">
          <div
            className="overflow-hidden mx-auto"
            style={{
              borderRadius: '10px',
              boxShadow: '0 6px 24px rgba(15, 23, 42, 0.08)'
            }}
          >
            <img
              src="/images/about_journey_banner.png"
              alt="Our Journey of TAITON — Design, Innovation, Quality"
              className="img-fluid w-100 d-block"
            />
          </div>
        </div>
      </section>

      {/* OUR SUB-COMPANIES MIND MAP (Dynamic HTML/CSS/SVG UI matching backup/ui screens/02 - About Us.png) */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="text-center mb-4">
            <h2 className="section-main-title text-uppercase fw-bold mb-0" style={{ color: '#003875' }}>
              <span style={{ borderBottom: '3px solid #003875', paddingBottom: '4px', letterSpacing: '0.5px' }}>
                OUR SUB-COMPANIES
              </span>
            </h2>
          </div>

          <div className="table-responsive border-0 overflow-x-auto text-center py-2">
            <div
              className="position-relative mx-auto my-3"
              style={{ minWidth: '850px', maxWidth: '1000px', minHeight: '440px' }}
            >
              {/* Connecting SVG Lines */}
              <svg
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ zIndex: 1, pointerEvents: 'none' }}
                viewBox="0 0 1000 440"
                preserveAspectRatio="none"
              >
                {/* Center (500, 220) to Top-Left (280, 85) */}
                <path d="M 445 165 L 360 85 L 290 85" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                {/* Center (500, 220) to Bottom-Left (280, 355) */}
                <path d="M 445 275 L 360 355 L 280 355" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                {/* Center (500, 220) to Top-Right (720, 85) */}
                <path d="M 555 165 L 640 85 L 720 85" stroke="#cbd5e1" strokeWidth="2" fill="none" />
                {/* Center (500, 220) to Bottom-Right (720, 355) */}
                <path d="M 555 275 L 640 355 L 720 355" stroke="#cbd5e1" strokeWidth="2" fill="none" />
              </svg>

              {/* Center Main Taiton Circle Badge */}
              <div
                className="position-absolute top-50 start-50 translate-middle bg-white rounded-circle shadow d-flex flex-column align-items-center justify-content-center p-3 text-center border border-2 border-light hover-lift"
                style={{
                  width: '165px',
                  height: '165px',
                  zIndex: 2,
                  boxShadow: '0 12px 28px rgba(0, 56, 117, 0.12)'
                }}
              >
                <div className="d-flex align-items-center justify-content-center mb-1">
                  <svg width="34" height="30" viewBox="0 0 36 32" fill="none">
                    <polygon points="18,2 34,30 2,30" stroke="#003875" strokeWidth="2.5" fill="none" />
                    <text x="18" y="24" fontSize="16" fontWeight="900" fill="#003875" textAnchor="middle" fontFamily="sans-serif">T</text>
                  </svg>
                </div>
                <span className="fw-black mb-0" style={{ color: '#003875', fontSize: '1.25rem', letterSpacing: '1px', lineHeight: 1.05 }}>
                  TAITON
                </span>
                <span className="fw-semibold text-muted" style={{ fontSize: '0.62rem', letterSpacing: '0.4px', marginTop: '3px' }}>
                  Architectural Hardware
                </span>
              </div>

              {/* Sub-Company 1: TRILLIONS (Top-Left) */}
              <div
                className="position-absolute bg-white rounded-pill shadow-sm px-4 py-3 border border-light text-center hover-lift d-flex align-items-center justify-content-center gap-2"
                style={{
                  top: '52px',
                  left: '70px',
                  zIndex: 2,
                  width: '230px',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#003875" strokeWidth="2">
                  <rect x="3" y="3" width="8" height="18" rx="1" />
                  <rect x="13" y="3" width="8" height="18" rx="1" />
                </svg>
                <div className="text-start">
                  <div className="fw-bold fs-5 mb-0" style={{ color: '#003875', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                    TRILLIONS
                  </div>
                  <div style={{ fontSize: '0.58rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.4px' }}>
                    ALUMINIUM DOORS &amp; WINDOWS
                  </div>
                </div>
              </div>

              {/* Sub-Company 2: maxía (Bottom-Left) */}
              <div
                className="position-absolute bg-white rounded-pill shadow-sm px-4 py-3 border border-light text-center hover-lift d-flex align-items-center justify-content-center"
                style={{
                  top: '320px',
                  left: '80px',
                  zIndex: 2,
                  width: '200px',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="fw-bold mb-0" style={{ color: '#003875', fontSize: '1.5rem', letterSpacing: '0.5px' }}>
                  maxía<sup style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0054a6' }}>&reg;</sup>
                </div>
              </div>

              {/* Sub-Company 3: TAVIC (Top-Right) */}
              <div
                className="position-absolute bg-white rounded-pill shadow-sm px-4 py-3 border border-light text-center hover-lift d-flex align-items-center justify-content-center"
                style={{
                  top: '52px',
                  right: '70px',
                  zIndex: 2,
                  width: '200px',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)'
                }}
              >
                <div className="fw-extrabold mb-0" style={{ color: '#004282', fontSize: '1.55rem', letterSpacing: '2px', display: 'flex', alignItems: 'center' }}>
                  TAV<span style={{ position: 'relative', display: 'inline-block' }}>I<span style={{ position: 'absolute', top: '2px', left: '50%', transform: 'translateX(-50%)', width: '4px', height: '4px', backgroundColor: '#e11d48', borderRadius: '50%' }}></span></span>C
                </div>
              </div>

              {/* Sub-Company 4: TIMES GLASS (Bottom-Right) */}
              <div
                className="position-absolute bg-white rounded-pill shadow-sm px-4 py-3 border border-light text-center hover-lift d-flex align-items-center justify-content-center gap-2"
                style={{
                  top: '320px',
                  right: '70px',
                  zIndex: 2,
                  width: '230px',
                  boxShadow: '0 6px 18px rgba(0, 0, 0, 0.06)'
                }}
              >
                <svg width="26" height="26" viewBox="0 0 32 32" fill="none">
                  <path d="M4 8h16l-8 16H4z" fill="#003875" />
                  <path d="M14 8h14v6h-8v10h-6z" fill="#0284c7" />
                </svg>
                <div className="text-start">
                  <div className="fw-bold fs-5 mb-0" style={{ color: '#003875', letterSpacing: '0.5px', lineHeight: 1.1 }}>
                    TIMES GLASS
                  </div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#64748b', letterSpacing: '1px' }}>
                    INDUSTRIES
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* OUR PRESENCE & OUR ACHIEVEMENTS */}
      <section id="locations-sec" className="py-5 bg-white">
        <div className="site-container">
          <div className="row align-items-center gy-4 mb-5">
            <div className="col-12 col-lg-5">
              <h2 className="section-main-title text-uppercase fw-bold mb-3" style={{ color: '#004282' }}>
                OUR PRESENCE
              </h2>
              <p className="mb-3" style={{ color: '#1e293b', fontSize: '0.96rem', lineHeight: 1.55, maxWidth: '330px' }}>
                Delivering our solutions across india and growth globally
              </p>
              <div style={{ width: '118px', height: '1.5px', backgroundColor: '#475569' }} className="mb-4" />

              <div className="d-flex flex-wrap align-items-start gap-5 mb-4">
                <div>
                  <div className="fw-semibold mb-1" style={{ color: '#004282', fontSize: '2.1rem', lineHeight: 1.05 }}>
                    25+
                  </div>
                  <div className="fw-medium" style={{ color: '#004282', fontSize: '0.9rem' }}>
                    Branches
                  </div>
                </div>
                <div>
                  <div className="fw-semibold mb-1" style={{ color: '#004282', fontSize: '2.1rem', lineHeight: 1.05 }}>
                    15+
                  </div>
                  <div className="fw-medium" style={{ color: '#004282', fontSize: '0.9rem' }}>
                    Experience Centers
                  </div>
                </div>
              </div>

              <Link
                to="/experience-center"
                className="btn fw-semibold d-inline-flex align-items-center gap-2 hover-lift"
                style={{
                  backgroundColor: '#004282',
                  color: '#ffffff',
                  borderRadius: '6px',
                  padding: '10px 22px',
                  fontSize: '0.9rem'
                }}
              >
                <span>View All Locations</span>
                <ArrowRightIcon size={16} />
              </Link>
            </div>

            <div className="col-12 col-lg-7">
              <div
                className="bg-white text-center mx-auto"
                style={{
                  borderRadius: '14px',
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 8px 30px rgba(15, 23, 42, 0.08)',
                  padding: '22px 28px'
                }}
              >
                <img
                  src="/images/about_presence_map.webp"
                  alt="TAITON Presence Map Across India"
                  className="img-fluid mx-auto d-block"
                  style={{ maxHeight: '410px', objectFit: 'contain', mixBlendMode: 'multiply' }}
                />
              </div>
            </div>
          </div>

          <div
            className="position-relative overflow-hidden text-white"
            style={{
              background: 'linear-gradient(90deg, #003166 0%, #004386 68%, #00346d 100%)',
              borderRadius: '8px',
              padding: '22px 32px'
            }}
          >
            <img
              src="/images/about_achieve_blueprint_right.png"
              alt=""
              aria-hidden="true"
              className="position-absolute top-0 end-0 h-100 d-none d-md-block"
              style={{ objectFit: 'cover', opacity: 0.9, pointerEvents: 'none' }}
            />
            <div className="position-relative z-1">
              <div
                className="text-uppercase fw-semibold mb-3"
                style={{ fontSize: '0.78rem', letterSpacing: '0.06em', color: '#e2e8f0' }}
              >
                OUR ACHIEVEMENTS
              </div>
              <div className="row text-center align-items-center g-3">
                {ACHIEVEMENT_STATS.map((stat, idx) => (
                  <div
                    key={stat.label}
                    className={`col-6 col-sm-4 col-md-2 ${idx < ACHIEVEMENT_STATS.length - 1 ? 'about-achieve-stat-divider' : ''}`}
                  >
                    <div className="fw-bold text-white mb-1" style={{ fontSize: 'clamp(1.35rem, 2vw, 1.75rem)', lineHeight: 1.1 }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#dbeafe' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP TEAM */}
      <section id="team-sec" className="py-5 bg-white">
        <div className="site-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-main-title text-uppercase fw-bold mb-0" style={{ color: '#004282' }}>
              LEADERSHIP TEAM
            </h2>
            <Link
              to="/our-team"
              className="text-decoration-none d-inline-flex align-items-center gap-2 fw-medium"
              style={{ color: '#1e293b', fontSize: '0.9rem' }}
            >
              <span>View All TEAM</span>
              <ArrowRightIcon size={16} />
            </Link>
          </div>

          <div className="row g-4">
            {LEADERSHIP_MEMBERS.map((member) => (
              <div className="col-6 col-md-3" key={member.name}>
                <div className="text-center">
                  <div
                    className="bg-white overflow-hidden mb-3"
                    style={{
                      borderRadius: '10px',
                      border: '1px solid #f1f5f9',
                      boxShadow: '0 4px 18px rgba(15, 23, 42, 0.06)'
                    }}
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="img-fluid w-100 d-block"
                      style={{ aspectRatio: '227 / 268', objectFit: 'cover', objectPosition: 'top center' }}
                    />
                  </div>
                  <h6 className="fw-bold mb-1" style={{ color: '#004282', fontSize: '0.98rem' }}>
                    {member.name}
                  </h6>
                  <div style={{ color: '#334155', fontSize: '0.84rem' }}>
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OUR VISION & OUR MISSION */}
      <section className="w-100 py-0">
        <div className="container-fluid p-0">
          <div className="row g-0 align-items-stretch">
            <div
              className="col-12 col-md-6 position-relative overflow-hidden text-white"
              style={{
                background: 'linear-gradient(135deg, #003875 0%, #004c96 100%)',
                minHeight: '210px'
              }}
            >
              <img
                src="/images/about_vision_wireframe.webp"
                alt=""
                aria-hidden="true"
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ objectFit: 'cover', opacity: 0.9, pointerEvents: 'none' }}
              />
              <div
                aria-hidden="true"
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ background: 'linear-gradient(90deg, rgba(0, 42, 92, 0.52) 0%, rgba(0, 62, 128, 0.72) 100%)', pointerEvents: 'none' }}
              />
              <div className="position-relative z-1 d-flex align-items-center justify-content-lg-end h-100 py-5 px-4 px-lg-5">
                <div className="d-flex align-items-start gap-4 w-100" style={{ maxWidth: '520px' }}>
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0 mt-1"
                    aria-hidden="true"
                  >
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <div>
                    <h3 className="fw-bold text-white mb-2" style={{ fontSize: '1.5rem' }}>
                      Our Vision
                    </h3>
                    <p className="mb-0" style={{ color: '#e2e8f0', fontSize: '0.96rem', lineHeight: 1.55 }}>
                      To become India's most trusted provider of innovative architectural hardware and glass solutions.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="col-12 col-md-6 position-relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #f3f6fb 0%, #e9eff7 100%)',
                minHeight: '210px'
              }}
            >
              <img
                src="/images/about_mission_wireframe.webp"
                alt=""
                aria-hidden="true"
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{ objectFit: 'cover', opacity: 0.88, pointerEvents: 'none' }}
              />
              <div className="position-relative z-1 d-flex align-items-center h-100 py-5 px-4 px-lg-5">
                <div className="d-flex align-items-start gap-4 w-100" style={{ maxWidth: '520px' }}>
                  <svg
                    width="42"
                    height="42"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#004282"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="flex-shrink-0 mt-1"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="5" />
                    <circle cx="12" cy="12" r="1.5" />
                  </svg>
                  <div>
                    <h3 className="fw-bold mb-2" style={{ color: '#004282', fontSize: '1.5rem' }}>
                      Our Mission
                    </h3>
                    <p className="mb-0" style={{ color: '#004282', fontSize: '0.96rem', lineHeight: 1.55 }}>
                      To deliver quality products, technical expertise, and dependable support that help customers create exceptional spaces.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR COMMITMENT */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="mb-4">
            <h2 className="section-main-title text-uppercase fw-bold mb-1" style={{ color: '#004282' }}>
              OUR COMMITMENT
            </h2>
            <p className="mb-0" style={{ color: '#1e293b', fontSize: '0.96rem' }}>
              We are committed to creating long-term value for our customers and partners.
            </p>
          </div>

          <div className="row g-4 gy-4 pt-2">
            {COMMITMENTS.map((item) => (
              <div className="col-12 col-sm-6 col-md-4" key={item.title}>
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="flex-shrink-0 overflow-hidden d-flex align-items-center justify-content-center"
                    style={{
                      width: '72px',
                      height: '72px',
                      backgroundColor: '#f1f5f9',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-100 h-100"
                      style={{ objectFit: 'cover', mixBlendMode: 'multiply' }}
                    />
                  </div>
                  <div>
                    <h6 className="fw-bold mb-1" style={{ color: '#004282', fontSize: '1.02rem' }}>
                      {item.title}
                    </h6>
                    <p className="mb-0" style={{ color: '#1e293b', fontSize: '0.88rem', lineHeight: 1.45 }}>
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CERTIFICATIONS STRIP */}
      <section className="py-4 bg-white">
        <div className="site-container">
          <div
            className="w-100 d-flex flex-wrap align-items-center justify-content-between gap-4"
            style={{
              backgroundColor: '#f6f8fb',
              borderRadius: '10px',
              boxShadow: '0 4px 20px rgba(15, 23, 42, 0.05)',
              padding: '24px 34px'
            }}
          >
            <div>
              <div
                className="text-uppercase fw-bold mb-1"
                style={{ fontSize: '0.68rem', color: '#0054a6', letterSpacing: '0.05em' }}
              >
                CERTIFICATIONS
              </div>
              <div className="fw-bold" style={{ fontSize: '1.08rem', color: '#0f172a' }}>
                Assured Quality. Trusted Worldwide.
              </div>
            </div>

            <div className="d-flex align-items-center gap-4 flex-wrap">
              {CERTIFICATIONS.map((cert, idx) => (
                <React.Fragment key={cert.alt}>
                  {idx > 0 && (
                    <span
                      aria-hidden="true"
                      style={{ width: '1px', height: '36px', backgroundColor: '#cbd5e1' }}
                    />
                  )}
                  <img
                    src={cert.src}
                    alt={cert.alt}
                    style={{ height: `${cert.height}px`, width: 'auto', mixBlendMode: 'multiply' }}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* LEADERSHIP MESSAGE */}
      <section className="py-4 bg-white">
        <div className="site-container">
          <div className="w-100">
            <div
              className="text-uppercase fw-bold mb-3"
              style={{ fontSize: '0.85rem', color: '#004282', letterSpacing: '0.03em' }}
            >
              LEADERSHIP MESSAGE
            </div>
            <div className="row align-items-center gy-4">
              <div className="col-12 col-md-4 col-lg-3">
                <div
                  className="overflow-hidden"
                  style={{ borderRadius: '6px', backgroundColor: '#f4f6f8' }}
                >
                  <img
                    src="/images/about_md_nageswara_reddy.webp"
                    alt="S. Nageswara Reddy — Managing Director"
                    className="img-fluid w-100 d-block"
                    style={{ objectFit: 'cover', objectPosition: 'top center' }}
                  />
                </div>
              </div>

              <div className="col-12 col-md-8 col-lg-9 ps-md-4">
                <div className="d-flex align-items-start gap-2 mb-3">
                  <span
                    className="fw-bold lh-1 me-1"
                    style={{ color: '#004282', fontSize: '2.5rem', marginTop: '-4px' }}
                    aria-hidden="true"
                  >
                    &ldquo;
                  </span>
                  <p className="mb-0" style={{ color: '#1e293b', fontSize: '0.94rem', lineHeight: 1.65 }}>
                    At TAITON, our commitment has always been to combine innovation with integrity. We continuously invest in technology, people, and processes to deliver solutions that empower our partners and elevate the spaces they create. We are proud of our journey and even more excited about the future we are building together.
                  </p>
                </div>

                <div className="d-flex align-items-end justify-content-between flex-wrap gap-3 mt-4 ps-md-4">
                  <div>
                    <div className="fw-bold" style={{ color: '#004282', fontSize: '0.95rem' }}>
                      - S. NAGESWARA REDDY
                    </div>
                    <div style={{ color: '#334155', fontSize: '0.82rem' }}>
                      Managing Director, TAITON Hardware Pvt. Ltd.
                    </div>
                  </div>
                  <img
                    src="/images/about_md_signature.webp"
                    alt="S. Nageswara Reddy Signature"
                    style={{ height: '48px', width: 'auto', mixBlendMode: 'multiply' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* READY TO PARTNER WITH TAITON? CTA BANNER */}
      <section
        className="position-relative overflow-hidden text-white text-center w-100 py-5"
        style={{
          background: 'linear-gradient(135deg, #00356b 0%, #00478e 50%, #00356b 100%)'
        }}
      >
        <img
          src="/images/about_cta_left_bp.png"
          alt=""
          aria-hidden="true"
          className="position-absolute top-0 start-0 h-100 d-none d-md-block"
          style={{ objectFit: 'cover', opacity: 0.9, pointerEvents: 'none' }}
        />
        <img
          src="/images/about_cta_right_bp.png"
          alt=""
          aria-hidden="true"
          className="position-absolute top-0 end-0 h-100 d-none d-md-block"
          style={{ objectFit: 'cover', opacity: 0.9, pointerEvents: 'none' }}
        />

        <div className="site-container position-relative z-1 py-2">
          <h2 className="fw-bold text-white mb-2" style={{ fontSize: 'clamp(1.6rem, 2.5vw, 2.2rem)' }}>
            Ready to Partner with TAITON?
          </h2>
          <p className="mb-4" style={{ color: '#e2e8f0', fontSize: '0.98rem' }}>
            Let&apos;s build innovative spaces together.
          </p>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link
              to="/#contact-sec"
              className="btn bg-white fw-semibold hover-lift"
              style={{
                color: '#004282',
                borderRadius: '6px',
                minWidth: '175px',
                padding: '10px 22px',
                fontSize: '0.88rem'
              }}
            >
              Contact Sales
            </Link>
            <Link
              to="/#contact-sec"
              className="btn fw-semibold text-white hover-lift"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.78)',
                backgroundColor: 'rgba(0, 38, 82, 0.45)',
                borderRadius: '6px',
                minWidth: '175px',
                padding: '10px 22px',
                fontSize: '0.88rem'
              }}
            >
              Become a Dealer
            </Link>
            <Link
              to="/catalogues"
              className="btn fw-semibold text-white hover-lift d-inline-flex align-items-center justify-content-center gap-2"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.78)',
                backgroundColor: 'rgba(0, 38, 82, 0.45)',
                borderRadius: '6px',
                minWidth: '185px',
                padding: '10px 22px',
                fontSize: '0.88rem'
              }}
            >
              <DownloadOutlineIcon />
              <span>Download Catalogue</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CORPORATE PROFILE VIDEO MODAL */}
      {showVideoModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header bg-dark text-white p-3">
                  <h6 className="modal-title fw-bold mb-0">TAITON Corporate Profile &amp; Facilities</h6>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowVideoModal(false)}
                    aria-label="Close"
                  />
                </div>
                <div className="modal-body p-0 bg-black text-center video-modal-body">
                  <div className="py-5 px-4 text-white">
                    <div className="mb-3 d-inline-flex align-items-center justify-content-center rounded-circle border border-2 border-white p-3">
                      <PlayCircleOutlineIcon />
                    </div>
                    <h5 className="fw-bold mb-2">TAITON Corporate Showcase Video</h5>
                    <p className="text-white-50 small mx-auto mb-0" style={{ maxWidth: '540px' }}>
                      Discover how TAITON began and what drives us forward across architectural hardware, glass fittings, high-precision manufacturing, and nationwide experience centers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowVideoModal(false)} />
        </>
      )}
    </div>
  );
}
