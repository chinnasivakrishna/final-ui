import React, { useState } from 'react';
import Breadcrumb from '../components/Breadcrumb';
import PageHeroBanner from '../components/PageHeroBanner';
import careersData from '../data/careersData.json';

export default function CareersPage() {
  const [expandedJobId, setExpandedJobId] = useState(careersData.openPositions[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  // Form State matching all 4 steps
  const [formData, setFormData] = useState({
    // Step 1: Personal Details
    fullName: '',
    phoneNumber: '',
    emailAddress: '',
    currentLocation: '',
    permanentLocation: '',

    // Step 2: Experience & Education
    highestQualification: '',
    experienceType: 'Experienced',
    totalWorkExperience: '',
    currentLastCompany: '',

    // Step 3: Job & Salary Details
    joiningAvailability: 'Immediate',
    noticePeriod: 'Immediate',
    stepMessage: '',
    currentSalary: '',
    expectedSalary: '',

    // Step 4: Portfolio & Documents
    portfolioUrl: '',
    additionalMessage: '',
  });

  const toggleJob = (id) => {
    setExpandedJobId(expandedJobId === id ? null : id);
  };

  const openApplicationModal = (job = null) => {
    setSelectedJob(job || { title: 'General Application' });
    setCurrentStep(1);
    setApplicationSubmitted(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0].name);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitApplication = (e) => {
    e.preventDefault();
    setApplicationSubmitted(true);
  };

  return (
    <div className="careers-page-wrap bg-white">
      {/* 1. Hero Banner matching About Us */}
      <PageHeroBanner
        imageUrl="/images/about_hero_banner.webp"
        alt="Careers at TAITON Architectural Hardware"
        title="CAREERS"
        tagline="Build Your Future with TAITON."
        description="Join a passionate team shaping better spaces through innovation, architecture, and design across India and beyond."
      />

      {/* 2. Breadcrumb below banner */}
      <Breadcrumb items={[{ label: 'Careers' }]} />

      {/* 2. Why Build Your Career With TAITON? */}
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="text-center mb-5">
            <h2
              className="section-main-title text-center mb-2"
              style={{ fontSize: '2.1rem', fontWeight: 600, color: '#002b5c', letterSpacing: '-0.01em' }}
            >
              Why Build Your Career With TAITON?
            </h2>
            <p className="mx-auto mb-0" style={{ maxWidth: '640px', fontSize: '0.98rem', color: '#475569', lineHeight: '1.6' }}>
              We combine growth, opportunities and innovation so you can do your best work and build a lasting career.
            </p>
          </div>

          <div className="row g-0 align-items-stretch text-center border-top border-bottom py-2 py-md-3">
            {/* 1. Personal Learning */}
            <div className="col-6 col-md border-end border-bottom border-bottom-md-0 border-end-md py-3 px-2 px-md-3">
              <div className="mb-2 mb-md-3 d-flex justify-content-center">
                <i className="fas fa-chart-line fs-2 fs-md-1" style={{ color: '#0054a6' }}></i>
              </div>
              <h6 className="fw-bold mb-2" style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', color: '#002b5c' }}>
                Personal Learning
              </h6>
              <p className="mb-0" style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#64748b' }}>
                Continuous learning and growth opportunities.
              </p>
            </div>

            {/* 2. Innovation */}
            <div className="col-6 col-md border-bottom border-bottom-md-0 border-end-md py-3 px-2 px-md-3">
              <div className="mb-2 mb-md-3 d-flex justify-content-center">
                <i className="far fa-lightbulb fs-2 fs-md-1" style={{ color: '#0054a6' }}></i>
              </div>
              <h6 className="fw-bold mb-2" style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', color: '#002b5c' }}>
                Innovation
              </h6>
              <p className="mb-0" style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#64748b' }}>
                Work with ideas, solutions and future-ready technologies.
              </p>
            </div>

            {/* 3. Professional Culture */}
            <div className="col-6 col-md border-end border-bottom border-bottom-md-0 border-end-md py-3 px-2 px-md-3">
              <div className="mb-2 mb-md-3 d-flex justify-content-center">
                <i className="fas fa-users fs-2 fs-md-1" style={{ color: '#0054a6' }}></i>
              </div>
              <h6 className="fw-bold mb-2" style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', color: '#002b5c' }}>
                Professional Culture
              </h6>
              <p className="mb-0" style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#64748b' }}>
                A respectful, inclusive and performance-driven environment.
              </p>
            </div>

            {/* 4. Team Collaboration */}
            <div className="col-6 col-md border-bottom border-bottom-md-0 border-end-md py-3 px-2 px-md-3">
              <div className="mb-2 mb-md-3 d-flex justify-content-center">
                <i className="fas fa-hands-helping fs-2 fs-md-1" style={{ color: '#0054a6' }}></i>
              </div>
              <h6 className="fw-bold mb-2" style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', color: '#002b5c' }}>
                Team Collaboration
              </h6>
              <p className="mb-0" style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#64748b' }}>
                Work with talented people and achieve great things together.
              </p>
            </div>

            {/* 5. Career Opportunities (Leave last one centered on mobile) */}
            <div className="col-12 col-md py-3 px-2 px-md-3">
              <div className="mb-2 mb-md-3 d-flex justify-content-center">
                <i className="fas fa-chart-pie fs-2 fs-md-1" style={{ color: '#0054a6' }}></i>
              </div>
              <h6 className="fw-bold mb-2" style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: 'clamp(0.92rem, 2.5vw, 1.05rem)', color: '#002b5c' }}>
                Career Opportunities
              </h6>
              <p className="mb-0 mx-auto" style={{ fontSize: '0.82rem', lineHeight: '1.45', color: '#64748b', maxWidth: '300px' }}>
                Explore diverse roles and build a lasting career with TAITON.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Life at TAITON */}
      <section id="life-at-taiton" className="py-4 py-md-5 bg-white">
        <div className="site-container">
          <div className="row g-4 g-lg-5 align-items-center">
            <div className="col-12 col-lg-5">
              <h2
                className="section-main-title mb-2"
                style={{ fontSize: 'clamp(1.65rem, 2.5vw, 2.25rem)', fontWeight: 700, color: '#002b5c', letterSpacing: '-0.01em' }}
              >
                Life at TAITON
              </h2>
              <p className="mb-3" style={{ fontSize: '1rem', color: '#1e293b', lineHeight: '1.5' }}>
                See how our culture comes to life across offices and project sites.
              </p>
              <div style={{ width: '44px', height: '3px', backgroundColor: '#0084B4' }}></div>
            </div>

            <div className="col-12 col-lg-7 d-flex justify-content-center align-items-center text-center">
              <img
                src="/images/career_life_collage.png"
                alt="Life at TAITON"
                className="img-fluid rounded-3 shadow-xs mx-auto d-block"
                style={{ objectFit: 'contain', maxHeight: '440px' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 4. People Make TAITON */}
      <section className="py-4 bg-white">
        <div className="site-container">
          <div className="p-4 p-md-5 rounded-4" style={{ backgroundColor: '#edf5ff' }}>
            <div className="row g-4 g-lg-5 align-items-center">
              <div className="col-12 col-lg-5">
                <h2
                  className="section-main-title mb-2"
                  style={{ fontSize: 'clamp(1.65rem, 2.5vw, 2.25rem)', fontWeight: 700, color: '#002b5c', letterSpacing: '-0.01em' }}
                >
                  People Make TAITON
                </h2>
                <p className="mb-3" style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.65' }}>
                  Our culture is rooted in respect, collaboration, and learning. Discover stories from the team about life, growth, and what makes working here special.
                </p>
                <div style={{ width: '44px', height: '3px', backgroundColor: '#0084B4' }}></div>
              </div>

              <div className="col-12 col-lg-7 d-flex justify-content-center align-items-center text-center">
                <img
                  src="/images/career_people_collage.png"
                  alt="People Make TAITON"
                  className="img-fluid rounded-3 shadow-xs mx-auto d-block"
                  style={{ objectFit: 'contain', maxHeight: '440px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Explore Career Opportunities */}
      <section id="open-positions" className="py-5 bg-white">
        <div className="site-container">
          <div className="text-center mb-5">
            <h2
              className="section-main-title text-center mb-2"
              style={{ fontSize: '2.1rem', fontWeight: 700, color: '#002b5c', letterSpacing: '-0.01em' }}
            >
              Explore Career Opportunities
            </h2>
          </div>

          <div className="col-12 col-lg-10 mx-auto">
            <div className="row g-3">
              {/* Left Column with circular briefcase indicators */}
              <div className="col-auto d-none d-md-flex flex-column gap-3 pt-1">
                {careersData.openPositions.map((job) => {
                  const isCurrent = expandedJobId === job.id;
                  return (
                    <button
                      key={job.id}
                      type="button"
                      className="rounded-circle d-flex align-items-center justify-content-center p-0"
                      style={{
                        width: '38px',
                        height: '38px',
                        backgroundColor: isCurrent ? '#edf5ff' : '#ffffff',
                        border: isCurrent ? '1.5px solid #0054a6' : '1px solid #dbeafe',
                        color: '#0054a6',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                      onClick={() => toggleJob(job.id)}
                      title={job.title}
                    >
                      <i className="fas fa-briefcase" style={{ fontSize: '0.88rem' }}></i>
                    </button>
                  );
                })}
              </div>

              {/* Right Accordion List */}
              <div className="col">
                <div className="d-flex flex-column gap-3 mb-5">
                  {careersData.openPositions.map((job) => {
                    const isExpanded = expandedJobId === job.id;
                    return (
                      <div
                        key={job.id}
                        className="border rounded-2 bg-white overflow-hidden"
                        style={{ borderColor: isExpanded ? '#0054a6' : '#e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}
                      >
                        <div
                          className="d-flex align-items-center justify-content-between p-3 px-4 cursor-pointer"
                          onClick={() => toggleJob(job.id)}
                          role="button"
                          tabIndex={0}
                          style={{ backgroundColor: '#ffffff' }}
                        >
                          <h5
                            className="fw-bold text-dark mb-0"
                            style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: '1.18rem', letterSpacing: '-0.01em' }}
                          >
                            {job.title}
                          </h5>
                          <i
                            className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-muted`}
                            style={{ fontSize: '0.95rem' }}
                          ></i>
                        </div>

                        {isExpanded && (
                          <div className="p-4 pt-2 border-top bg-white">
                            <div className="mb-3" style={{ fontSize: '0.92rem', color: '#1e293b', lineHeight: '1.85' }}>
                              <div><strong className="fw-semibold text-dark">Department :</strong> {job.department}</div>
                              <div><strong className="fw-semibold text-dark">Operations Location :</strong> {job.location}</div>
                              <div><strong className="fw-semibold text-dark">Qualification :</strong> {job.qualification}</div>
                            </div>

                            <div className="mb-3">
                              <h6
                                className="fw-bold text-dark mb-2"
                                style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: '1.05rem', color: '#000000', marginTop: '14px' }}
                              >
                                Job Description :
                              </h6>
                              <ul className="list-unstyled mb-0" style={{ fontSize: '0.88rem', lineHeight: '1.75', color: '#334155' }}>
                                {job.jobDescriptions.map((desc, idx) => (
                                  <li key={idx} className="mb-1 d-flex align-items-start gap-2">
                                    <span style={{ color: '#000', fontSize: '0.7rem', marginTop: '3px' }}>▶</span>
                                    <span>{desc}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="mb-4">
                              <h6
                                className="fw-bold text-dark mb-2"
                                style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: '1.05rem', color: '#000000', marginTop: '16px' }}
                              >
                                Required Skill Set :
                              </h6>
                              <ul className="list-unstyled mb-0" style={{ fontSize: '0.88rem', lineHeight: '1.75', color: '#334155' }}>
                                {job.requiredSkills.map((skill, idx) => (
                                  <li key={idx} className="mb-1 d-flex align-items-start gap-2">
                                    <span style={{ color: '#000', fontSize: '0.7rem', marginTop: '3px' }}>▶</span>
                                    <span>{skill}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="d-flex justify-content-end pt-2">
                              <button
                                type="button"
                                className="btn text-white rounded-pill px-4 py-2 fw-semibold"
                                style={{ backgroundColor: '#3b2314', fontSize: '0.92rem', padding: '9px 36px', borderRadius: '50px' }}
                                onClick={() => openApplicationModal(job)}
                              >
                                Apply Now
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Didn't Find the Right Opportunity? Card */}
            <div
              className="p-3 p-md-4 mb-5 rounded-3 d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 gap-md-4"
              style={{ backgroundColor: '#edf5ff', border: '1px solid #dbeafe' }}
            >
              <div className="d-flex flex-column flex-sm-row align-items-center align-items-sm-start text-center text-sm-start gap-3">
                <img
                  src="/images/career_mail_icon.png"
                  alt="Mail"
                  style={{ width: '70px', height: '70px', objectFit: 'contain' }}
                  className="flex-shrink-0"
                />
                <div>
                  <h5 className="fw-bold mb-1" style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: '1.25rem', color: '#002b5c' }}>
                    Didn't Find the Right Opportunity?
                  </h5>
                  <p className="mb-0" style={{ fontSize: '0.92rem', color: '#334155', lineHeight: '1.5' }}>
                    We're always interested in meeting talented people who can contribute to our journey.
                  </p>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-primary rounded-2 px-4 py-2 fw-semibold flex-shrink-0 d-inline-flex align-items-center justify-content-center gap-2 w-100 w-md-auto"
                style={{ backgroundColor: '#0054a6', borderColor: '#0054a6', fontSize: '0.92rem', padding: '10px 24px', borderRadius: '6px' }}
                onClick={() => openApplicationModal({ title: 'General Application' })}
              >
                Send Your Resume <i className="fas fa-arrow-right fs-7"></i>
              </button>
            </div>

            {/* Employee Testimonial Quote */}
            <div className="py-4 bg-white mb-5">
              <div className="row g-4 align-items-center">
                <div className="col-12 col-lg-6">
                  <div style={{ fontSize: '5rem', color: '#0070e0', lineHeight: '0.7', fontFamily: 'Georgia, serif' }}>
                    “
                  </div>
                  <blockquote
                    className="fst-italic my-3"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 'clamp(1.2rem, 3.5vw, 1.55rem)',
                      fontWeight: 500,
                      color: '#002b5c',
                      lineHeight: '1.45',
                    }}
                  >
                    At TAITON, every project gives us an opportunity to learn, contribute and grow.
                  </blockquote>
                  <div style={{ width: '42px', height: '3px', backgroundColor: '#0084B4', marginBottom: '20px' }}></div>
                  <div className="d-flex align-items-center gap-3">
                    <img
                      src="/images/career_rohan_verma.png"
                      alt="Rohan Verma"
                      className="rounded-circle"
                      style={{ width: '56px', height: '56px', objectFit: 'cover' }}
                    />
                    <div>
                      <h6 className="fw-bold mb-0" style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: '1.05rem', color: '#002b5c' }}>
                        Rohan Verma
                      </h6>
                      <small style={{ fontSize: '0.85rem', color: '#64748b' }}>Senior Interior Designer</small>
                    </div>
                  </div>
                </div>

                <div className="col-12 col-lg-6">
                  <img
                    src="/images/career_testimonial_team.png"
                    alt="TAITON Team"
                    className="w-100 rounded-3 shadow-sm"
                    style={{ objectFit: 'cover', maxHeight: '360px' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom CTA Banner: Ready to Grow With TAITON? (Using Operations & Logistics Blueprint Background) */}
      <section
        className="py-5 text-white text-center position-relative overflow-hidden"
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
        <div className="site-container position-relative z-2 py-4">
          <h2
            className="fw-bold mb-2 text-white"
            style={{ fontFamily: 'var(--taiton-font-heading)', fontSize: '2.25rem', letterSpacing: '-0.01em' }}
          >
            Ready to Grow With TAITON?
          </h2>
          <p className="lead mb-4 text-light mx-auto" style={{ maxWidth: '600px', fontSize: '1.05rem', opacity: 0.95, lineHeight: '1.5' }}>
            Explore opportunities and become part of our journey.
          </p>
          <a
            href="#open-positions"
            className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2"
            style={{ backgroundColor: '#0070e0', borderColor: '#0070e0', fontSize: '0.92rem', padding: '10px 28px', borderRadius: '6px' }}
          >
            View Open Positions <i className="fas fa-arrow-right fs-7"></i>
          </a>
        </div>
      </section>

      {/* ==========================================================================
          4-STEP JOB APPLICATION MODAL (Matching Uploaded Screenshots)
          ========================================================================== */}
      {isModalOpen && (
        <div className="app-modal-backdrop" onClick={closeModal}>
          <div
            className="app-modal-dialog"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            style={{ borderRadius: '24px', overflow: 'hidden' }}
          >
            {/* Modal Content / Stepper Row */}
            {applicationSubmitted ? (
              <div className="p-5 text-center bg-white position-relative">
                <button
                  type="button"
                  className="btn-close-circle position-absolute top-0 end-0 m-4"
                  onClick={closeModal}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center text-white shadow-sm"
                  style={{ width: '64px', height: '64px', backgroundColor: '#10b981', fontSize: '1.8rem' }}
                >
                  <i className="fas fa-check"></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">Application Submitted!</h4>
                <p className="text-muted mx-auto mb-4" style={{ maxWidth: '420px', fontSize: '0.95rem' }}>
                  Thank you for applying for <span className="fw-bold text-dark">{selectedJob?.title}</span>. Our recruitment team will review your profile and contact you shortly.
                </p>
                <button
                  type="button"
                  className="btn btn-primary rounded-pill px-5 py-2 fw-semibold"
                  style={{ backgroundColor: 'var(--taiton-blue, #0054a6)', borderColor: 'var(--taiton-blue, #0054a6)' }}
                  onClick={closeModal}
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="row g-0 flex-fill">
                {/* Left Stepper Column */}
                <div className="col-12 col-md-5 app-modal-stepper-col position-relative d-flex flex-column justify-content-between p-4 p-lg-5" style={{ backgroundColor: '#edf5ff', borderRight: 'none' }}>
                  <div>
                    <h4 className="fw-bold mb-3" style={{ color: '#0b2545', fontSize: '1.45rem' }}>
                      Apply for Position
                    </h4>
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <div
                        className="rounded-2 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                        style={{ width: '32px', height: '32px', backgroundColor: '#0054a6' }}
                      >
                        <i className="fas fa-briefcase" style={{ fontSize: '0.9rem' }}></i>
                      </div>
                      <span className="fw-bold text-dark" style={{ fontSize: '1.05rem', lineHeight: '1.2' }}>
                        {selectedJob?.title || 'Sales Executive'}
                      </span>
                    </div>

                    {/* Stepper with connector line */}
                    <div className="position-relative ps-1 pt-2">
                      <div className="app-stepper-line d-none d-md-block" style={{ left: '16px', top: '16px', bottom: '24px', backgroundColor: '#cbd5e1' }}></div>

                      {/* Step 1 Item */}
                      <div className={`app-step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                        <div className="app-step-circle">
                          {currentStep > 1 ? <i className="fas fa-check"></i> : '1'}
                        </div>
                        <span className="app-step-label">Personal Details</span>
                      </div>

                      {/* Step 2 Item */}
                      <div className={`app-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                        <div className="app-step-circle">
                          {currentStep > 2 ? <i className="fas fa-check"></i> : '2'}
                        </div>
                        <span className="app-step-label">Experience &amp; Education</span>
                      </div>

                      {/* Step 3 Item */}
                      <div className={`app-step-item ${currentStep === 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
                        <div className="app-step-circle">
                          {currentStep > 3 ? <i className="fas fa-check"></i> : '3'}
                        </div>
                        <span className="app-step-label">Job &amp; Salary Details</span>
                      </div>

                      {/* Step 4 Item */}
                      <div className={`app-step-item ${currentStep === 4 ? 'active' : ''}`}>
                        <div className="app-step-circle">4</div>
                        <span className="app-step-label">Portfolio &amp; Documents</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Form Fields Column */}
                <div className="col-12 col-md-7 app-modal-form-col p-4 p-lg-5 bg-white position-relative">
                  <button
                    type="button"
                    className="btn-close-circle position-absolute top-0 end-0 m-4"
                    onClick={closeModal}
                    aria-label="Close"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                  {/* STEP 1: Personal Details */}
                  {currentStep === 1 && (
                    <form onSubmit={handleNextStep}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Full Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          className="form-control app-input"
                          placeholder="Enter Your Full Name"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Phone Number <span className="text-danger">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phoneNumber"
                          className="form-control app-input"
                          placeholder="Enter Your Phone Number"
                          required
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="emailAddress"
                          className="form-control app-input"
                          placeholder="Enter Your Email address"
                          value={formData.emailAddress}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Current Location <span className="text-danger">*</span>
                        </label>
                        <select
                          name="currentLocation"
                          className="form-select app-input"
                          required
                          value={formData.currentLocation}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Your City / State</option>
                          {careersData.locations.map((loc, idx) => (
                            <option key={idx} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Permanent Location
                        </label>
                        <select
                          name="permanentLocation"
                          className="form-select app-input"
                          value={formData.permanentLocation}
                          onChange={handleInputChange}
                        >
                          <option value="">Select Your City / State</option>
                          {careersData.locations.map((loc, idx) => (
                            <option key={idx} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>

                      <div className="d-flex justify-content-end pt-2">
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 rounded-2"
                          style={{ backgroundColor: 'var(--taiton-blue, #0054a6)', borderColor: 'var(--taiton-blue, #0054a6)' }}
                        >
                          Next <i className="fas fa-arrow-right fs-8"></i>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 2: Experience & Education */}
                  {currentStep === 2 && (
                    <form onSubmit={handleNextStep}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Highest Qualification <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="highestQualification"
                          className="form-control app-input"
                          placeholder="Enter Your Highest Qualification"
                          required
                          value={formData.highestQualification}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Experience <span className="text-danger">*</span>
                        </label>
                        <select
                          name="experienceType"
                          className="form-select app-input"
                          required
                          value={formData.experienceType}
                          onChange={handleInputChange}
                        >
                          <option value="Fresher">Fresher</option>
                          <option value="Experienced">Experienced</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Total Work Experience <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="totalWorkExperience"
                          className="form-control app-input"
                          placeholder="Enter Your Total Work Experience Years"
                          required
                          value={formData.totalWorkExperience}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Current / Last Company
                        </label>
                        <input
                          type="text"
                          name="currentLastCompany"
                          className="form-control app-input"
                          placeholder="Enter Your Company Name"
                          value={formData.currentLastCompany}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="d-flex justify-content-end gap-2 pt-2">
                        <button
                          type="button"
                          className="btn btn-secondary px-4 py-2 fw-semibold rounded-2"
                          onClick={handlePrevStep}
                        >
                          &larr; Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 rounded-2"
                          style={{ backgroundColor: 'var(--taiton-blue, #0054a6)', borderColor: 'var(--taiton-blue, #0054a6)' }}
                        >
                          Next <i className="fas fa-arrow-right fs-8"></i>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 3: Job & Salary Details */}
                  {currentStep === 3 && (
                    <form onSubmit={handleNextStep}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Joining Availability <span className="text-danger">*</span>
                        </label>
                        <select
                          name="joiningAvailability"
                          className="form-select app-input"
                          required
                          value={formData.joiningAvailability}
                          onChange={handleInputChange}
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="Notice Period">Notice Period</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Notice Period <span className="text-danger">*</span>
                        </label>
                        <select
                          name="noticePeriod"
                          className="form-select app-input"
                          required
                          value={formData.noticePeriod}
                          onChange={handleInputChange}
                        >
                          <option value="Immediate">Immediate</option>
                          <option value="Within 7 Days">Within 7 Days</option>
                          <option value="Within 15 Days">Within 15 Days</option>
                          <option value="Within 30 Days">Within 30 Days</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Write You Message
                        </label>
                        <textarea
                          name="stepMessage"
                          rows="3"
                          className="form-control app-input"
                          placeholder="Write You Message"
                          value={formData.stepMessage}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Current / Previous Salary <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          name="currentSalary"
                          className="form-control app-input"
                          placeholder="Enter Your Salary per month"
                          required
                          value={formData.currentSalary}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Expected Salary
                        </label>
                        <input
                          type="text"
                          name="expectedSalary"
                          className="form-control app-input"
                          placeholder="Enter Your Salary per month"
                          value={formData.expectedSalary}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="d-flex justify-content-end gap-2 pt-2">
                        <button
                          type="button"
                          className="btn btn-secondary px-4 py-2 fw-semibold rounded-2"
                          onClick={handlePrevStep}
                        >
                          &larr; Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2 fw-semibold d-inline-flex align-items-center gap-2 rounded-2"
                          style={{ backgroundColor: 'var(--taiton-blue, #0054a6)', borderColor: 'var(--taiton-blue, #0054a6)' }}
                        >
                          Next <i className="fas fa-arrow-right fs-8"></i>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* STEP 4: Portfolio & Documents */}
                  {currentStep === 4 && (
                    <form onSubmit={handleSubmitApplication}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Portfolio / LinkedIn URL
                        </label>
                        <input
                          type="url"
                          name="portfolioUrl"
                          className="form-control app-input"
                          placeholder="Enter you Portfolio / LinkedIn URL"
                          value={formData.portfolioUrl}
                          onChange={handleInputChange}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Resume / CV <span className="text-danger">*</span>
                        </label>
                        <label className="app-upload-box d-block w-100 mb-0">
                          <input
                            type="file"
                            className="d-none"
                            accept=".pdf,.doc,.docx"
                            required
                            onChange={handleFileChange}
                          />
                          <div className="text-muted small">
                            <i className="fas fa-plus text-primary fs-5 mb-2 d-block"></i>
                            {selectedFile ? (
                              <span className="fw-bold text-success d-block">{selectedFile}</span>
                            ) : (
                              <span>Upload your Resume / CV</span>
                            )}
                            <span className="text-muted d-block mt-1" style={{ fontSize: '0.75rem' }}>
                              (PDF, DOC, DOCX up to 5MB)
                            </span>
                          </div>
                        </label>
                      </div>

                      <div className="mb-4">
                        <label className="form-label small fw-semibold text-dark mb-1">
                          Additional Message
                        </label>
                        <textarea
                          name="additionalMessage"
                          rows="3"
                          className="form-control app-input"
                          placeholder="Write you message"
                          value={formData.additionalMessage}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>

                      <div className="d-flex justify-content-end gap-2 pt-2">
                        <button
                          type="button"
                          className="btn btn-secondary px-4 py-2 fw-semibold rounded-2"
                          onClick={handlePrevStep}
                        >
                          &larr; Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2 fw-semibold rounded-2"
                          style={{ backgroundColor: 'var(--taiton-blue, #0054a6)', borderColor: 'var(--taiton-blue, #0054a6)' }}
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

