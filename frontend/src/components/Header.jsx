import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Header({ onOpenSearch }) {
  const navigate = useNavigate();
  const {
    user,
    isAuthenticated,
    openLoginModal,
    logout,
    wishlistCount,
  } = useAuth();

  const handleSearchClick = () => {
    if (onOpenSearch) {
      onOpenSearch();
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      const q = e.target.value.trim();
      if (q) {
        navigate(`/products?search=${encodeURIComponent(q)}`);
      }
    }
  };

  return (
    <div className="taiton-top-bar d-none d-lg-block">
      <div className="taiton-layout-container py-2">
        <div className="row align-items-center gy-2">

          <div className="col-6 col-lg-3 d-flex align-items-center">
            <Link to="/" className="d-flex align-items-center text-decoration-none">
              <div className="brand-logo-wrapper d-flex align-items-center">
                <img
                  src="/Taiton/Taiton Logo without Tagline.png"
                  alt="TAITON Architectural Hardware"
                  className="header-logo-img"
                />
              </div>
            </Link>
          </div>

          <div className="col-12 col-lg-5 order-3 order-lg-2">
            <div className="search-box">
              <input
                type="text"
                id="global-search"
                className="form-control"
                placeholder="Search products, models, categories..."
                aria-label="Search"
                onClick={handleSearchClick}
                onFocus={handleSearchClick}
                onKeyDown={handleSearchKeyDown}
                readOnly
              />
              <button
                className="search-btn"
                type="button"
                aria-label="Search"
                onClick={handleSearchClick}
              >
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>

          <div className="col-6 col-lg-4 order-2 order-lg-3 d-flex align-items-center justify-content-end gap-3">

            <div className="header-partner-ticker d-none d-lg-flex align-items-center">
              <div className="ticker-content-mask">
                <div className="ticker-track">
                  <div className="ticker-group">
                    <div className="ticker-item">
                      <div className="ticker-badge-group">
                        <span className="ticker-live-dot"></span>TAITON GROUP
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <svg className="ticker-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="8" height="18" rx="1" />
                          <rect x="13" y="3" width="8" height="18" rx="1" />
                        </svg>
                        <span className="ticker-badge-title">TRILLIONS</span>
                      </div>
                      <div className="ticker-badge-subtitle">ALUMINIUM DOORS & WINDOWS</div>
                    </div>

                    <div className="ticker-item">
                      <div className="ticker-badge-group">
                        <span className="ticker-live-dot"></span>TAITON GROUP
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <svg className="ticker-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="8" height="18" rx="1" />
                          <rect x="13" y="3" width="8" height="18" rx="1" />
                        </svg>
                        <span className="ticker-badge-title">TAITON</span>
                      </div>
                      <div className="ticker-badge-subtitle">ARCHITECTURAL HARDWARE</div>
                    </div>

                    <div className="ticker-item">
                      <div className="ticker-badge-group">
                        <span className="ticker-live-dot"></span>TAITON GROUP
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <svg className="ticker-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="8" height="18" rx="1" />
                          <rect x="13" y="3" width="8" height="18" rx="1" />
                        </svg>
                        <span className="ticker-badge-title">TAVIC</span>
                      </div>
                      <div className="ticker-badge-subtitle">OFFICE PARTITION SYSTEMS</div>
                    </div>
                  </div>

                  <div className="ticker-group" aria-hidden="true">
                    <div className="ticker-item">
                      <div className="ticker-badge-group">
                        <span className="ticker-live-dot"></span>TAITON GROUP
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <svg className="ticker-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="8" height="18" rx="1" />
                          <rect x="13" y="3" width="8" height="18" rx="1" />
                        </svg>
                        <span className="ticker-badge-title">TRILLIONS</span>
                      </div>
                      <div className="ticker-badge-subtitle">ALUMINIUM DOORS & WINDOWS</div>
                    </div>

                    <div className="ticker-item">
                      <div className="ticker-badge-group">
                        <span className="ticker-live-dot"></span>TAITON GROUP
                      </div>
                      <div className="d-flex align-items-center gap-1">
                        <svg className="ticker-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="8" height="18" rx="1" />
                          <rect x="13" y="3" width="8" height="18" rx="1" />
                        </svg>
                        <span className="ticker-badge-title">TAITON</span>
                      </div>
                      <div className="ticker-badge-subtitle">ARCHITECTURAL HARDWARE</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isAuthenticated && user ? (
              <div className="dropdown">
                <button
                  className="btn rounded-pill border d-flex align-items-center gap-2 py-1 px-3 shadow-sm user-profile-btn"
                  type="button"
                  id="userProfileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <div className="rounded-circle text-white d-flex align-items-center justify-content-center overflow-hidden user-avatar-circle" style={{ width: '32px', height: '32px', backgroundColor: '#002b5c' }}>
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
                  </div>
                  <div className="text-start d-none d-md-block user-profile-meta">
                    <div className="user-profile-name fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                      {user.name || user.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="user-profile-role text-muted small" style={{ fontSize: '0.75rem' }}>
                      {user.mobile}
                    </div>
                  </div>
                  <i className="fas fa-chevron-down text-muted ms-1 dropdown-chevron-icon" style={{ fontSize: '0.75rem' }}></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 py-2" aria-labelledby="userProfileDropdown" style={{ minWidth: '220px' }}>
                  <li className="px-3 py-2 border-bottom mb-1 bg-light">
                    <div className="fw-bold text-dark text-truncate">{user.name || 'Member'}</div>
                    <div className="text-muted small text-truncate">{user.email}</div>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center" to="/profile?tab=profile">
                      <i className="far fa-user me-2 text-dark" style={{ width: '18px' }}></i> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link className="dropdown-item py-2 d-flex align-items-center justify-content-between" to="/profile?tab=wishlist">
                      <span className="d-flex align-items-center">
                        <i className="far fa-heart me-2 text-dark" style={{ width: '18px' }}></i> Wishlist
                      </span>
                      <span className="badge bg-light text-dark border rounded-pill">{wishlistCount}</span>
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider my-1" /></li>
                  <li>
                    <button
                      type="button"
                      className="dropdown-item py-2 text-dark border-0 bg-transparent w-100 text-start d-flex align-items-center"
                      onClick={logout}
                    >
                      <i className="fas fa-sign-out-alt me-2 text-muted" style={{ width: '18px' }}></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <button
                type="button"
                className="btn rounded-pill border d-flex align-items-center gap-2 py-1 px-3 shadow-sm user-profile-btn bg-white text-dark"
                onClick={openLoginModal}
                title="Continue with Google"
                style={{ fontSize: '0.78rem' }}
              >
                <svg width="16" height="16" viewBox="0 0 48 48" className="flex-shrink-0">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.55 10.79l7.98-6.2z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span className="fw-semibold small d-none d-md-inline" style={{ fontSize: '1.0rem' }}>Sign IN</span>
                <span className="fw-semibold small d-md-none">Sign In</span>
                <span className="fw-semibold d-md-none" style={{ fontSize: '0.75rem' }}>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}
