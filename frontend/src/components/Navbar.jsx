import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { fetchCategories } from '../api/catalogApi';
import { useAuth } from '../context/AuthContext';

export default function Navbar({
  isMobileNavOpen = false,
  onToggleMobileNav,
  onOpenMobileNav,
  onCloseMobileNav: _onCloseMobileNav,
  onOpenSearch,
}) {
  const location = useLocation();
  const { user, isAuthenticated, openLoginModal, logout, cartCount } = useAuth();
  const [categoriesList, setCategoriesList] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeDrillCat, setActiveDrillCat] = useState('');
  const [activeDrillSubcat, setActiveDrillSubcat] = useState('');

  useEffect(() => {
    let mounted = true;
    fetchCategories().then((cats) => {
      if (mounted && Array.isArray(cats) && cats.length > 0) {
        setCategoriesList(cats);
        if (cats[0]?.id) setActiveDrillCat(cats[0].id);
        if (cats[0]?.subcategories?.[0]?.id) setActiveDrillSubcat(cats[0].subcategories[0].id);
      }
    });
    return () => { mounted = false; };
  }, []);

  const closeTimerRef = useRef(null);
  const openTimerRef = useRef(null);

  const handleDropdownEnter = (menuKey) => {
    if (window.innerWidth < 992) return;
    clearTimeout(closeTimerRef.current);
    clearTimeout(openTimerRef.current);
    if (activeDropdown && activeDropdown !== menuKey) {
      openTimerRef.current = setTimeout(() => {
        setActiveDropdown(menuKey);
      }, 70);
    } else {
      setActiveDropdown(menuKey);
    }
  };

  const handleDropdownLeave = () => {
    if (window.innerWidth < 992) return;
    clearTimeout(openTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 250);
  };

  const handleCategoryHover = (cat) => {
    setActiveDrillCat(cat.id);
    if (cat.subcategories && cat.subcategories.length > 0) {
      setActiveDrillSubcat(cat.subcategories[0].id);
    }
  };

  const handleSubcategoryHover = (subcatId) => {
    setActiveDrillSubcat(subcatId);
  };

  const closeDropdownInstantly = () => {
    clearTimeout(closeTimerRef.current);
    clearTimeout(openTimerRef.current);
    setActiveDropdown(null);
  };

  return (
    <>
      <div className="mobile-header d-lg-none bg-white py-2">
        <div className="taiton-layout-container">
          <div className="row align-items-center justify-content-between mb-2">
            <div className="col-auto">
              <Link to="/" className="d-flex align-items-center text-decoration-none">
                <img
                  src="/assets/images/taiton-logo.png"
                  onError={(e) => { e.target.src = '/Taiton/Taiton Logo without Tagline.png'; }}
                  alt="TAITON Architectural Hardware"
                  className="mobile-logo-img"
                />
              </Link>
            </div>

            <div className="col-auto d-flex align-items-center gap-2">
              <Link
                to="/profile?tab=cart"
                className="btn btn-light rounded-circle position-relative p-0 d-flex align-items-center justify-content-center mobile-header-icon-btn mobile-cart-btn shadow-sm"
                title="Cart Items"
                aria-label="Cart"
              >
                <i className="fas fa-shopping-cart fs-6"></i>
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-warning text-dark mobile-cart-badge">
                  {cartCount}
                </span>
              </Link>

              {isAuthenticated && user ? (
                <div className="dropdown">
                  <button
                    className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center mobile-header-icon-btn mobile-profile-btn shadow-sm overflow-hidden"
                    type="button"
                    id="mobileProfileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    aria-label="User Profile"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || 'User'}
                        className="w-100 h-100 object-fit-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <i className="fas fa-user fs-6"></i>
                    )}
                  </button>
                  <ul
                    className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2 mobile-profile-menu py-2"
                    aria-labelledby="mobileProfileDropdown"
                    style={{ minWidth: '200px' }}
                  >
                    <li className="px-3 py-2 border-bottom bg-light">
                      <div className="fw-bold text-dark text-truncate">{user.name}</div>
                      <div className="text-muted small text-truncate">{user.email}</div>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2 fw-semibold" to="/profile?tab=profile">
                        <i className="fas fa-user-circle me-2 text-primary"></i> My Profile
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item py-2 fw-semibold" to="/profile?tab=wishlist">
                        <i className="fas fa-heart me-2 text-danger"></i> Wishlist
                      </Link>
                    </li>
                    <li>
                      <hr className="dropdown-divider my-1" />
                    </li>
                    <li>
                      <button
                        type="button"
                        className="dropdown-item py-2 text-danger fw-semibold border-0 bg-transparent w-100 text-start"
                        onClick={logout}
                      >
                        <i className="fas fa-sign-out-alt me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-light rounded-circle p-0 d-flex align-items-center justify-content-center mobile-header-icon-btn shadow-sm"
                  onClick={openLoginModal}
                  title="Sign In with Google"
                  aria-label="Sign In with Google"
                >
                  <i className="fas fa-user fs-6 text-primary"></i>
                </button>
              )}
            </div>
          </div>

          <div className="row align-items-center g-2 flex-nowrap">
            <div className="col mobile-search-col">
              <div
                className="mobile-search-trigger d-flex align-items-center px-3 py-2 rounded-pill shadow-sm w-100"
                id="mobileSearchTrigger"
                onClick={onOpenSearch}
                role="button"
                tabIndex={0}
              >
                <i className="fas fa-search text-muted me-2 search-icon-sm"></i>
                <span className="text-secondary small text-truncate search-placeholder-text">
                  Search products, models, categories...
                </span>
              </div>
            </div>

            <div className="col-auto">
              <button
                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center p-0 shadow-sm mobile-hamburger-btn"
                id="mobileHamburgerBtn"
                type="button"
                onClick={onToggleMobileNav || onOpenMobileNav}
                aria-label={isMobileNavOpen ? 'Close Navigation Drawer' : 'Open Navigation Drawer'}
                aria-expanded={isMobileNavOpen}
              >
                <i className={`fas ${isMobileNavOpen ? 'fa-times' : 'fa-bars'} fs-5 text-white`}></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-wrapper taiton-nav-bar text-white py-0 d-none d-lg-block">
        <div className="taiton-layout-container">
          <nav className="navbar navbar-expand-lg navbar-dark p-0">
            <div className="collapse navbar-collapse show" id="taitonNavbarContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-lg-center">

                <li
                  className={`nav-item dropdown position-static ${activeDropdown === 'company' ? 'show' : ''}`}
                  onMouseEnter={() => handleDropdownEnter('company')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <a
                    className="nav-link dropdown-toggle py-3 text-white fw-semibold px-3"
                    href="#"
                    id="companyDropdown"
                    role="button"
                    aria-expanded={activeDropdown === 'company'}
                  >
                    Company
                  </a>
                  <div
                    className={`dropdown-menu w-100 border-0 shadow-lg mt-0 py-4 px-3 px-lg-5 ${activeDropdown === 'company' ? 'show' : ''
                      }`}
                    aria-labelledby="companyDropdown"
                    onMouseEnter={() => handleDropdownEnter('company')}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="taiton-layout-container">
                      <div className="row g-4">
                        <div className="col-12 col-sm-6 col-lg-3">
                          <ul className="list-unstyled mb-0">
                            <li className="py-1">
                              <Link to="/about" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                About Us
                              </Link>
                            </li>
                            <li className="py-1">
                              <Link to="/experience-center" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                Experience Center
                              </Link>
                            </li>
                            <li className="py-1">
                              <Link to="/operations" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                Operations &amp; Logistics
                              </Link>
                            </li>
                            <li className="py-1">
                              <Link to="/awards" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                Awards &amp; Achievements
                              </Link>
                            </li>
                            <li className="py-1">
                              <Link to="/exhibitions-events" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                Exhibitions &amp; Events
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-3">
                          <ul className="list-unstyled mb-0">
                            <li className="py-1">
                              <Link to="/blogs" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                Blogs
                              </Link>
                            </li>
                            <li className="py-1">
                              <Link to="/careers" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                Careers
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

                <li
                  className={`nav-item dropdown position-static ${activeDropdown === 'products' ? 'show' : ''}`}
                  onMouseEnter={() => handleDropdownEnter('products')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link
                    className="nav-link dropdown-toggle py-3 text-white fw-semibold px-3"
                    to="/products"
                    id="productsDropdown"
                    role="button"
                    aria-expanded={activeDropdown === 'products'}
                  >
                    Products
                  </Link>
                  <div
                    className={`dropdown-menu w-100 border-0 shadow-lg mt-0 py-4 px-3 px-lg-5 ${activeDropdown === 'products' ? 'show' : ''
                      }`}
                    aria-labelledby="productsDropdown"
                    onMouseEnter={() => handleDropdownEnter('products')}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="taiton-layout-container">
                      <div className="row g-4 products-drilldown-row justify-content-start">

                        <div className="col-auto border-end pe-4 drilldown-col">
                          <ul className="list-unstyled mb-0 drilldown-list" id="drilldownCategoriesList">
                            {categoriesList.map((cat) => {
                              const hasSubcats = Array.isArray(cat.subcategories) && cat.subcategories.length > 0;
                              const targetCatUrl = hasSubcats
                                ? `/product-category?catId=${cat.id}`
                                : (cat.url || `/product-list?catId=${cat.id}`);

                              return (
                                <li key={cat.id} className="py-1">
                                  <Link
                                    to={targetCatUrl}
                                    className={`drilldown-link ${String(activeDrillCat) === String(cat.id) ? 'active' : ''}`}
                                    data-drill-cat={cat.id}
                                    onMouseEnter={() => handleCategoryHover(cat)}
                                    onClick={() => handleCategoryHover(cat)}
                                  >
                                    <span>{cat.name || cat.title}</span>
                                    <i className="fas fa-chevron-right"></i>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        <div className="col-auto border-end pe-4 drilldown-col">
                          {categoriesList.map((cat) => (
                            <div
                              key={cat.id}
                              className={`drilldown-panel ${String(activeDrillCat) === String(cat.id) ? 'active' : ''}`}
                              id={`drill-subcat-${cat.id}`}
                              data-parent-cat={cat.id}
                            >
                              <ul className="list-unstyled mb-0 drilldown-list">
                                {(cat.subcategories || []).map((subcat) => {
                                  const hasItems = Array.isArray(subcat.items) && subcat.items.length > 0;
                                  const targetSubcatUrl = hasItems
                                    ? `/product-category?catId=${cat.id}&subId=${subcat.id}`
                                    : `/product-list?catId=${subcat.id}`;

                                  return (
                                    <li key={subcat.id} className="py-1">
                                      <Link
                                        to={targetSubcatUrl}
                                        className={`drilldown-link ${String(activeDrillSubcat) === String(subcat.id) ? 'active' : ''}`}
                                        data-drill-subcat={subcat.id}
                                        onMouseEnter={() => handleSubcategoryHover(subcat.id)}
                                        onClick={() => handleSubcategoryHover(subcat.id)}
                                      >
                                        <span>{subcat.name || subcat.title}</span>
                                        <i className="fas fa-chevron-right"></i>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>

                        <div className="col-auto pe-4 drilldown-col">
                          {categoriesList.flatMap((cat) => cat.subcategories || []).map((subcat) => (
                            <div
                              key={subcat.id}
                              className={`drilldown-panel ${String(activeDrillSubcat) === String(subcat.id) ? 'active' : ''}`}
                              id={`drill-subsubcat-${subcat.id}`}
                              data-parent-subcat={subcat.id}
                            >
                              <ul className="list-unstyled mb-0 drilldown-list">
                                {(subcat.items || []).map((item, itemIdx) => {
                                  const itemName = typeof item === 'object' ? (item.name || item.title || item.code) : item;
                                  const itemUrl = typeof item === 'object' && item.url
                                    ? item.url
                                    : (typeof item === 'object' && item.id
                                      ? `/product-list?catId=${item.id}`
                                      : `/product-list?search=${encodeURIComponent(itemName)}`);
                                  return (
                                    <li key={itemIdx} className="py-1">
                                      <Link
                                        to={itemUrl}
                                        className="drilldown-link"
                                        onClick={closeDropdownInstantly}
                                      >
                                        <span>{itemName}</span>
                                      </Link>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>
                          ))}
                        </div>

                      </div>
                    </div>
                  </div>
                </li>

                <li className="nav-item">
                  <Link
                    to="/catalogues"
                    className={`nav-link py-3 text-white fw-semibold px-3 ${location.pathname === '/catalogues' ? 'active' : ''
                      }`}
                  >
                    Catalogues
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/explore-spaces"
                    className={`nav-link py-3 text-white fw-semibold px-3 ${location.pathname.startsWith('/explore-spaces') ? 'active' : ''
                      }`}
                  >
                    Explore Spaces
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    to="/videos"
                    className="nav-link py-3 text-white fw-semibold px-3"
                  >
                    Videos
                  </Link>
                </li>

                <li
                  className={`nav-item dropdown position-static ${activeDropdown === 'contact' ? 'show' : ''}`}
                  onMouseEnter={() => handleDropdownEnter('contact')}
                  onMouseLeave={handleDropdownLeave}
                >
                  <Link
                    className="nav-link dropdown-toggle py-3 text-white fw-semibold px-3"
                    to="/contact-us"
                    id="contactDropdown"
                    role="button"
                    aria-expanded={activeDropdown === 'contact'}
                  >
                    Contact us
                  </Link>
                  <div
                    className={`dropdown-menu w-100 border-0 shadow-lg mt-0 py-4 px-3 px-lg-5 ${activeDropdown === 'contact' ? 'show' : ''
                      }`}
                    aria-labelledby="contactDropdown"
                    onMouseEnter={() => handleDropdownEnter('contact')}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <div className="taiton-layout-container">
                      <div className="row g-4">
                        <div className="col-12 col-sm-6 col-lg-3">
                          <ul className="list-unstyled mb-0">
                            <li className="py-1">
                              <Link to="/our-team" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                Our Team
                              </Link>
                            </li>

                            <li className="py-1">
                              <Link to="/contact-us" onClick={closeDropdownInstantly} className="text-decoration-none text-dark d-flex align-items-center gap-2">
                                Contact Us Page
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="col-12 col-sm-6 col-lg-4">
                          <h6 className="text-primary fw-bold text-uppercase mb-3 mega-menu-heading">
                            Inquiries & Consultations
                          </h6>
                          <ul className="list-unstyled mb-0">
                            <li className="mb-2">
                              <Link to="/contact-us" onClick={closeDropdownInstantly} className="text-decoration-none text-dark hover-blue">
                                <i className="fas fa-paper-plane me-2 text-primary"></i> Send Direct Project Inquiry
                              </Link>
                            </li>
                            <li className="mb-2">
                              <a href="mailto:customercare@taiton.in" className="text-decoration-none text-dark hover-blue">
                                <i className="fas fa-envelope me-2 text-primary"></i> customercare@taiton.in
                              </a>
                            </li>
                            <li className="mb-2">
                              <a href="tel:+919063090009" className="text-decoration-none text-dark hover-blue">
                                <i className="fas fa-phone me-2 text-primary"></i> +91 90630 90009
                              </a>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>

              </ul>

              <div className="d-none d-lg-flex align-items-center py-2 py-lg-0 m-0 border-0 ms-auto gap-3">
                <Link
                  to="/products"
                  className="btn rounded-pill px-3 py-1 d-flex align-items-center gap-2 text-white border border-light nav-new-arrivals-btn"
                >
                  <span className="rounded-circle d-inline-block nav-badge-dot"></span>
                  <span className="fw-semibold">New Arrivals</span>
                </Link>

                <div className="d-flex align-items-center gap-3">
                  <button
                    className="btn btn-link text-white p-1 position-relative text-decoration-none"
                    title="Notifications"
                    type="button"
                    aria-label="Notifications"
                  >
                    <i className="fas fa-bell fs-5"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger nav-notify-badge">
                      2
                    </span>
                  </button>
                  <Link
                    to="/profile?tab=cart"
                    className="btn btn-link text-white p-1 pe-0 position-relative text-decoration-none"
                    title="Shopping Cart"
                    aria-label="Shopping Cart"
                  >
                    <i className="fas fa-shopping-cart fs-5"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-circle bg-warning text-dark nav-cart-badge">
                      {cartCount}
                    </span>
                  </Link>
                </div>
              </div>

            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
