import React from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';

export default function BlogDetailPage() {
  const requirements = [
    {
      icon: 'fas fa-building',
      title: 'Application',
      desc: 'Residential, Commercial, Hospitality or Institutional',
    },
    {
      icon: 'fas fa-door-closed',
      title: 'Door Type',
      desc: 'Glass, Wooden, Aluminium or Metal Doors',
    },
    {
      icon: 'fas fa-users',
      title: 'Usage Frequency',
      desc: 'Light, Medium or Heavy Usage',
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Safety & Compliance',
      desc: 'Ensure standards and safety requirements',
    },
  ];

  const safetyBadges = [
    { icon: 'fas fa-shield-alt', label: 'Tested for Durability' },
    { icon: 'fas fa-tint-slash', label: 'Corrosion Resistant' },
    { icon: 'fas fa-sync-alt', label: 'Smooth Operation' },
    { icon: 'fas fa-check-circle', label: 'Safe & Reliable' },
  ];

  const finishSwatches = [
    { name: 'Satin Stainless (SSS)', img: 'https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=300&q=80' },
    { name: 'Polished Chrome (PSS)', img: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f156f?auto=format&fit=crop&w=300&q=80' },
    { name: 'Matte Black', img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80' },
    { name: 'Brushed Brass / Gold', img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=300&q=80' },
    { name: 'Antique Bronze', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80' },
  ];

  const applications = [
    { title: 'Glass Doors', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80' },
    { title: 'Sliding Systems', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=400&q=80' },
    { title: 'Automatic Doors', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=80' },
    { title: 'Shower Enclosures', img: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=400&q=80' },
  ];

  const eventGallery = [
    'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80',
  ];

  const categories = [
    'Door Handles',
    'Door Locks',
    'Floor Springs',
    'Glass Fittings',
    'Patch Fittings',
    'Sliding Systems',
    'Shower Solutions',
    'Automatic Doors',
    'Architectural Trends',
    'Maintenance & Care',
  ];

  return (
    <div className="blog-detail-page bg-white">
      {/* 1. Breadcrumb below Navbar */}
      <Breadcrumb
        items={[
          { label: 'Blogs Page', path: '/blogs' },
          { label: 'Blogs Preview' },
        ]}
      />

      <section className="py-4">
        <div className="site-container">
          <div className="row g-5">
            {/* Left Main Article Column */}
            <div className="col-12 col-lg-8">
              {/* Category Pill */}
              <span
                className="badge px-3 py-2 text-uppercase fw-bold mb-3"
                style={{ backgroundColor: 'var(--taiton-blue-light, #ebf4ff)', color: 'var(--taiton-blue, #0054a6)', letterSpacing: '0.5px', fontSize: '0.78rem' }}
              >
                ARCHITECTURAL INSIGHTS
              </span>

              {/* Title & Subtitle */}
              <h1 className="fw-bold text-dark display-6 mb-3" style={{ fontSize: '2.1rem', lineHeight: '1.25' }}>
                Choosing the Right Door Hardware for Modern Spaces
              </h1>
              <p className="lead text-muted mb-4" style={{ fontSize: '1.05rem', lineHeight: '1.6' }}>
                A practical guide to selecting door hardware that balances design, performance and long-term durability.
              </p>

              {/* Author & Meta */}
              <div className="d-flex align-items-center justify-content-between pb-3 mb-4 border-bottom text-muted small">
                <div className="d-flex align-items-center gap-3">
                  <span><i className="fas fa-user-circle me-1 text-primary"></i> By TAITON Team</span>
                  <span><i className="far fa-calendar-alt me-1"></i> 18 Aug 2026</span>
                  <span><i className="far fa-clock me-1"></i> 5 min read</span>
                </div>
                <button type="button" className="btn btn-sm btn-light rounded-pill px-3 border">
                  <i className="fas fa-share-alt me-1"></i> Share
                </button>
              </div>

              {/* Main Featured Photo */}
              <div className="rounded-4 overflow-hidden mb-5 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern Door Hardware"
                  className="w-100 object-fit-cover"
                  style={{ maxHeight: '440px' }}
                />
              </div>

              {/* Content: Introduction */}
              <div className="article-body">
                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.3rem' }}>
                  Introduction
                </h3>
                <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                  Door hardware plays a vital role in the functionality, safety and aesthetics of any space. Whether it's a residential project, commercial building or hospitality environment, the right hardware ensures smooth operation and enhances the overall design language.
                </p>

                {/* Understanding Your Requirements */}
                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.3rem' }}>
                  Understanding Your Requirements
                </h3>
                <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                  Before selecting door hardware, it's important to evaluate the usage, door material, traffic frequency and environment. These factors help in choosing the right type of fitting that ensures durability and performance.
                </p>

                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-3 mb-5">
                  {requirements.map((req, idx) => (
                    <div className="col" key={idx}>
                      <div className="card h-100 p-3 border rounded-3 text-center bg-taiton-gray shadow-xs">
                        <div
                          className="rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center text-primary"
                          style={{ width: '42px', height: '42px', backgroundColor: 'var(--taiton-blue-light, #ebf4ff)' }}
                        >
                          <i className={req.icon}></i>
                        </div>
                        <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                          {req.title}
                        </h6>
                        <small className="text-muted" style={{ fontSize: '0.78rem', lineHeight: '1.4' }}>
                          {req.desc}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Material & Finish Selection */}
                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.3rem' }}>
                  Material &amp; Finish Selection
                </h3>
                <p className="text-muted mb-3" style={{ lineHeight: '1.8' }}>
                  The right material and finish not only define the look but also contribute to the lifespan of the hardware.
                </p>
                <div className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-2 mb-5">
                  {finishSwatches.map((f, idx) => (
                    <div className="col" key={idx}>
                      <div className="card border rounded-3 overflow-hidden text-center h-100">
                        <img src={f.img} alt={f.name} className="w-100 object-fit-cover" style={{ height: '90px' }} />
                        <div className="p-2 small fw-semibold text-dark text-truncate" style={{ fontSize: '0.78rem' }}>
                          {f.name}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Performance & Safety */}
                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.3rem' }}>
                  Performance &amp; Safety
                </h3>
                <p className="text-muted mb-3" style={{ lineHeight: '1.8' }}>
                  Opt for hardware that is tested for durability, corrosion resistance and smooth functionality. Quality hardware ensures long-term performance with minimal maintenance.
                </p>
                <div className="row row-cols-2 row-cols-md-4 g-3 mb-5">
                  {safetyBadges.map((badge, idx) => (
                    <div className="col" key={idx}>
                      <div className="d-flex align-items-center gap-2 p-2 border rounded-2 bg-light">
                        <i className={`${badge.icon} text-primary fs-6`}></i>
                        <span className="small fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>
                          {badge.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Applications */}
                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.3rem' }}>
                  Applications
                </h3>
                <p className="text-muted mb-3" style={{ lineHeight: '1.8' }}>
                  From glass partitions and swing doors to sliding systems and automatic doors, TAITON offers solutions that blend seamlessly with modern architecture.
                </p>
                <div className="row row-cols-2 row-cols-md-4 g-3 mb-5">
                  {applications.map((app, idx) => (
                    <div className="col" key={idx}>
                      <div className="card rounded-3 overflow-hidden border shadow-xs h-100">
                        <img src={app.img} alt={app.title} className="w-100 object-fit-cover" style={{ height: '110px' }} />
                        <div className="p-2 text-center small fw-semibold text-dark">
                          {app.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Conclusion */}
                <h3 className="fw-bold text-dark mb-2" style={{ fontSize: '1.3rem' }}>
                  Conclusion
                </h3>
                <p className="text-muted mb-4" style={{ lineHeight: '1.8' }}>
                  Selecting the right door hardware is about more than just appearance. It's about creating safe, functional and beautiful spaces that stand the test of time. TAITON provides world-class hardware solutions tailored to every project need.
                </p>

                {/* Tags */}
                <div className="d-flex align-items-center gap-2 mb-5">
                  <span className="badge bg-light text-primary border rounded-pill px-3 py-2 small">
                    <i className="fas fa-tag me-1"></i> Door Handle
                  </span>
                  <span className="badge bg-light text-primary border rounded-pill px-3 py-2 small">
                    <i className="fas fa-tag me-1"></i> Door Handles
                  </span>
                </div>

                {/* Common Mistakes to Avoid */}
                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.3rem' }}>
                  Common Mistakes to Avoid
                </h3>
                <div className="d-flex flex-column gap-3 mb-5">
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Don't Skimp on Main Door Hardware</h6>
                    <p className="text-muted small mb-0">Your front door hardware gets used daily and needs to work reliably. Cheap door hardware &amp; locks fail when you need them most.</p>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Don't Mix Handle Styles Throughout Your Home</h6>
                    <p className="text-muted small mb-0">Pick one style and stick with it. You can use different finishes, but the basic handle shape should be consistent.</p>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Don't Ignore Door Thickness</h6>
                    <p className="text-muted small mb-0">Measure your doors before ordering hardware. Door handle accessories and locks are sized for specific door thicknesses.</p>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Don't Forget About Building Codes</h6>
                    <p className="text-muted small mb-0">Commercial projects must meet local codes for accessibility, fire safety, and security. Check requirements early in your planning process.</p>
                  </div>
                </div>

                {/* FAQ */}
                <h3 className="fw-bold text-dark mb-3" style={{ fontSize: '1.3rem' }}>
                  FAQ
                </h3>
                <div className="accordion accordion-flush mb-5" id="blogFaqAccordion">
                  <div className="accordion-item border-bottom">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed px-0 fw-semibold text-dark small" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                        What's the most durable door handle hardware?
                      </button>
                    </h2>
                    <div id="faq1" className="accordion-collapse collapse show">
                      <div className="accordion-body px-0 text-muted small">
                        Stainless steel / brass handles with quality lock bodies. The Commercial Pro Series handles commercial abuse well.
                      </div>
                    </div>
                  </div>
                  <div className="accordion-item border-bottom">
                    <h2 className="accordion-header">
                      <button className="accordion-button collapsed px-0 fw-semibold text-dark small" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                        Should all door hardware match exactly?
                      </button>
                    </h2>
                    <div id="faq2" className="accordion-collapse collapse">
                      <div className="accordion-body px-0 text-muted small">
                        Keep the same style throughout each floor or room. You may vary finishes, but basic handle shapes should coordinate.
                      </div>
                    </div>
                  </div>
                </div>

                {/* Prev / Next Article Bar */}
                <div className="card rounded-3 border p-3 bg-light shadow-xs mb-5">
                  <div className="d-flex align-items-center justify-content-between">
                    <Link to="/blogs" className="d-flex align-items-center gap-2 text-decoration-none text-dark">
                      <i className="fas fa-chevron-left text-primary"></i>
                      <div>
                        <span className="text-muted d-block small" style={{ fontSize: '0.72rem' }}>Previous Article</span>
                        <span className="fw-semibold small">How Slim Frame Doors Enhance Spaces</span>
                      </div>
                    </Link>

                    <Link to="/blogs" className="btn btn-outline-primary btn-sm rounded-circle d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                      <i className="fas fa-th-large"></i>
                    </Link>

                    <Link to="/blogs" className="d-flex align-items-center gap-2 text-decoration-none text-dark text-end">
                      <div>
                        <span className="text-muted d-block small" style={{ fontSize: '0.72rem' }}>Next Article</span>
                        <span className="fw-semibold small">Top 5 Shower Enclosures Design Trends</span>
                      </div>
                      <i className="fas fa-chevron-right text-primary"></i>
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="col-12 col-lg-4">
              {/* Recent Posts */}
              <div className="card border rounded-3 p-4 mb-4 bg-white shadow-xs">
                <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1rem' }}>
                  Recent Posts
                </h5>
                <div className="d-flex flex-column gap-3">
                  <Link to="/blog-detail" className="text-decoration-none text-dark d-flex gap-3 align-items-center">
                    <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=120&q=80" alt="" className="rounded object-fit-cover" style={{ width: '54px', height: '54px' }} />
                    <div>
                      <h6 className="fw-bold text-dark mb-1 small" style={{ lineHeight: '1.3' }}>Squeaking Or Sticking Bed? Why Your Slats Are The Problem</h6>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>09 Aug 2026</small>
                    </div>
                  </Link>
                  <Link to="/blog-detail" className="text-decoration-none text-dark d-flex gap-3 align-items-center">
                    <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=120&q=80" alt="" className="rounded object-fit-cover" style={{ width: '54px', height: '54px' }} />
                    <div>
                      <h6 className="fw-bold text-dark mb-1 small" style={{ lineHeight: '1.3' }}>Why Modular Kitchen Cabinets Sag Over Time</h6>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>05 Aug 2026</small>
                    </div>
                  </Link>
                  <Link to="/blog-detail" className="text-decoration-none text-dark d-flex gap-3 align-items-center">
                    <img src="https://images.unsplash.com/photo-1558997519-83ea9252def8?auto=format&fit=crop&w=120&q=80" alt="" className="rounded object-fit-cover" style={{ width: '54px', height: '54px' }} />
                    <div>
                      <h6 className="fw-bold text-dark mb-1 small" style={{ lineHeight: '1.3' }}>5 Reasons Why You Should Buy A Smart Lock</h6>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>01 Feb 2026</small>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Filter Categories */}
              <div className="card border rounded-3 p-4 mb-4 bg-white shadow-xs">
                <h5 className="fw-bold text-dark mb-3" style={{ fontSize: '1rem' }}>
                  FILTER CATEGORIES
                </h5>
                <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                  {categories.map((cat, idx) => (
                    <li key={idx}>
                      <Link to="/blogs" className="text-decoration-none text-dark small d-flex align-items-center justify-content-between py-1">
                        <span>{cat}</span>
                        <i className="fas fa-chevron-right text-muted fs-8"></i>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Looking for the Right Solution? CTA */}
              <div
                className="card border-0 rounded-3 p-4 mb-4 text-white text-center shadow-xs"
                style={{ background: 'linear-gradient(135deg, #0b1f3a 0%, #002b5c 50%, #0054a6 100%)' }}
              >
                <div className="mb-2">
                  <i className="fas fa-cube text-primary fs-3"></i>
                </div>
                <h5 className="fw-bold text-white mb-2" style={{ fontSize: '1.05rem' }}>
                  Looking for the Right Solution?
                </h5>
                <p className="text-light small mb-3 opacity-90" style={{ fontSize: '0.8rem' }}>
                  Talk to our experts for product recommendations and technical guidance.
                </p>
                <Link
                  to="/contact-us"
                  className="btn btn-light rounded-pill btn-sm px-4 fw-bold mx-auto text-dark"
                >
                  Get in Touch &rarr;
                </Link>
              </div>

              {/* YOU MAY ALSO LIKE */}
              <div className="card border rounded-3 p-4 mb-4 bg-white shadow-xs">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>
                    YOU MAY ALSO LIKE
                  </h5>
                  <Link to="/blogs" className="text-decoration-none text-primary small" style={{ fontSize: '0.75rem' }}>
                    View All (16) &rarr;
                  </Link>
                </div>
                <div className="d-flex flex-column gap-3">
                  <Link to="/blog-detail" className="text-decoration-none text-dark d-flex gap-3 align-items-center">
                    <img src="https://images.unsplash.com/photo-1541888946425-d0fbb18f156f?auto=format&fit=crop&w=120&q=80" alt="" className="rounded object-fit-cover" style={{ width: '50px', height: '50px' }} />
                    <div>
                      <h6 className="fw-bold text-dark mb-1 small" style={{ fontSize: '0.82rem' }}>Latest Trends In Architectural Hardware</h6>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>12 Aug 2026 • 4 min read</small>
                    </div>
                  </Link>
                  <Link to="/blog-detail" className="text-decoration-none text-dark d-flex gap-3 align-items-center">
                    <img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=120&q=80" alt="" className="rounded object-fit-cover" style={{ width: '50px', height: '50px' }} />
                    <div>
                      <h6 className="fw-bold text-dark mb-1 small" style={{ fontSize: '0.82rem' }}>Frameless Glass Doors: A Complete Guide</h6>
                      <small className="text-muted" style={{ fontSize: '0.72rem' }}>05 Aug 2026 • 6 min read</small>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Event Gallery (10 images linking to /exhibitions-events as requested by user in image note) */}
              <div className="card border rounded-3 p-4 mb-4 bg-white shadow-xs">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="fw-bold text-dark mb-0" style={{ fontSize: '0.95rem' }}>
                    EVENT GALLERY
                  </h5>
                  <Link to="/exhibitions-events" className="text-decoration-none text-primary small" style={{ fontSize: '0.75rem' }}>
                    View Events &rarr;
                  </Link>
                </div>
                <div className="row row-cols-5 g-2">
                  {eventGallery.map((imgUrl, idx) => (
                    <div className="col" key={idx}>
                      <Link to="/exhibitions-events" className="d-block rounded overflow-hidden shadow-xs" style={{ height: '50px' }}>
                        <img src={imgUrl} alt="Event" className="w-100 h-100 object-fit-cover" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom CTA Banner */}
      <section className="py-5 text-white" style={{ background: 'linear-gradient(135deg, #0b1f3a 0%, #002b5c 50%, #0054a6 100%)' }}>
        <div className="site-container">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-4">
            <div className="d-flex align-items-center gap-4">
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white flex-shrink-0"
                style={{ width: '60px', height: '60px', backgroundColor: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)' }}
              >
                <i className="fas fa-headset fs-3"></i>
              </div>
              <div>
                <h3 className="fw-bold text-white mb-1" style={{ fontSize: '1.4rem' }}>
                  Need Help Choosing the Right Solution?
                </h3>
                <p className="text-light mb-0 small opacity-90">
                  Our experts are here to help you with product selection, technical details and quotations.
                </p>
              </div>
            </div>

            <Link
              to="/contact-us"
              className="btn btn-light rounded-pill px-4 py-2 fw-bold text-dark flex-shrink-0 shadow-sm"
            >
              Request a Quote &rarr;
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

