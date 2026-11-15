import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import experienceCentersData from '../data/experienceCenters.json';

export default function ExperienceCenterPage() {
  const [activeCityId, setActiveCityId] = useState('hyderabad');
  const activeCenter = experienceCentersData.find((c) => c.id === activeCityId) || experienceCentersData[0];
  const [selectedImage, setSelectedImage] = useState(activeCenter.mainImage);

  // When city changes, update preview image
  const handleCityChange = (cityId) => {
    setActiveCityId(cityId);
    const center = experienceCentersData.find((c) => c.id === cityId);
    if (center) {
      setSelectedImage(center.mainImage);
    }
  };

  const [bookingForm, setBookingForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    time: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setBookingForm({ name: '', phone: '', email: '', date: '', time: '' });
    }, 4000);
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(window.location.href).catch(() => {});
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReset = () => {
    setBookingForm({ name: '', phone: '', email: '', date: '', time: '' });
  };

  return (
    <div className="experience-center-page bg-white">
      {/* 1. Hero Banner (Pure Image Only) */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="TAITON Experience Center"
      />

      {/* 2. Breadcrumb ALWAYS below banner */}
      <Breadcrumb items={[{ label: 'Experience Center' }]} />

      {/* 3. Our Experience Centers */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="text-center mb-4">
            <h2 className="section-main-title text-center text-uppercase" style={{ color: '#003d7a' }}>OUR EXPERIENCE CENTERS</h2>
            <div className="mx-auto mt-2" style={{ width: '96px', height: '1.5px', backgroundColor: '#475569' }}></div>
          </div>

          {/* City Tabs */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-4">
            {experienceCentersData.map((center) => (
              <button
                key={center.id}
                type="button"
                className="btn px-4 py-2 fw-semibold transition-all"
                style={
                  activeCityId === center.id
                    ? { backgroundColor: '#00458b', color: '#ffffff', border: '1px solid #00458b', borderRadius: '6px', fontSize: '0.88rem', minWidth: '126px' }
                    : { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.88rem', minWidth: '126px' }
                }
                onClick={() => handleCityChange(center.id)}
              >
                {center.name}
              </button>
            ))}
          </div>

          {/* Experience Center Card */}
          <div className="card border p-4 p-md-5 mb-5" style={{ backgroundColor: '#f3f6fb', borderColor: '#e2e8f0', borderRadius: '16px' }}>
            <div className="row g-4 align-items-center">
              {/* Left Column: Details & Contact */}
              <div className="col-12 col-lg-5">
                <h3 className="fw-bold mb-1" style={{ color: '#004282', fontSize: '1.35rem' }}>
                  TAITON Experience Center
                </h3>
                <div className="fw-bold mb-4" style={{ color: '#0f172a', fontSize: '0.96rem' }}>
                  {activeCenter.name}
                </div>

                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-shrink-0 mt-1" style={{ color: '#334155' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                      {activeCenter.phones.map((phone, i) => (
                        <div key={i}>
                          <a href={`tel:${phone.replace(/\s+/g, '')}`} className="text-decoration-none fw-medium" style={{ color: '#1e293b' }}>
                            {phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-shrink-0 mt-1" style={{ color: '#334155' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.88rem', lineHeight: '1.6' }}>
                      {activeCenter.emails.map((email, i) => (
                        <div key={i}>
                          <a href={`mailto:${email}`} className="text-decoration-none fw-medium" style={{ color: '#1e293b' }}>
                            {email}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-3">
                    <div className="flex-shrink-0" style={{ color: '#334155' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" x2="22" y1="12" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '0.88rem' }}>
                      <a href={`https://${activeCenter.website}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none fw-medium" style={{ color: '#1e293b' }}>
                        {activeCenter.website}
                      </a>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-shrink-0 mt-1" style={{ color: '#334155' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </div>
                    <div className="fw-medium lh-base" style={{ color: '#1e293b', fontSize: '0.88rem' }}>
                      {activeCenter.address}
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3">
                    <div className="flex-shrink-0 mt-1" style={{ color: '#334155' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div className="fw-medium lh-base whitespace-pre-line" style={{ color: '#1e293b', fontSize: '0.88rem' }}>
                      {activeCenter.timings}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Main Image & Vertical Thumbnails */}
              <div className="col-12 col-lg-7">
                <div className="row g-2 align-items-stretch">
                  <div className="col-9 col-sm-10">
                    <div className="rounded-3 overflow-hidden border shadow-sm h-100" style={{ minHeight: '340px' }}>
                      <img
                        src={selectedImage}
                        alt={activeCenter.title}
                        className="w-100 h-100 object-fit-cover"
                        style={{ display: 'block' }}
                      />
                    </div>
                  </div>
                  <div className="col-3 col-sm-2 d-flex flex-column gap-2 justify-content-between">
                    {activeCenter.gallery.map((imgUrl, idx) => (
                      <div
                        key={idx}
                        className={`rounded-2 overflow-hidden border cursor-pointer ${selectedImage === imgUrl ? 'border-primary shadow-sm ring-2 ring-primary' : 'opacity-75'
                          }`}
                        style={{ height: '62px' }}
                        onClick={() => setSelectedImage(imgUrl)}
                      >
                        <img
                          src={imgUrl}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-100 h-100 object-fit-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions & Social Aligned Directly Underneath Images Matching Figma */}
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 pt-3 mt-2">
                  <div className="d-flex align-items-center gap-3">
                    <a
                      href={activeCenter.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn text-white px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                      style={{ backgroundColor: '#003875', borderRadius: '6px', fontSize: '0.84rem' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <polygon points="10 8 16 12 10 16 10 8" />
                      </svg>
                      <span>watch Video</span>
                    </a>

                    <a
                      href={activeCenter.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn bg-white px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                      style={{ border: '1px solid #cbd5e1', color: '#004282', borderRadius: '6px', fontSize: '0.84rem' }}
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>View on Map</span>
                    </a>
                  </div>

                  <div
                    className="d-inline-flex align-items-center gap-2 ms-auto bg-white"
                    style={{ border: '1px solid #e2e8f0', borderRadius: '6px', padding: '5px 10px' }}
                  >
                    <span className="fw-semibold me-1" style={{ color: '#475569', fontSize: '0.8rem' }}>Share</span>
                    <a
                      href="https://www.linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on LinkedIn"
                      className="rounded-circle d-inline-flex align-items-center justify-content-center text-white text-decoration-none"
                      style={{ width: '24px', height: '24px', backgroundColor: '#0a66c2', fontSize: '0.72rem' }}
                    >
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                    <a
                      href="https://www.facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on Facebook"
                      className="rounded-circle d-inline-flex align-items-center justify-content-center text-white text-decoration-none"
                      style={{ width: '24px', height: '24px', backgroundColor: '#1877f2', fontSize: '0.72rem' }}
                    >
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a
                      href="https://x.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on X"
                      className="rounded-circle d-inline-flex align-items-center justify-content-center text-white text-decoration-none"
                      style={{ width: '24px', height: '24px', backgroundColor: '#0054a6', fontSize: '0.72rem' }}
                    >
                      <i className="fab fa-x-twitter"></i>
                    </a>
                    <a
                      href="https://wa.me/919063090009"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Share on WhatsApp"
                      className="rounded-circle d-inline-flex align-items-center justify-content-center text-white text-decoration-none"
                      style={{ width: '24px', height: '24px', backgroundColor: '#25d366', fontSize: '0.75rem' }}
                    >
                      <i className="fab fa-whatsapp"></i>
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      aria-label="Copy link"
                      title={copiedLink ? 'Link Copied!' : 'Copy link'}
                      className="btn p-0 border-0 rounded-circle d-inline-flex align-items-center justify-content-center"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: copiedLink ? '#0d9488' : '#cbd5e1',
                        color: '#ffffff',
                        fontSize: '0.7rem'
                      }}
                    >
                      <i className={copiedLink ? 'fas fa-check' : 'fas fa-link'}></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ready To Visit */}
      <section className="py-5 bg-taiton-gray border-top">
        <div className="site-container">
          <div className="text-center mb-5">
            <h2 className="section-main-title text-center text-uppercase" style={{ color: '#003d7a' }}>READY TO VISIT</h2>
            <div className="mx-auto mt-2" style={{ width: '96px', height: '1.5px', backgroundColor: '#475569' }}></div>
          </div>

          <div className="card rounded-4 border shadow-sm overflow-hidden mb-5" style={{ backgroundColor: '#f3f6fb', borderColor: '#e2e8f0', borderRadius: '16px' }}>
            <div className="row g-0 align-items-stretch">
              <div className="col-12 col-lg-5 p-3">
                <img
                  src="/images/ready_to_visit_consultation.png"
                  alt="Architectural Consultation at Taiton"
                  className="w-100 h-100 object-fit-cover"
                  style={{
                    minHeight: '380px',
                    display: 'block',
                    borderTopLeftRadius: '16px',
                    borderBottomLeftRadius: '16px',
                    borderTopRightRadius: '0px',
                    borderBottomRightRadius: '0px'
                  }}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=900&q=80';
                  }}
                />
              </div>

              <div className="col-12 col-lg-7 p-4 p-md-5 d-flex flex-column justify-content-between" style={{ backgroundColor: '#f3f6fb' }}>
                {submitted && (
                  <div className="alert alert-success alert-dismissible fade show mb-4 rounded-3" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    Thank you! Your experience center visit has been booked. Our team will contact you to confirm the schedule.
                    <button type="button" className="btn-close" onClick={() => setSubmitted(false)} aria-label="Close"></button>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark mb-1">Full Name</label>
                    <input
                      type="text"
                      className="form-control contact-input"
                      placeholder="Enter your Name *"
                      required
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      className="form-control contact-input"
                      placeholder="Enter your Mobile Number *"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark mb-1">Email Address</label>
                    <input
                      type="email"
                      className="form-control contact-input"
                      placeholder="Enter your E-Mail"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                    />
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark mb-1">Preferred Date</label>
                      <input
                        type="date"
                        className="form-control contact-input"
                        required
                        value={bookingForm.date}
                        onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-bold text-dark mb-1">Preferred Time</label>
                      <input
                        type="time"
                        className="form-control contact-input"
                        required
                        value={bookingForm.time}
                        onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-center justify-content-end gap-3 pt-2">
                    <button
                      type="button"
                      className="btn fw-semibold d-inline-flex align-items-center gap-2"
                      onClick={handleReset}
                      style={{
                        fontSize: '0.85rem',
                        border: '1px solid #94a3b8',
                        color: '#334155',
                        borderRadius: '4px',
                        padding: '8px 22px',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <i className="fas fa-undo"></i> RESET
                    </button>
                    <button
                      type="submit"
                      className="btn fw-semibold d-inline-flex align-items-center gap-2"
                      style={{
                        fontSize: '0.85rem',
                        background: 'var(--taiton-navy)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 24px'
                      }}
                    >
                      <span>Book a Visit</span> <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

