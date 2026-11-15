import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import eventsData from '../data/eventsData.json';

const UPCOMING_EVENTS = [
  {
    id: 'up-1',
    title: 'Zak Doors & Windows Expo 2026',
    date: 'Dec 03 – Dec 06, 2026',
    location: 'Pragati Maidan, New Delhi',
    booth: 'Hall 3, Booth D-14',
    category: 'Trade Expo',
    image: '/images/events/event_zak_2026.webp',
    fallbackImg: '/images/events/event_thumb_1.jpg',
    description: 'Explore TAITON’s newest range of architectural glass fittings, automatic doors, and heavy-duty sliding systems.'
  },
  {
    id: 'up-2',
    title: 'ACETECH Mumbai 2026',
    date: 'Nov 12 – Nov 15, 2026',
    location: 'Bombay Exhibition Centre, Mumbai',
    booth: 'Hall 1, Stall B-22',
    category: 'Architecture Expo',
    image: '/images/events/event_acetech_2026.webp',
    fallbackImg: '/images/events/event_thumb_2.jpg',
    description: 'Premier exhibition on architecture, construction engineering and decorative hardware solutions.'
  },
  {
    id: 'up-3',
    title: 'FOAID Architecture & Design Fest 2026',
    date: 'Oct 20 – Oct 21, 2026',
    location: 'NSIC Grounds, New Delhi',
    booth: 'Design Pavilion 4',
    category: 'Design Festival',
    image: '/images/events/event_foaid_2026.webp',
    fallbackImg: '/images/events/event_thumb_3.jpg',
    description: 'A celebration of innovative architecture, high-performance glass facades, and modern hardware aesthetics.'
  }
];

export default function EventsPage() {
  const { years, categories, events } = eventsData;
  const [selectedYear, setSelectedYear] = useState('2026');
  const [selectedCategory, setSelectedCategory] = useState('All Events');
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || '');

  const filteredEvents = events.filter((ev) => {
    const matchYear = selectedYear === 'All' || ev.year === selectedYear;
    const matchCat = selectedCategory === 'All Events' || ev.category === selectedCategory;
    return matchYear && matchCat;
  });

  const activeEvent = events.find((ev) => ev.id === selectedEventId) || events[0];

  return (
    <div className="events-page bg-white">
      {/* 1. Hero Banner (Image Only, No Text/Buttons) */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="TAITON Exhibitions & Events"
      />

      {/* 2. Breadcrumb ALWAYS below banner */}
      <Breadcrumb items={[{ label: 'Exhibitions & Events' }]} />

      {/* 3. Events & Exhibitions List */}
      <section id="events-list" className="pt-3 pb-5 bg-white">
        <div className="site-container">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h4 className="fw-bold mb-1" style={{ color: '#003875', fontSize: '1.25rem' }}>
                Events &amp; Exhibitions
              </h4>
              <div style={{ width: '42px', height: '3px', backgroundColor: '#0054a6' }}></div>
            </div>

            {/* Filter Dropdowns - Exact Match to Design & Upcoming Events Button */}
            <div className="d-flex flex-wrap align-items-center gap-3">
              {/* Card 1: Select Year */}
              <div
                className="d-flex align-items-center border rounded-3 px-3 py-2 bg-white shadow-xs position-relative cursor-pointer hover-lift"
                style={{
                  minHeight: '52px',
                  borderColor: '#cbd5e1',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  minWidth: '170px',
                }}
              >
                <div className="d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '26px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </div>
                <div className="d-flex flex-column text-start flex-grow-1 pe-2">
                  <span style={{ fontSize: '0.72rem', color: '#0054a6', fontWeight: 600, lineHeight: 1.15 }}>
                    Select Year
                  </span>
                  <span className="fw-bold text-dark" style={{ fontSize: '1.05rem', lineHeight: 1.2 }}>
                    {selectedYear === 'All' ? 'All Years' : selectedYear}
                  </span>
                </div>
                <i className="fas fa-chevron-down text-dark ms-auto" style={{ fontSize: '0.8rem' }}></i>

                {/* Invisible select covering full card */}
                <select
                  className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                  style={{ cursor: 'pointer', zIndex: 3 }}
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  aria-label="Select Year"
                >
                  <option value="All">All Years</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              {/* Card 2: Event Category */}
              <div
                className="d-flex align-items-center border rounded-3 px-3 py-2 bg-white shadow-xs position-relative cursor-pointer hover-lift"
                style={{
                  minHeight: '52px',
                  borderColor: '#cbd5e1',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  minWidth: '190px',
                }}
              >
                <div className="d-flex align-items-center justify-content-center me-2 flex-shrink-0" style={{ width: '26px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0054a6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
                    <rect x="14" y="14" width="7" height="7" rx="1.5"></rect>
                    <rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
                  </svg>
                </div>
                <div className="d-flex flex-column text-start flex-grow-1 pe-2">
                  <span style={{ fontSize: '0.72rem', color: '#0054a6', fontWeight: 600, lineHeight: 1.15 }}>
                    Event Category
                  </span>
                  <span className="fw-bold text-dark text-truncate" style={{ fontSize: '1.05rem', lineHeight: 1.2, maxWidth: '140px' }}>
                    {selectedCategory}
                  </span>
                </div>
                <i className="fas fa-chevron-down text-dark ms-auto" style={{ fontSize: '0.8rem' }}></i>

                {/* Invisible select covering full card */}
                <select
                  className="position-absolute top-0 start-0 w-100 h-100 opacity-0 cursor-pointer"
                  style={{ cursor: 'pointer', zIndex: 3 }}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label="Event Category"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Action Button: Upcoming Events */}
              <button
                type="button"
                className="btn btn-primary d-inline-flex align-items-center gap-2 fw-semibold shadow-sm text-nowrap"
                style={{
                  backgroundColor: '#0054a6',
                  borderColor: '#0054a6',
                  borderRadius: '12px',
                  padding: '10px 22px',
                  fontSize: '0.92rem',
                  minHeight: '52px',
                  boxShadow: '0 2px 8px rgba(0, 84, 166, 0.25)',
                }}
                onClick={() => {
                  const el = document.getElementById('upcoming-events-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <i className="far fa-calendar-alt fs-6"></i>
                <span>Upcoming Events</span>
                <i className="fas fa-arrow-right fs-8 ms-1"></i>
              </button>
            </div>
          </div>

          <div className="row g-4 mb-5">
            {filteredEvents.map((ev) => (
              <div className="col-12 col-md-4" key={ev.id}>
                <div
                  className={`card rounded-3 border overflow-hidden h-100 hover-lift cursor-pointer ${
                    selectedEventId === ev.id ? 'border-dark shadow' : 'shadow-sm'
                  }`}
                  onClick={() => setSelectedEventId(ev.id)}
                >
                  <div className="position-relative" style={{ height: '160px' }}>
                    <img src={ev.image} alt={ev.title} className="w-100 h-100 object-fit-cover" />
                    {selectedEventId === ev.id && (
                      <span className="position-absolute top-0 start-0 m-2 badge bg-dark small fw-semibold">
                        Selected
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.88rem' }}>{ev.title}</h6>
                    <div className="d-flex align-items-center justify-content-between text-muted small mb-2" style={{ fontSize: '0.74rem' }}>
                      <span><i className="fas fa-map-marker-alt me-1 text-muted"></i> {ev.location}</span>
                      <span><i className="far fa-calendar-alt me-1 text-muted"></i> {ev.year}</span>
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                      <span className="badge bg-light text-secondary border small">{ev.category}</span>
                      <span className="small text-dark fw-semibold">
                        View Event <i className="fas fa-arrow-right ms-1"></i>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4. Featured Event Details */}
          {activeEvent && (
            <div className="card rounded-4 border shadow-sm p-4 p-md-5 bg-white mb-5">
              <div className="row g-4">
                {/* Left Description */}
                <div className="col-12 col-lg-5">
                  <h3 className="fw-bold mb-3 text-uppercase" style={{ fontSize: '1.5rem', color: '#003875' }}>
                    {activeEvent.title}
                  </h3>

                  <div className="d-flex flex-column gap-2 mb-3 small">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <span className="text-muted fw-semibold">Category : </span>
                        <span className="fw-bold text-dark">{activeEvent.category}</span>
                      </div>
                      <span className="text-muted fw-bold">{activeEvent.year}</span>
                    </div>
                    <div>
                      <span className="text-muted fw-semibold">Location : </span>
                      <span className="fw-bold text-dark">{activeEvent.city}</span>
                    </div>
                  </div>

                  <p className="text-secondary small mb-4 lh-base" style={{ fontSize: '0.88rem' }}>
                    {activeEvent.description}
                  </p>

                  <Link
                    to="/contact-us"
                    className="btn w-100 py-2 fw-semibold text-center text-decoration-none"
                    style={{ fontSize: '0.9rem', color: '#003875', borderRadius: '8px', border: '1.5px solid #003875', backgroundColor: '#ffffff' }}
                  >
                    Contact Event Team
                  </Link>
                </div>

                {/* Right Collage */}
                <div className="col-12 col-lg-7">
                  <div className="row g-2">
                    <div className="col-6">
                      <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '170px' }}>
                        <img src={activeEvent.collage[0]} alt="Event highlight 1" className="w-100 h-100 object-fit-cover hover-scale" />
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '170px' }}>
                        <img src={activeEvent.collage[1]} alt="Event highlight 2" className="w-100 h-100 object-fit-cover hover-scale" />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '110px' }}>
                        <img src={activeEvent.collage[2]} alt="Event highlight 3" className="w-100 h-100 object-fit-cover hover-scale" />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '110px' }}>
                        <img src={activeEvent.collage[3]} alt="Event highlight 4" className="w-100 h-100 object-fit-cover hover-scale" />
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="rounded-3 overflow-hidden border shadow-sm" style={{ height: '110px' }}>
                        <img src={activeEvent.collage[4]} alt="Event highlight 5" className="w-100 h-100 object-fit-cover hover-scale" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. Upcoming Events Section */}
          <div className="mt-5 pt-3" id="upcoming-events-section">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h4 className="fw-bold mb-1" style={{ color: '#003875', fontSize: '1.25rem' }}>
                  Upcoming Events &amp; Expos
                </h4>
                <div style={{ width: '42px', height: '3px', backgroundColor: '#0054a6' }}></div>
              </div>
              <span className="badge bg-light text-dark border px-3 py-2 fw-semibold">
                Mark Your Calendar
              </span>
            </div>

            <div className="row g-4">
              {UPCOMING_EVENTS.map((up) => (
                <div className="col-12 col-md-4" key={up.id}>
                  <div className="card rounded-3 border shadow-sm overflow-hidden h-100 hover-lift bg-white">
                    <div className="p-4 d-flex flex-column h-100">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-light text-dark border small fw-semibold">
                          {up.category}
                        </span>
                        <span className="text-muted small fw-medium">
                          <i className="far fa-calendar-alt me-1"></i> {up.date.split('–')[0].trim()}
                        </span>
                      </div>

                      <h5 className="fw-bold text-dark mb-2" style={{ fontSize: '1.02rem' }}>
                        {up.title}
                      </h5>

                      <div className="small text-muted mb-2">
                        <div className="mb-1">
                          <i className="fas fa-map-marker-alt me-1 text-muted"></i> {up.location}
                        </div>
                        <div>
                          <i className="far fa-building me-1 text-muted"></i> {up.booth}
                        </div>
                      </div>

                      <p className="text-secondary small mb-3 flex-grow-1" style={{ fontSize: '0.82rem', lineHeight: '1.5' }}>
                        {up.description}
                      </p>

                      <div className="pt-2 border-top mt-auto d-flex justify-content-between align-items-center">
                        <span className="small text-muted">{up.date}</span>
                        <Link
                          to="/contact-us"
                          className="btn btn-sm btn-outline-dark rounded-pill px-3 py-1 fw-semibold"
                          style={{ fontSize: '0.78rem' }}
                        >
                          Book a Meeting
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Related Past Events */}
          <div className="mt-5 pt-4">
            <div className="mb-4">
              <h4 className="fw-bold mb-1" style={{ color: '#003875', fontSize: '1.25rem' }}>
                All Exhibitions Archive
              </h4>
              <div style={{ width: '42px', height: '3px', backgroundColor: '#0054a6' }}></div>
            </div>

            <div className="row g-4">
              {events.map((ev) => (
                <div className="col-12 col-md-4" key={`rel-${ev.id}`}>
                  <div className="card rounded-3 border shadow-sm overflow-hidden h-100 hover-lift">
                    <div style={{ height: '140px' }}>
                      <img src={ev.image} alt={ev.title} className="w-100 h-100 object-fit-cover" />
                    </div>
                    <div className="p-3">
                      <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.88rem' }}>{ev.title}</h6>
                      <div className="d-flex align-items-center justify-content-between text-muted small mb-2" style={{ fontSize: '0.74rem' }}>
                        <span><i className="fas fa-map-marker-alt me-1 text-muted"></i> {ev.location}</span>
                        <span><i className="far fa-calendar-alt me-1 text-muted"></i> {ev.year}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="badge bg-light text-secondary border small">{ev.category}</span>
                        <span
                          className="small text-dark fw-semibold cursor-pointer"
                          role="button"
                          tabIndex={0}
                          onClick={() => {
                            setSelectedEventId(ev.id);
                            window.scrollTo({ top: 300, behavior: 'smooth' });
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              setSelectedEventId(ev.id);
                              window.scrollTo({ top: 300, behavior: 'smooth' });
                            }
                          }}
                        >
                          View Highlights <i className="fas fa-arrow-right ms-1"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
