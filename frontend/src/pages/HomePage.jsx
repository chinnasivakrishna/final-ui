import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import PillarsBanner from '../components/PillarsBanner';
import { fetchPublishedPageConfig } from '../api/uiLayoutApi';
import SolutionsSection from '../components/SolutionsSection';
import DynamicFeaturedProducts from '../components/dynamic/DynamicFeaturedProducts';
import LandmarkProjectsSection from '../components/LandmarkProjectsSection';
import WhyTaitonSection from '../components/WhyTaitonSection';
import DynamicClientTestimonials from '../components/dynamic/DynamicClientTestimonials';
import RecentlyViewed from '../components/RecentlyViewed';

const PRODUCT_INTERESTS = [
  'GLASS HARDWARE',
  'SLIDING FOLDING SYSTEMS',
  'AUTOMATIC SENSOR DOORS',
  'HOTEL RFID & DIGITAL LOCKS',
  'DOOR CONTROL HARDWARE',
  'Modern Wardrobes',
  'Office Partitions',
  'Luxury Shower Cubicles',
  'SLIDING SYSTEMS Telescopic',
  'Synchro sliding systems',
  'RAILINGS',
  '5D EMBOSSED GLASS'
];

export default function HomePage() {
  const [publishedLayouts, setPublishedLayouts] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const layouts = await fetchPublishedPageConfig('home', 'taiton');
        if (mounted && layouts) {
          setPublishedLayouts(layouts);
        }
      } catch (err) {
        console.warn('Failed to fetch home page layouts:', err);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  const [selectedInterests, setSelectedInterests] = useState(['GLASS HARDWARE']);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const toggleInterest = (pill) => {
    setSelectedInterests((prev) =>
      prev.includes(pill) ? prev.filter((p) => p !== pill) : [...prev, pill]
    );
  };

  const handleReset = () => {
    setContactForm({ name: '', email: '', phone: '', message: '' });
    setSelectedInterests(['GLASS HARDWARE']);
    setFormSubmitted(false);
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', phone: '', message: '' });
      setSelectedInterests(['GLASS HARDWARE']);
    }, 4000);
  };

  const publishedHero = publishedLayouts?.heroic?.configuration;
  const activeHeroData = publishedHero
    ? {
      layoutId: publishedLayouts?.heroic?.layoutId || 'large-premium-banner',
      data: publishedHero.data || publishedHero,
    }
    : null;

  return (
    <div className="home-page">
      <div className="position-relative">
        <HeroSection heroData={activeHeroData}>
          <div className="static_ribbon">
            <PillarsBanner />
          </div>
        </HeroSection>
      </div>

      <SolutionsSection />

      <DynamicFeaturedProducts config={publishedLayouts?.['featured-products']?.configuration} />

      <LandmarkProjectsSection config={publishedLayouts?.['landmark-projects']?.configuration} />

      <WhyTaitonSection />

      <DynamicClientTestimonials config={publishedLayouts?.['client-testimonials']?.configuration} />

      <RecentlyViewed />

      <div className="contact_us">
        <section id="contact-sec" className="w-100 py-5 contact-section-wrap bg-white">
          <div className="site-container">
            <div className="row g-0 align-items-stretch contact-attached-row">
              {/* Left Column: Support Assistant Image (Desktop Only, hidden in mobile view) */}
              <div className="col-12 col-lg-5 d-none d-lg-block">
                <div className="contact-left-card overflow-hidden border shadow-sm h-100 bg-white position-relative d-flex align-items-center justify-content-center p-3">
                  <img
                    src="/images/contact_support_assistant.png"
                    alt="TAITON Customer Support - How can I help you? Please share your requirements."
                    className="w-100 h-100"
                    style={{ objectFit: 'contain', maxHeight: '580px', display: 'block' }}
                  />
                </div>
              </div>

              {/* Right Column: Contact Form */}
              <div className="col-12 col-lg-7">
                <div className="contact-form-card border shadow-sm p-4 p-md-5 h-100 bg-white d-flex flex-column justify-content-between">
                  {formSubmitted && (
                    <div className="alert alert-success alert-dismissible fade show mb-4 rounded-3" role="alert">
                      <i className="fas fa-check-circle me-2"></i>
                      Thank you! Your enquiry has been received. Our architectural consulting team will connect with you shortly.
                      <button type="button" className="btn-close" onClick={() => setFormSubmitted(false)} aria-label="Close"></button>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit}>
                    <h5 className="fw-bold text-dark text-uppercase mb-2" style={{ fontSize: '1.05rem', letterSpacing: '0.5px' }}>
                      CONTACT US
                    </h5>

                    <div className="mb-2">
                      <input
                        type="text"
                        className="form-control contact-input"
                        placeholder="Your Name *"
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      />
                    </div>

                    <div className="mb-2">
                      <input
                        type="email"
                        className="form-control contact-input"
                        placeholder="Email Address *"
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      />
                    </div>

                    <div className="mb-2">
                      <input
                        type="tel"
                        className="form-control contact-input"
                        placeholder="Phone Number *"
                        required
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                      />
                    </div>

                    <div className="mb-3">
                      <textarea
                        rows={3}
                        className="form-control contact-input"
                        placeholder="Your Message / Requirements"
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      ></textarea>
                    </div>

                    <h5 className="fw-bold text-dark text-uppercase mb-3" style={{ fontSize: '0.98rem', letterSpacing: '0.5px' }}>
                      PRODUCT INTERESTED IN
                    </h5>

                    <div className="row g-2 mb-4">
                      {PRODUCT_INTERESTS.map((item, idx) => {
                        const isSelected = selectedInterests.includes(item);
                        return (
                          <div className="col-12 col-sm-6 col-md-4" key={idx}>
                            <button
                              type="button"
                              className={`contact-interest-box w-100 text-start py-2 px-3 rounded-2 border d-flex align-items-center justify-content-start text-truncate ${isSelected ? 'active bg-light border-primary text-primary fw-bold' : 'bg-white text-secondary'
                                }`}
                              onClick={() => toggleInterest(item)}
                              title={item}
                              style={{ fontSize: '0.78rem', transition: 'all 0.15s ease' }}
                            >
                              <span className="me-2 fw-bold text-muted" style={{ fontSize: '0.9rem' }}>
                                {isSelected ? '✓' : '+'}
                              </span>
                              <span className="text-truncate">{item}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="d-flex align-items-center justify-content-end gap-3 pt-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                        onClick={handleReset}
                        style={{ fontSize: '0.85rem' }}
                      >
                        <i className="fas fa-undo"></i> RESET
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 btn-taiton-pill"
                        style={{ fontSize: '0.85rem' }}
                      >
                        <span>SEND ENQUIRY</span> <i className="fas fa-arrow-right"></i>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
