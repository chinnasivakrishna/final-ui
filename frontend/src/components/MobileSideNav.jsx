import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchCategories, fetchSpaces } from '../api/catalogApi';
import { useAuth } from '../context/AuthContext';

export default function MobileSideNav({ isOpen, onClose }) {
  const location = useLocation();
  const currentSpaceParam = new URLSearchParams(location.search).get('spaceId');
  const { user, isAuthenticated, openLoginModal, logout } = useAuth();
  const [categoriesList, setCategoriesList] = useState([]);
  const [spacesList, setSpacesList] = useState([]);
  const [openSection, setOpenSection] = useState('products');
  const [openCategory, setOpenCategory] = useState(null);
  const [openSubcategory, setOpenSubcategory] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchSpaces().then((spList) => {
      if (mounted && Array.isArray(spList) && spList.length > 0) {
        setSpacesList(spList);
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    fetchCategories().then((cats) => {
      if (mounted && Array.isArray(cats)) {
        setCategoriesList(cats);
        if (cats.length > 0 && cats[0]?.id) {
          setOpenCategory(cats[0].id);
          if (cats[0]?.subcategories?.[0]?.id) {
            setOpenSubcategory(cats[0].subcategories[0].id);
          }
        }
      }
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const toggleSection = (sec) => {
    setOpenSection(openSection === sec ? null : sec);
  };

  const toggleCategory = (catId) => {
    setOpenCategory(openCategory === catId ? null : catId);
  };

  const toggleSubcategory = (subId) => {
    setOpenSubcategory(openSubcategory === subId ? null : subId);
  };

  const handleLinkClick = () => {
    onClose();
  };

  return (
    <>
      <div
        className={`mobile-side-nav-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      ></div>

      <div
        id="mobileSideNav"
        className={`mobile-side-nav ${isOpen ? 'open show' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
      >
        <div className="mobile-side-nav-header d-flex align-items-center justify-content-between p-3 border-bottom bg-white shadow-sm flex-shrink-0">
          <div className="brand-logo-wrapper">
            <Link to="/" onClick={handleLinkClick} className="d-flex align-items-center">
              <img
                src="/Taiton/Taiton Logo without Tagline.png"
                alt="TAITON Architectural Hardware"
                className="drawer-logo-img"
              />
            </Link>
          </div>
          <button
            type="button"
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm drawer-close-btn"
            id="closeMobileNavBtn"
            onClick={onClose}
            aria-label="Close Navigation"
          >
            <i className="fas fa-times fs-5 text-dark"></i>
          </button>
        </div>

        <div className="mobile-side-nav-body p-3 overflow-y-auto flex-grow-1">
          {isAuthenticated && user ? (
            <div className="d-flex align-items-center gap-3 p-3 rounded-3 mb-3 bg-light border shadow-sm">
              <div
                className="rounded-circle text-white d-flex align-items-center justify-content-center overflow-hidden flex-shrink-0 drawer-user-avatar"
                style={{ width: '42px', height: '42px', backgroundColor: '#002b5c' }}
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name || 'User'}
                    className="w-100 h-100 object-fit-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <i className="fas fa-user fs-5"></i>
                )}
              </div>
              <div className="flex-grow-1 text-truncate">
                <div className="fw-bold text-dark text-truncate profile-name-highlight">
                  {user.name || user.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-muted small text-truncate profile-role-text">
                  {user.mobile || user.email || 'Customer'}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline-danger btn-sm rounded-pill px-2 py-1 flex-shrink-0"
                style={{ fontSize: '0.75rem' }}
                onClick={() => {
                  logout();
                }}
                title="Logout"
              >
                <i className="fas fa-sign-out-alt me-1"></i>Logout
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center justify-content-between p-3 rounded-3 mb-3 bg-light border shadow-sm">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="rounded-circle bg-secondary bg-opacity-10 text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                  style={{ width: '38px', height: '38px' }}
                >
                  <i className="fas fa-user-circle fs-4"></i>
                </div>
                <div>
                  <div className="fw-bold text-dark small">Welcome to TAITON</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>Architectural Hardware</div>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-pill px-3 fw-semibold flex-shrink-0"
                style={{ backgroundColor: '#0054a6', borderColor: '#0054a6' }}
                onClick={() => {
                  onClose();
                  openLoginModal();
                }}
              >
                Sign In
              </button>
            </div>
          )}

          <div className="mb-3">
            <Link
              to="/products"
              onClick={handleLinkClick}
              className="btn w-100 rounded-pill py-2 text-white d-flex align-items-center justify-content-center gap-2 shadow-sm drawer-new-arrivals-btn"
            >
              <span className="rounded-circle d-inline-block cyan-glow-dot"></span>
              <span className="fw-bold text-uppercase drawer-new-arrivals-text">Explore New Arrivals 2026</span>
              <i className="fas fa-arrow-right ms-1 fs-7"></i>
            </Link>
          </div>

          <div className="accordion accordion-flush mobile-nav-accordion" id="mobileNavAccordion">
            
            <div className="accordion-item border-bottom">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button py-3 fw-bold text-dark ${openSection === 'company' ? '' : 'collapsed'}`}
                  type="button"
                  onClick={() => toggleSection('company')}
                  aria-expanded={openSection === 'company'}
                >
                  <i className="fas fa-building me-3 text-primary drawer-nav-icon"></i> Company
                </button>
              </h2>
              {openSection === 'company' && (
                <div className="accordion-collapse show">
                  <div className="accordion-body py-2 px-3 bg-light rounded-2 mb-2">
                    <ul className="list-unstyled mb-0 ms-2">
                      <li className="py-1">
                        <Link to="/about" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> About Us
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/experience-center" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Experience Center
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/operations" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Operations &amp; Logistics
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/awards" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Awards &amp; Achievements
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/exhibitions-events" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Exhibitions &amp; Events
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/blogs" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Blogs
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/careers" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Careers
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/our-team" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Our Team
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="accordion-item border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <Link
                  to="/products"
                  onClick={handleLinkClick}
                  className="py-3 ps-3 fw-bold text-dark text-decoration-none d-flex align-items-center flex-grow-1"
                  style={{ fontSize: '1rem' }}
                >
                  <i className="fas fa-th-large me-3 text-primary drawer-nav-icon"></i>
                  <span>Products</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-link p-3 text-secondary text-decoration-none d-flex align-items-center justify-content-center"
                  onClick={() => toggleSection('products')}
                  aria-label="Toggle Products dropdown"
                  style={{ width: '48px', height: '48px' }}
                >
                  <i className={`fas fa-chevron-down transition-transform ${openSection === 'products' ? 'rotate-180 text-primary' : ''}`}></i>
                </button>
              </div>
              {openSection === 'products' && (
                <div className="accordion-collapse show">
                  <div className="accordion-body py-2 px-2 bg-light rounded-2 mb-2">
                    <div className="accordion accordion-flush" id="mobileCatAccordion">
                      {categoriesList.map((cat) => (
                        <div className="accordion-item bg-transparent border-0 mb-1" key={cat.id}>
                          <div className="d-flex align-items-center justify-content-between rounded-2 bg-white border mb-1">
                            <Link
                              to={`/product-category?catId=${cat.id}`}
                              onClick={handleLinkClick}
                              className="py-2 px-3 text-dark text-decoration-none fw-semibold flex-grow-1"
                              style={{ fontSize: '0.88rem' }}
                            >
                              {cat.name || cat.title}
                            </Link>
                            {Array.isArray(cat.subcategories) && cat.subcategories.length > 0 && (
                              <button
                                type="button"
                                className="btn btn-link py-2 px-3 text-secondary text-decoration-none"
                                onClick={() => toggleCategory(cat.id)}
                                aria-label={`Toggle ${cat.name || cat.title}`}
                              >
                                <i className={`fas fa-chevron-down fs-8 transition-transform ${openCategory === cat.id ? 'rotate-180 text-primary' : ''}`}></i>
                              </button>
                            )}
                          </div>
                          
                          {openCategory === cat.id && Array.isArray(cat.subcategories) && (
                            <div className="ps-3 py-1">
                              <div className="accordion accordion-flush">
                                {cat.subcategories.map((sub) => (
                                  <div className="accordion-item bg-transparent border-0 mb-1" key={sub.id}>
                                    <div className="d-flex align-items-center justify-content-between rounded-2 bg-white border mb-1">
                                      <Link
                                        to={`/product-category?catId=${cat.id}&subId=${sub.id}`}
                                        onClick={handleLinkClick}
                                        className="py-1 px-2 text-dark text-decoration-none fw-medium flex-grow-1"
                                        style={{ fontSize: '0.82rem' }}
                                      >
                                        {sub.name || sub.title}
                                      </Link>
                                      {Array.isArray(sub.items) && sub.items.length > 0 && (
                                        <button
                                          type="button"
                                          className="btn btn-link py-1 px-2 text-secondary text-decoration-none"
                                          onClick={() => toggleSubcategory(sub.id)}
                                          aria-label={`Toggle ${sub.name || sub.title}`}
                                        >
                                          <i className={`fas fa-chevron-down fs-8 transition-transform ${openSubcategory === sub.id ? 'rotate-180 text-primary' : ''}`}></i>
                                        </button>
                                      )}
                                    </div>

                                    {openSubcategory === sub.id && (
                                      <ul className="list-unstyled mb-0 ps-3 py-1">
                                        {sub.items && sub.items.length > 0 ? (
                                          sub.items.map((item, idx) => {
                                            const itemName = typeof item === 'object' ? (item.name || item.title || item.code) : item;
                                            const itemUrl = typeof item === 'object' && item.url
                                              ? item.url
                                              : (typeof item === 'object' && item.id
                                                  ? `/product-list?catId=${item.id}`
                                                  : `/product-list?search=${encodeURIComponent(itemName)}`);
                                            return (
                                              <li className="py-1" key={idx}>
                                                <Link
                                                  to={itemUrl}
                                                  onClick={handleLinkClick}
                                                  className="text-decoration-none text-muted small d-block"
                                                >
                                                  &bull; {itemName}
                                                </Link>
                                              </li>
                                            );
                                          })
                                        ) : (
                                          <li className="py-1">
                                            <Link
                                              to={cat.url || `/product-list?catId=${cat.id}`}
                                              onClick={handleLinkClick}
                                              className="text-decoration-none text-primary small d-block fw-semibold"
                                            >
                                              View {sub.name || sub.title} Hardware &rarr;
                                            </Link>
                                          </li>
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-bottom">
              <Link
                to="/catalogues"
                onClick={handleLinkClick}
                className="d-flex align-items-center drawer-direct-link"
              >
                <i className="fas fa-book-open me-3 text-primary drawer-nav-icon"></i> Catalogues
              </Link>
            </div>

            <div className="accordion-item border-bottom">
              <div className="d-flex align-items-center justify-content-between">
                <Link
                  to="/explore-spaces"
                  onClick={handleLinkClick}
                  className="py-3 ps-3 fw-bold text-dark text-decoration-none d-flex align-items-center flex-grow-1"
                  style={{ fontSize: '1rem' }}
                >
                  <i className="fas fa-cube me-3 text-primary drawer-nav-icon"></i>
                  <span>Explore Spaces</span>
                </Link>
                <button
                  type="button"
                  className="btn btn-link p-3 text-secondary text-decoration-none d-flex align-items-center justify-content-center"
                  onClick={() => toggleSection('spaces')}
                  aria-label="Toggle Explore Spaces dropdown"
                  style={{ width: '48px', height: '48px' }}
                >
                  <i className={`fas fa-chevron-down fs-8 transition-transform ${openSection === 'spaces' ? 'rotate-180 text-primary' : ''}`}></i>
                </button>
              </div>

              {openSection === 'spaces' && (
                <div className="accordion-collapse show">
                  <div className="accordion-body py-2 px-3 bg-light rounded-2 mb-2">
                    <ul className="list-unstyled mb-0 ms-2">
                      <li className="py-1">
                        <Link
                          to="/explore-spaces"
                          onClick={handleLinkClick}
                          className="text-decoration-none text-dark d-flex align-items-center gap-2 fw-semibold"
                        >
                          <i className="fas fa-layer-group text-primary fs-8"></i> All Spaces
                        </Link>
                      </li>
                      {(spacesList.length > 0 ? spacesList : [
                        { id: 1, name: 'Living Room & Glass Partitions' },
                        { id: 2, name: 'Modern Shower Enclosure' }
                      ]).map((sp) => {
                        const isSpaceActive = location.pathname.startsWith('/explore-spaces') && String(sp.id) === String(currentSpaceParam);
                        return (
                          <li className="py-1" key={sp.id}>
                            <Link
                              to={`/explore-spaces?spaceId=${encodeURIComponent(sp.id)}`}
                              onClick={handleLinkClick}
                              className={`text-decoration-none d-flex align-items-center justify-content-between py-1 px-2 rounded-2 ${
                                isSpaceActive ? 'text-primary fw-bold bg-white border shadow-xs' : 'text-dark'
                              }`}
                            >
                              <div className="d-flex align-items-center gap-2">
                                <i className={`fas fa-chevron-right fs-8 ${isSpaceActive ? 'text-primary' : 'text-muted'}`}></i>
                                <span>{sp.name || sp.title}</span>
                              </div>
                              {isSpaceActive && <span className="badge bg-primary rounded-pill px-2 py-1" style={{ fontSize: '0.65rem' }}>Selected</span>}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="border-bottom">
              <Link
                to="/videos"
                onClick={handleLinkClick}
                className="d-flex align-items-center drawer-direct-link"
              >
                <i className="fas fa-play-circle me-3 text-primary drawer-nav-icon"></i> Videos
              </Link>
            </div>

            <div className="accordion-item border-bottom">
              <h2 className="accordion-header">
                <button
                  className={`accordion-button py-3 fw-bold text-dark ${openSection === 'contact' ? '' : 'collapsed'}`}
                  type="button"
                  onClick={() => toggleSection('contact')}
                  aria-expanded={openSection === 'contact'}
                >
                  <i className="fas fa-headset me-3 text-primary drawer-nav-icon"></i> Contact Us
                </button>
              </h2>
              {openSection === 'contact' && (
                <div className="accordion-collapse show">
                  <div className="accordion-body py-2 px-3 bg-light rounded-2 mb-2">
                    <ul className="list-unstyled mb-0 ms-2">
                      <li className="py-1">
                        <Link to="/about#team-sec" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Our Team
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/about#locations-sec" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Our Presence
                        </Link>
                      </li>
                      <li className="py-1">
                        <Link to="/#contact-sec" onClick={handleLinkClick} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                          <i className="fas fa-chevron-right text-muted fs-8"></i> Quick Enquiry Form
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="mt-4 p-3 bg-light rounded-3 border">
            <h6 className="fw-bold mb-2 small text-uppercase">Direct Assistance</h6>
            <div className="d-flex align-items-center gap-2 mb-2 small">
              <i className="fas fa-phone text-primary"></i>
              <a href="tel:+919063090009" className="text-dark text-decoration-none fw-semibold">
                +91 90630 90009
              </a>
            </div>
            <div className="d-flex align-items-center gap-2 mb-3 small">
              <i className="far fa-envelope text-primary"></i>
              <a href="mailto:customercare@taiton.in" className="text-dark text-decoration-none">
                customercare@taiton.in
              </a>
            </div>
            <a
              href="https://wa.me/919063090009"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm w-100 rounded-pill fw-semibold whatsapp-btn py-2"
            >
              <i className="fab fa-whatsapp me-2 fs-6"></i> Chat on WhatsApp
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
