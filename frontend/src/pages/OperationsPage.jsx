import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';

const PRODUCT_JOURNEY_STEPS = [
  { step: 1, title: 'Product Selection', iconImg: '/images/journey_icon_1.png' },
  { step: 2, title: 'Incoming inspection', iconImg: '/images/journey_icon_2.png' },
  { step: 3, title: 'Quality Verification', iconImg: '/images/journey_icon_3.png' },
  { step: 4, title: 'Packing', iconImg: '/images/journey_icon_4.png' },
  { step: 5, title: 'Warehousing', iconImg: '/images/journey_icon_5.png' },
  { step: 6, title: 'Dispatch', iconImg: '/images/journey_icon_6.png' },
  { step: 7, title: 'Distribution', iconImg: '/images/journey_icon_7.png' },
  { step: 8, title: 'Project Support', iconImg: '/images/journey_icon_8.png' }
];

const OPERATIONS_CARDS = [
  {
    num: '01',
    title: 'Inventory Management',
    desc: 'Smart inventory planning ensures product availability and quick order fulfillment.',
    image: '/images/ops_card_photo_1.png'
  },
  {
    num: '02',
    title: 'Order Processing',
    desc: 'Accurate order processing with real-time tracking and updates.',
    image: '/images/ops_card_photo_2.png'
  },
  {
    num: '03',
    title: 'Quality Verification',
    desc: 'State-of-the-art testing equipment ensures highest quality standards at every stage.',
    image: '/images/ops_card_photo_3.png'
  },
  {
    num: '04',
    title: 'Online Delivery',
    desc: 'Safe and swift dispatch with real-time tracking across all locations.',
    image: '/images/ops_card_photo_4.png'
  },
  {
    num: '05',
    title: 'Best Service & Support',
    desc: 'Dedicated customer assistance and technical support for all product lines.',
    image: '/images/ops_card_photo_5.png'
  },
  {
    num: '06',
    title: 'Inventory Management',
    desc: 'Multi-tier storage controls guaranteeing precision stock availability.',
    image: '/images/ops_card_photo_6.png'
  }
];

export default function OperationsPage() {
  return (
    <div className="operations-page bg-white">
      {/* 1. Hero Banner (Image Only, No Text/Buttons) */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="TAITON Operations & Logistics"
      />

      {/* 2. Breadcrumb ALWAYS below banner */}
      <Breadcrumb items={[{ label: 'Operations & Logistics' }]} />

      {/* 3. Operations Overview */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="row g-4 align-items-center">
            {/* Left Column */}
            <div className="col-12 col-lg-5">
              <h2 className="section-main-title mb-3 text-uppercase">
                OPERATIONS OVERVIEW
              </h2>
              <p className="text-secondary small mb-4 lh-base">
                At TAITON, our operations are built on precision, transparency and performance. From product sourcing and inspection to quality verification, packaging and nationwide distribution - every step is executed with excellence to complete customer satisfaction.
              </p>

              <div className="d-flex flex-column gap-2 mb-4">
                {[
                  'Quality First Approach',
                  'Advanced Infrastructure',
                  'Efficient Inventory Management',
                  'Timely & Safe Delivery',
                  'Strong Dealer & Distribution Network'
                ].map((item, idx) => (
                  <div className="d-flex align-items-center gap-2 small text-dark fw-semibold" key={idx}>
                    <i className="fas fa-check-circle text-primary fs-6"></i>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <a
                href="/catalogues"
                className="btn text-white px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                style={{ backgroundColor: '#002b5c', borderRadius: '6px', fontSize: '0.85rem' }}
              >
                <span>Download Company Profile</span> <i className="fas fa-download"></i>
              </a>
            </div>

            {/* Right Column: Operations Overview Banner (Pure Image Only matching Figma) */}
            <div className="col-12 col-lg-7">
                <div className="rounded-4 overflow-hidden shadow-sm">
                  <img
                    src="/images/operations_overview_banner.png"
                    alt="TAITON Infrastructure and Logistics Overview"
                    className="w-100 h-auto object-fit-contain"
                    style={{ borderRadius: '16px', display: 'block' }}
                  />
                </div>
              </div>
            </div>
          </div>
      </section>

      {/* 4. Product Journey */}
      <section className="py-5 bg-white border-top">
        <div className="site-container">
          <div className="text-center mb-4">
            <h2 className="section-main-title text-center text-uppercase" style={{ color: '#003d7a' }}>PRODUCT JOURNEY</h2>
            <div className="mx-auto mt-2" style={{ width: '96px', height: '1.5px', backgroundColor: '#475569' }}></div>
          </div>

          <div className="d-flex flex-nowrap overflow-x-auto py-4 px-2 align-items-center justify-content-lg-center gap-1">
            {PRODUCT_JOURNEY_STEPS.map((item, idx) => (
              <React.Fragment key={item.step}>
                <div
                  className="bg-white flex-shrink-0 d-flex flex-column align-items-center justify-content-start text-center"
                  style={{
                    width: '108px',
                    height: '136px',
                    padding: '14px 8px 12px',
                    borderRadius: '10px',
                    border: 'none',
                    boxShadow: '0 6px 20px rgba(15, 23, 42, 0.09)'
                  }}
                >
                  <img
                    src={item.iconImg}
                    alt={item.title}
                    style={{ width: '54px', height: '50px', objectFit: 'contain', marginBottom: '6px' }}
                  />
                  <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.78rem', lineHeight: '1.2', marginBottom: '2px' }}>
                    {item.step}
                  </div>
                  <div className="fw-medium" style={{ color: '#1e293b', fontSize: '0.74rem', lineHeight: '1.2' }}>
                    {item.title}
                  </div>
                </div>

                {idx < PRODUCT_JOURNEY_STEPS.length - 1 && (
                  <div className="px-1 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ color: '#1e293b' }}>
                    <svg width="20" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="12" x2="21" y2="12"></line>
                      <polyline points="15 6 21 12 15 18"></polyline>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Our Operations: 6 in single row on desktop, scrollable on responsive */}
      <section className="py-5 bg-white border-top">
        <div className="site-container">
          <div className="text-center mb-5">
            <h2 className="section-main-title text-center text-uppercase" style={{ color: '#003d7a' }}>OUR OPERATIONS</h2>
            <div className="mx-auto mt-2" style={{ width: '96px', height: '1.5px', backgroundColor: '#475569' }}></div>
          </div>

          <div className="d-flex flex-nowrap overflow-x-auto gap-3 pb-3">
            {OPERATIONS_CARDS.map((card, idx) => (
              <div
                className="flex-shrink-0"
                style={{ flex: '1 1 0', minWidth: '175px' }}
                key={idx}
              >
                <div className="card rounded-3 border shadow-sm overflow-hidden h-100 bg-white" style={{ borderRadius: '12px', borderColor: '#e2e8f0' }}>
                  <div style={{ height: '115px' }} className="overflow-hidden bg-light">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-100 h-100 object-fit-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="fw-bold text-primary small mb-1" style={{ fontSize: '0.8rem' }}>{card.num}</div>
                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.82rem', lineHeight: '1.25' }}>{card.title}</h6>
                    <p className="text-muted small mb-0 lh-sm" style={{ fontSize: '0.72rem', lineHeight: '1.3' }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Our Fleet & Coverage - Pure Complete Banner Only */}
      <section className="py-5 bg-white border-top">
        <div className="site-container">
          <div className="overflow-hidden" style={{ borderRadius: '16px', boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)' }}>
            <img
              src="/images/our_fleet_banner_complete.png"
              alt="Our Fleet & Coverage - Pan India Distribution"
              className="w-100 h-auto d-block"
            />
          </div>
        </div>
      </section>

                                {/* 7. Gallery & Videos */}
                                <section className="py-5 bg-white border-top">
                                  <div className="site-container">
                                    <div className="text-center mb-5">
                                      <h2 className="section-main-title text-center text-uppercase">GALLERY &amp; VIDEOS</h2>
                                      <div className="title-underline-center"></div>
                                    </div>

                                    <div className="row g-3">
                                      <div className="col-12 col-md-6 col-lg-4">
                                        <div className="rounded-3 overflow-hidden border shadow-sm h-100" style={{ minHeight: '260px' }}>
                                          <img
                                            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                                            alt="Warehouse Facility"
                                            className="w-100 h-100 object-fit-cover hover-scale"
                                          />
                                        </div>
                                      </div>
                                      <div className="col-12 col-md-6 col-lg-4">
                                        <div className="rounded-3 overflow-hidden border shadow-sm h-100" style={{ minHeight: '260px' }}>
                                          <img
                                            src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80"
                                            alt="Automated Storage"
                                            className="w-100 h-100 object-fit-cover hover-scale"
                                          />
                                        </div>
                                      </div>
                                      <div className="col-12 col-lg-4">
                                        <div className="row g-3 h-100">
                                          <div className="col-6">
                                            <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '124px' }}>
                                              <img
                                                src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=400&q=80"
                                                alt="Operations Inspection"
                                                className="w-100 h-100 object-fit-cover hover-scale"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-6">
                                            <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '124px' }}>
                                              <img
                                                src="https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=400&q=80"
                                                alt="Packaging Process"
                                                className="w-100 h-100 object-fit-cover hover-scale"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-6">
                                            <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '124px' }}>
                                              <img
                                                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=400&q=80"
                                                alt="Logistics Team"
                                                className="w-100 h-100 object-fit-cover hover-scale"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-6">
                                            <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '124px' }}>
                                              <img
                                                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=400&q=80"
                                                alt="Fleet Transit"
                                                className="w-100 h-100 object-fit-cover hover-scale"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </section>

                                  {/* 8. Ready to Work With Taiton? CTA Banner using About CTA Blueprint Background */}
                                  <section
                                    className="py-5 text-white position-relative overflow-hidden"
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
                                    <div className="site-container position-relative z-2 text-center py-4">
                                        <h2 className="display-6 fw-bold text-white mb-2 text-uppercase" style={{ fontSize: '1.9rem', letterSpacing: '0.5px' }}>
                                          READY TO WORK WITH TAITON?
                                        </h2>
                                          <p className="text-white-50 fs-6 mb-4" style={{ fontSize: '0.95rem' }}>
                                            Join our growing network of dealers, architects, builders and business partners.
                                          </p>

                                          <div className="d-flex flex-wrap justify-content-center gap-3">
                                            <Link
                                              to="/contact"
                                              className="btn fw-bold px-4 py-2 d-inline-flex align-items-center gap-2"
                                              style={{ backgroundColor: '#e0a638', borderColor: '#e0a638', color: '#000', borderRadius: '4px', fontSize: '0.85rem' }}
                                            >
                                              <span>BECOME A DEALER</span> <i className="fas fa-arrow-right"></i>
                                            </Link>

                                            <Link
                                              to="/contact"
                                              className="btn btn-outline-light fw-semibold px-4 py-2 d-inline-flex align-items-center gap-2"
                                              style={{ borderRadius: '4px', fontSize: '0.85rem', borderColor: '#ffffff' }}
                                            >
                                              <span>CONTACT SALES</span> <i className="fas fa-arrow-right"></i>
                                            </Link>

                                            <Link
                                              to="/contact"
                                              className="btn btn-outline-light fw-semibold px-4 py-2 d-inline-flex align-items-center gap-2"
                                              style={{ borderRadius: '4px', fontSize: '0.85rem', borderColor: '#ffffff' }}
                                            >
                                              <span>REQUEST A QUOTE</span> <i className="fas fa-arrow-right"></i>
                                            </Link>
                                          </div>
                                        </div>
                                      </section>
                                    </div>
                                    );
}
