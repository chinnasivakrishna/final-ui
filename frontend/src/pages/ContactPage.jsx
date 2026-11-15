import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';

const BRANCH_LOCATIONS = [
  {
    city: 'Hyderabad',
    address: '#8-3-677/21, Sri Krishna\nDevaraya Nagar, Yellareddyguda,\nHyderabad - 500073',
    tel: '+91-90630 90009',
    email: 'customercare@taiton.in'
  },
  {
    city: 'New Delhi',
    address: 'A-55, FIEE Complex\n1st Floor Okhla Industrial Estate\nPhase - II , New Delhi- 110020',
    tel: '+91-11 - 45040117',
    email: 'taitondelhi@taiton.in'
  },
  {
    city: 'Visakhapatnam',
    address: 'D.No. 49-55-19, Vidyuth Nagar,\nNear Port Stadium,\nVisakhapatnam-530016',
    tel: '08913535288',
    email: 'vizag@taiton.in'
  },
  {
    city: 'Kerala (Cochin)',
    address: 'Door No. 42/2200 C to C5\nArakkakkadavu Road\nVennala P.O, Ernakulam - 682028',
    tel: '+91-99461 04308\n+91-99461 04309',
    email: 'vm@taiton.in'
  },
  {
    city: 'Kerala (Trivandrum)',
    address: 'TC 84/2248 (1), Ground floor\nNH Bypass, Enchakkal\nThiruvananthapuram – 695008',
    tel: '0471 2476315, 81291 24452',
    email: 'tvm@taiton.in'
  },
  {
    city: 'Tamilnadu (Coimbatore)',
    address: 'First Floor 13/1B, Brook Bond Layout\nKrishnasamy Muthaliar Road\nTamil nadu -641002',
    tel: '0484-3522156, 9946014308',
    email: 'cbe@taiton.in'
  },
  {
    city: 'Vijayawada',
    address: 'D.No.76-8-5/15A,\nHanumaih Street, Bhavani Puram\nVijayawada - 520012',
    tel: '+91-95535 27711',
    email: 'vja@taiton.in'
  },
  {
    city: 'Bangalore',
    address: 'Ground Floor, No.93,\nJC Road Cross,\nNear SJP Police Station,\nBangalore-560002',
    tel: '+91-88860 61146',
    email: 'blr@taiton.in'
  }
];

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

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [selectedInterests, setSelectedInterests] = useState(['GLASS HARDWARE']);
  const [submitted, setSubmitted] = useState(false);

  const toggleInterest = (pill) => {
    setSelectedInterests((prev) =>
      prev.includes(pill) ? prev.filter((p) => p !== pill) : [...prev, pill]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setSelectedInterests(['GLASS HARDWARE']);
    setSubmitted(false);
  };

  return (
    <div className="contact-page bg-white">
      <Breadcrumb items={[{ label: 'Contact us' }]} />

      <section className="py-4" style={{ backgroundColor: '#edf2f7' }}>
        <div className="site-container">
          <div className="row g-0 align-items-stretch contact-attached-row mb-4">
            
            <div className="col-12 col-lg-5">
              <div className="contact-left-card overflow-hidden border shadow-sm h-100 bg-white position-relative">
                <img
                  src="/images/contact_us_left.jpg"
                  alt="Contact Taiton - Let's Build Something Exceptional"
                  className="w-100 h-100"
                  style={{ objectFit: 'cover', display: 'block', minHeight: '560px' }}
                />
              </div>
            </div>

            <div className="col-12 col-lg-7">
              <div className="contact-form-card border shadow-sm p-4 p-md-5 h-100 bg-white d-flex flex-column justify-content-between">
                
                {submitted && (
                  <div className="alert alert-success alert-dismissible fade show mb-4 rounded-3" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    Thank you! Your enquiry has been received. Our architectural consulting team will connect with you shortly.
                    <button type="button" className="btn-close" onClick={() => setSubmitted(false)} aria-label="Close"></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  
                  <h5 className="fw-bold text-dark text-uppercase mb-3" style={{ fontSize: '0.98rem', letterSpacing: '0.5px' }}>
                    YOUR DETAILS
                  </h5>

                  <div className="mb-3">
                    <input
                      type="text"
                      className="form-control form-control-lg contact-input"
                      placeholder="Your Name *"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control form-control-lg contact-input"
                      placeholder="Email Address *"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <input
                      type="tel"
                      className="form-control form-control-lg contact-input"
                      placeholder="Phone Number *"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="mb-4">
                    <textarea
                      rows={4}
                      className="form-control contact-input"
                      placeholder="Your Message / Requirements"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
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
                            className={`contact-interest-box w-100 text-start py-2 px-3 rounded-2 border d-flex align-items-center justify-content-start text-truncate ${
                              isSelected ? 'active bg-light border-primary text-primary fw-bold' : 'bg-white text-secondary'
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

          <div className="border rounded-4 p-4 p-md-5 mb-5 bg-white shadow-sm">
            <div className="row g-4">
              {BRANCH_LOCATIONS.map((b, idx) => (
                <div
                  key={idx}
                  className={`col-12 col-sm-6 col-lg-3 ${
                    (idx + 1) % 4 !== 0 ? 'border-lg-end' : ''
                  } ${idx < 4 ? 'border-lg-bottom pb-4' : 'pt-lg-2'}`}
                  style={{ borderColor: '#e2e8f0' }}
                >
                  <h5 className="fw-bold mb-2 text-taiton-navy" style={{ fontSize: '1.05rem', color: '#003875' }}>
                    {b.city}
                  </h5>
                  <div className="text-secondary small mb-2 lh-base" style={{ whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
                    {b.address}
                  </div>
                  <div className="small mb-1 text-dark" style={{ fontSize: '0.85rem' }}>
                    <span className="text-muted">Tel:</span> <span className="fw-semibold">{b.tel}</span>
                  </div>
                  {b.email && (
                    <div className="small text-dark" style={{ fontSize: '0.85rem' }}>
                      <span className="text-muted">E-mail:</span>{' '}
                      <a href={`mailto:${b.email}`} className="text-decoration-none text-dark hover-blue fw-semibold">
                        {b.email}
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-4 p-4 p-md-5 my-5 bg-white shadow-sm">
            <div className="row align-items-center gy-4">
              
              <div className="col-12 col-lg-6">
                <h2 className="display-6 fw-bold text-dark mb-3 lh-sm">
                  With you,<br />
                  <span style={{ textDecoration: 'underline' }}>Wherever you go!</span>
                </h2>
                <p className="text-secondary fs-6 mb-4 lh-base" style={{ maxWidth: '440px' }}>
                  Download our app on your smartphone to get latest product information and installation guidance.
                </p>
                
                <div className="d-flex flex-wrap align-items-center gap-3">
                  <a
                    href="#playstore"
                    className="app-download-btn d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white text-decoration-none"
                    style={{ background: '#000000' }}
                    aria-label="Get it on Google Play"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3 20.5v-17c0-.55.45-1 1-1h.22l10.26 8.5-10.26 8.5H4c-.55 0-1-.45-1-1zm12.5-8.5L20.25 9c.68-.4 1.25.04 1.25.75v4.5c0 .71-.57 1.15-1.25.75L15.5 12z" />
                    </svg>
                    <div className="text-start">
                      <div className="app-btn-sub small text-white-50" style={{ fontSize: '0.65rem' }}>GET IT ON</div>
                      <div className="app-btn-title fw-bold" style={{ fontSize: '0.9rem' }}>Google Play</div>
                    </div>
                  </a>

                  <a
                    href="#appstore"
                    className="app-download-btn d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 text-white text-decoration-none"
                    style={{ background: '#000000' }}
                    aria-label="Download on the App Store"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.81 1.44-.61.71-1.15 1.85-.99 2.95 1.07.08 2.15-.55 2.81-1.35z" />
                    </svg>
                    <div className="text-start">
                      <div className="app-btn-sub small text-white-50" style={{ fontSize: '0.65rem' }}>Download on the</div>
                      <div className="app-btn-title fw-bold" style={{ fontSize: '0.9rem' }}>App Store</div>
                    </div>
                  </a>
                </div>

                <div className="text-danger fw-semibold mt-4" style={{ fontSize: '1.15rem' }}>
                  Any Ideas on this section
                </div>
              </div>

              <div className="col-12 col-lg-6 text-center">
                <div className="d-flex align-items-center justify-content-center position-relative py-3" style={{ minHeight: '340px' }}>
                  
                  <div
                    className="phone-mockup-frame shadow-lg bg-dark text-white rounded-4 overflow-hidden border border-3 border-dark position-relative"
                    style={{
                      width: '180px',
                      height: '340px',
                      transform: 'rotate(-4deg)',
                      zIndex: 1,
                      marginRight: '-40px'
                    }}
                  >
                    <div
                      className="w-100 h-100 d-flex flex-column align-items-center justify-content-center p-3 text-center"
                      style={{ background: 'linear-gradient(180deg, #001f4d 0%, #003875 100%)' }}
                    >
                      <img
                        src="/Taiton/Taiton Logo without Tagline - White.png"
                        alt="Taiton App"
                        className="img-fluid mb-3"
                        style={{ maxWidth: '110px' }}
                      />
                      <div className="small fw-semibold text-white-50" style={{ fontSize: '0.65rem' }}>
                        Architectural Hardware
                      </div>
                    </div>
                  </div>

                  <div
                    className="phone-mockup-frame shadow-2xl bg-white text-dark rounded-4 overflow-hidden border border-3 border-dark position-relative"
                    style={{
                      width: '190px',
                      height: '360px',
                      zIndex: 2
                    }}
                  >
                    <div className="bg-light px-3 py-1 d-flex justify-content-between align-items-center small border-bottom" style={{ fontSize: '0.55rem' }}>
                      <span className="fw-bold">9:41</span>
                      <div className="d-flex gap-1 text-muted">
                        <i className="fas fa-signal"></i>
                        <i className="fas fa-wifi"></i>
                        <i className="fas fa-battery-full"></i>
                      </div>
                    </div>
                    <div className="p-2 text-start">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="fw-black text-taiton-navy" style={{ fontSize: '0.75rem' }}>TAITON</span>
                        <i className="fas fa-search text-muted" style={{ fontSize: '0.65rem' }}></i>
                      </div>
                      <div className="rounded-2 overflow-hidden mb-2 position-relative" style={{ height: '90px', background: '#003875' }}>
                        <img
                          src="/images/products page view 1.png"
                          alt="Showcase"
                          className="w-100 h-100"
                          style={{ objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.src = '/Taiton/banners/1.webp'; }}
                        />
                        <div className="position-absolute bottom-0 start-0 p-1 text-white fw-bold" style={{ fontSize: '0.6rem', background: 'rgba(0,0,0,0.5)', width: '100%' }}>
                          Enhancing Spaces
                        </div>
                      </div>
                      <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.65rem' }}>Explore Our Range</div>
                      <div className="row g-1">
                        <div className="col-6">
                          <div className="border rounded p-1 text-center bg-light" style={{ fontSize: '0.55rem' }}>
                            Glass Hardware
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="border rounded p-1 text-center bg-light" style={{ fontSize: '0.55rem' }}>
                            Sliding Systems
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
