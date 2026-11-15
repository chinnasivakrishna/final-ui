import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import teamData from '../data/teamData.json';

export default function OurTeamPage() {
  const [activeLocationId, setActiveLocationId] = useState('hyderabad');

  const locationsList = [
    { id: 'hyderabad', name: 'Hyderabad' },
    { id: 'new-delhi', name: 'New Delhi' },
    { id: 'bengaluru', name: 'Bengaluru' },
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'chennai', name: 'Chennai' },
    { id: 'vijayawada', name: 'Vijayawada' },
    { id: 'vizag', name: 'Vizag' },
    { id: 'pune', name: 'Pune' },
    { id: 'goa', name: 'Goa' },
    { id: 'kochi', name: 'Kochi' },
    { id: 'tiruvannamalai', name: 'Tiruvannamalai' },
    { id: 'raipur', name: 'Raipur' },
    { id: 'nashik', name: 'Nashik' },
    { id: 'kolhapur', name: 'Kolhapur' },
  ];

  const currentSpotlight =
    teamData.locationSpotlight.find((loc) => loc.id === activeLocationId) ||
    teamData.locationSpotlight[0];

  return (
    <div className="our-team-page-wrap bg-white">
      {/* 1. Hero Banner (Image Only, No Text/Buttons) */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="The People Behind TAITON"
      />

      {/* 2. Breadcrumb ALWAYS below banner */}
      <Breadcrumb items={[{ label: 'Our Team' }]} />

      {/* 3. Executive Leadership Showcase (No card box/border/padding around images matching Figma) */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="col-12 col-lg-10 mx-auto">
            {/* Managing Director Row */}
            <div className="row g-4 align-items-center mb-5 pb-2">
              <div className="col-12 col-md-6">
                <img
                  src={teamData.leadership.md.image}
                  alt={teamData.leadership.md.name}
                  className="w-100 object-fit-cover d-block"
                  style={{ height: '275px', borderRadius: '8px' }}
                />
              </div>
              <div className="col-12 col-md-6 ps-md-4">
                <span className="fw-semibold d-block mb-1" style={{ color: '#0054a6', fontSize: '0.84rem' }}>
                  {teamData.leadership.md.role}
                </span>
                <h2 className="fw-bold mb-3" style={{ color: '#004282', fontSize: '1.65rem' }}>
                  {teamData.leadership.md.name}
                </h2>
                <p className="mb-0" style={{ color: '#1e293b', lineHeight: '1.7', fontSize: '0.88rem' }}>
                  {teamData.leadership.md.bio}
                </p>
              </div>
            </div>

            {/* General Managers Row */}
            <div className="row g-4">
              {teamData.leadership.gms.map((gm, idx) => (
                <div className="col-12 col-md-6" key={idx}>
                  <div className="d-flex flex-column flex-sm-row align-items-start gap-4">
                    <img
                      src={gm.image}
                      alt={gm.name}
                      className="object-fit-cover flex-shrink-0 d-block"
                      style={{ width: '215px', height: '165px', borderRadius: '8px' }}
                    />
                    <div className="pt-1">
                      <span className="fw-semibold d-block mb-1" style={{ color: '#0054a6', fontSize: '0.78rem' }}>
                        {gm.role}
                      </span>
                      <h3 className="fw-bold mb-2" style={{ color: '#004282', fontSize: '1.25rem' }}>
                        {gm.name}
                      </h3>
                      <p className="mb-0" style={{ color: '#1e293b', lineHeight: '1.6', fontSize: '0.82rem' }}>
                        {gm.bio}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Our Branch Leaders (Left-aligned heading, unpadded crisp photos matching Figma) */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="mb-4 text-start">
            <h2 className="section-main-title text-start text-uppercase mb-1" style={{ color: '#004282' }}>
              OUR BRANCH LEADERS
            </h2>
            <p className="mb-0" style={{ color: '#0f172a', fontSize: '0.92rem' }}>
              Leading TAITON across India.
            </p>
          </div>

          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-6 g-4 mb-5">
            {teamData.branchLeaders.map((leader, idx) => (
              <div className="col" key={idx}>
                <div className="text-start">
                  <div className="overflow-hidden mb-2" style={{ width: '100%', height: '172px', borderRadius: '6px' }}>
                    <img src={leader.image} alt={leader.name} className="w-100 h-100 object-fit-cover d-block" />
                  </div>
                  <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.78rem' }}>
                    {leader.dept}
                  </div>
                  <div className="fw-semibold text-truncate" style={{ color: '#0054a6', fontSize: '0.76rem' }} title={leader.name}>
                    {leader.name}
                  </div>
                  <div style={{ color: '#334155', fontSize: '0.7rem' }}>
                    {leader.role}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 5. Interactive Branch Leader Spotlight (Unified single bordered box matching Figma) */}
          <div className="mt-5 p-3 p-md-4 bg-white" style={{ border: '1px solid #e2e8f0', borderRadius: '10px', boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)' }}>
            <div className="row g-4 align-items-stretch">
              {/* Select Location Left Column */}
              <div className="col-12 col-md-3 col-lg-2 border-end-md">
                <div className="d-flex align-items-center gap-2 text-uppercase fw-bold mb-2 pb-1" style={{ color: '#004282', fontSize: '0.74rem', letterSpacing: '0.4px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>SELECT LOCATION</span>
                </div>
                <div className="d-flex flex-column gap-1 overflow-y-auto" style={{ maxHeight: '350px' }}>
                  {locationsList.map((loc) => {
                    const isLocActive = activeLocationId === loc.id;
                    return (
                      <button
                        key={loc.id}
                        type="button"
                        className="btn text-start py-1 px-2 border-0 d-flex align-items-center justify-content-between"
                        style={
                          isLocActive
                            ? {
                                backgroundColor: '#edf4fc',
                                color: '#004282',
                                fontWeight: 700,
                                fontSize: '0.78rem',
                                borderLeft: '3px solid #004282',
                                borderRadius: '0 4px 4px 0'
                              }
                            : {
                                backgroundColor: 'transparent',
                                color: '#1e293b',
                                fontWeight: 500,
                                fontSize: '0.78rem',
                                borderRadius: '4px'
                              }
                        }
                        onClick={() => setActiveLocationId(loc.id)}
                      >
                        <span>{loc.name}</span>
                        {isLocActive && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right 9/10 Columns: Spotlight + Info + Bottom Journey Timeline */}
              <div className="col-12 col-md-9 col-lg-10 d-flex flex-column justify-content-between gap-4">
                <div className="row g-4 align-items-stretch">
                  {/* Manager Photo + Bio */}
                  <div className="col-12 col-lg-8">
                    <div className="d-flex flex-column flex-sm-row gap-4 align-items-start">
                      <img
                        src={currentSpotlight.manager.image}
                        alt={currentSpotlight.manager.name}
                        className="object-fit-cover flex-shrink-0 d-block"
                        style={{ width: '215px', height: '215px', borderRadius: '6px' }}
                      />
                      <div className="pt-1">
                        <span
                          className="d-inline-block px-3 py-1 mb-2 text-uppercase fw-bold"
                          style={{ backgroundColor: '#d9ebfc', color: '#004282', fontSize: '0.72rem', borderRadius: '999px' }}
                        >
                          {currentSpotlight.city}
                        </span>
                        <h3 className="fw-bold mb-1" style={{ color: '#004282', fontSize: '1.45rem' }}>
                          {currentSpotlight.manager.name}
                        </h3>
                        <div className="fw-semibold mb-2" style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                          {currentSpotlight.manager.role}
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-1" style={{ color: '#1e293b', fontSize: '0.82rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#004282" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{currentSpotlight.manager.location}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2 mb-3" style={{ color: '#1e293b', fontSize: '0.82rem' }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#004282" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                          </svg>
                          <span>{currentSpotlight.manager.exp}</span>
                        </div>
                        <p className="fst-italic mb-0" style={{ color: '#003875', fontSize: '0.86rem', lineHeight: '1.5' }}>
                          &ldquo;{currentSpotlight.manager.quote}&rdquo;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Branch Info Card */}
                  <div className="col-12 col-lg-4">
                    <div className="p-3 h-100 d-flex flex-column justify-content-between" style={{ backgroundColor: '#f5f8fc', borderRadius: '8px' }}>
                      <div>
                        <div className="d-flex align-items-start gap-2 pb-3 mb-3 border-bottom" style={{ borderColor: '#e2e8f0' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#004282" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0">
                            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                          </svg>
                          <div>
                            <div style={{ color: '#475569', fontSize: '0.72rem' }}>Experience Center</div>
                            <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.82rem' }}>
                              {currentSpotlight.branch.hasExperienceCenter ? 'Yes' : 'No'}
                            </div>
                          </div>
                        </div>

                        <div className="d-flex align-items-start gap-2 mb-3">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#004282" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="mt-1 flex-shrink-0">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <div>
                            <div className="fw-semibold mb-1" style={{ color: '#0f172a', fontSize: '0.76rem' }}>Branch Location</div>
                            <p className="mb-0" style={{ color: '#334155', fontSize: '0.72rem', lineHeight: '1.5' }}>
                              {currentSpotlight.branch.address}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="d-flex flex-column gap-1">
                        <Link
                          to="/experience-center"
                          className="text-decoration-none fw-semibold d-inline-flex align-items-center gap-2"
                          style={{ color: '#004282', fontSize: '0.76rem' }}
                        >
                          <span>View on Map</span> <span>&rarr;</span>
                        </Link>
                        <Link
                          to="/contact-us"
                          className="text-decoration-none fw-semibold d-inline-flex align-items-center gap-2"
                          style={{ color: '#004282', fontSize: '0.76rem' }}
                        >
                          <span>Contact Branch</span> <span>&rarr;</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TAITON Journey Strip */}
                <div className="p-3 p-md-4" style={{ backgroundColor: '#f5f8fc', borderRadius: '8px' }}>
                  <div className="mb-3">
                    <div className="fw-bold text-uppercase" style={{ color: '#004282', fontSize: '0.8rem' }}>
                      TAITON JOURNEY
                    </div>
                    <div style={{ color: '#0054a6', fontSize: '0.74rem' }}>
                      Growth. Learning. Leadership.
                    </div>
                  </div>

                  <div className="position-relative">
                    <div
                      className="d-none d-sm-block position-absolute start-0 w-100"
                      style={{ top: '5px', height: '1.5px', backgroundColor: '#cbd5e1', zIndex: 1 }}
                    ></div>
                    <div className="row g-3 position-relative" style={{ zIndex: 2 }}>
                      {currentSpotlight.manager.timeline.map((step, idx) => (
                        <div className="col-6 col-sm text-start" key={idx}>
                          <div
                            className="rounded-circle mb-2"
                            style={{ width: '9px', height: '9px', backgroundColor: '#004282' }}
                          ></div>
                          <div className="fw-bold" style={{ color: '#004282', fontSize: '0.84rem' }}>{step.year}</div>
                          <div style={{ color: '#334155', fontSize: '0.72rem', lineHeight: '1.35' }}>
                            {step.milestone}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. The Team Behind The Work (Left-aligned, 7 sharp portrait cards without bordered padding boxes) */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="mb-4 text-start">
            <h2 className="section-main-title text-start text-uppercase mb-1" style={{ color: '#004282' }}>
              THE TEAM BEHIND THE WORK
            </h2>
            <p className="mb-0" style={{ color: '#1e293b', maxWidth: '680px', fontSize: '0.88rem' }}>
              Our people bring together expertise across sales, operations, design, technology, customer support and business development.
            </p>
          </div>

          <div className="team-grid-7 mb-4">
            {teamData.teamBehindWork.map((member, idx) => (
              <div key={idx}>
                <div className="text-start">
                  <div className="overflow-hidden mb-2" style={{ width: '100%', height: '152px', borderRadius: '6px' }}>
                    <img src={member.image} alt={member.name} className="w-100 h-100 object-fit-cover d-block" />
                  </div>
                  <div className="fw-bold" style={{ color: '#0f172a', fontSize: '0.76rem' }}>
                    {member.dept}
                  </div>
                  <div className="fw-semibold text-truncate" style={{ color: '#0054a6', fontSize: '0.74rem' }} title={member.name}>
                    {member.name}
                  </div>
                  <div style={{ color: '#334155', fontSize: '0.68rem' }}>
                    {member.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Taiton at a Glance: Blue Stats Strip */}
      <section className="py-4 text-white" style={{ background: 'linear-gradient(90deg, #003b75 0%, #0054a6 100%)' }}>
        <div className="site-container">
          <div className="row align-items-center justify-content-between g-4">
            <div className="col-12 col-md-3">
              <h3 className="fw-bold text-white mb-0" style={{ fontSize: '1.35rem', letterSpacing: '0.8px', lineHeight: '1.3' }}>
                TAITON AT<br />A GLANCE
              </h3>
            </div>
            <div className="col-12 col-md-9">
              <div className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3 text-center">
                {teamData.stats.map((st, idx) => (
                  <div
                    className={`col ${idx < teamData.stats.length - 1 ? 'border-end border-white border-opacity-25' : ''}`}
                    key={idx}
                  >
                    <div className="fw-bold text-white mb-0" style={{ fontSize: '2.1rem', lineHeight: '1.1' }}>{st.value}</div>
                    <span className="text-white small" style={{ fontSize: '0.82rem' }}>{st.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Bottom Banner: Edge-to-edge Collaborative Photo Left + Pale Blue Content Right */}
      <section className="bg-white">
        <div className="w-100 overflow-hidden" style={{ backgroundColor: '#edf4fc' }}>
          <div className="row g-0 align-items-stretch">
            <div className="col-12 col-lg-6 p-0">
              <img
                src="/images/team_bottom_banner.png"
                alt="TAITON Team Collaboration"
                className="w-100 h-100 object-fit-cover d-block"
                style={{ minHeight: '240px', maxHeight: '280px' }}
              />
            </div>
            <div className="col-12 col-lg-6 d-flex flex-column justify-content-center p-4 p-md-5">
              <div className="px-lg-4">
                <span className="text-uppercase fw-bold d-block mb-1" style={{ color: '#0054a6', fontSize: '0.78rem', letterSpacing: '0.6px' }}>
                  STRONGER TEAMS. GREATER REACH.
                </span>
                <h2 className="fw-bold mb-2" style={{ color: '#004282', fontSize: '1.75rem' }}>
                  Together across India.
                </h2>
                <p className="mb-4" style={{ color: '#1e293b', fontSize: '0.92rem', lineHeight: '1.6', maxWidth: '480px' }}>
                  Our branch leaders ensure you get the right support, expertise and solutions &mdash; wherever you are.
                </p>

                <div className="text-end">
                  <Link
                    to="/experience-center"
                    className="btn bg-white rounded-pill px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
                    style={{ border: '1px solid #004282', color: '#004282', fontSize: '0.8rem' }}
                  >
                    <span>Explore Our Presence</span> <span>&rarr;</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

