import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="taiton-footer">
      <div className="taiton-layout-container">
        <div className="row g-4 justify-content-between">
          
          <div className="col-12 col-md-6 col-lg-3 taiton-footer-col pe-lg-3">
            <div className="mb-3">
              <Link to="/" className="d-inline-block text-decoration-none">
                <img
                  src="/Taiton/Taiton Logo without Tagline - White.png"
                  alt="TAITON Architectural Hardware"
                  className="footer-logo-img"
                />
              </Link>
            </div>
            <p className="taiton-footer-text footer-mission-text mb-4">
              Global Leader in architectural hardware and glass solutions, delivering innovation, quality, and excellence worldwide.
            </p>
            <div className="app-downloads">
              <h6 className="footer-app-title mb-3">Experience on Mobile App</h6>
              <div className="footer-app-btn-group">
                <a href="#playstore" className="app-download-btn" aria-label="Get it on Google Play">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.55.45-1 1-1h.22l10.26 8.5-10.26 8.5H4c-.55 0-1-.45-1-1zm12.5-8.5L20.25 9c.68-.4 1.25.04 1.25.75v4.5c0 .71-.57 1.15-1.25.75L15.5 12z" />
                  </svg>
                  <div>
                    <div className="app-btn-sub">GET IT ON</div>
                    <div className="app-btn-title">Google Play</div>
                  </div>
                </a>

                <a href="#appstore" className="app-download-btn" aria-label="Download on the App Store">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.8 1.11-1.92.99-3.04-.96.04-2.12.64-2.81 1.44-.61.71-1.15 1.85-.99 2.95 1.07.08 2.15-.55 2.81-1.35z" />
                  </svg>
                  <div>
                    <div className="app-btn-sub">Download on the</div>
                    <div className="app-btn-title">App Store</div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3 taiton-footer-col">
            <h6 className="taiton-footer-title">CONTACT US</h6>
            <ul className="list-unstyled mb-0 d-flex flex-column gap-3 footer-contact-list">
              <li className="d-flex align-items-center gap-3">
                <i className="fas fa-phone footer-contact-icon"></i>
                <span className="taiton-footer-text">
                  <a href="tel:+919063090009" className="text-white text-decoration-none hover-cyan fw-semibold">+91 90630 90009</a><br />
                  <a href="tel:+919063090009" className="text-white text-decoration-none hover-cyan fw-semibold">+91 90630 90009</a>
                </span>
              </li>
              <li className="d-flex align-items-start gap-3">
                <i className="far fa-envelope mt-1 footer-contact-icon"></i>
                <div className="taiton-footer-text">
                  <a href="mailto:customercare@taiton.in" className="text-white text-decoration-none hover-cyan">customercare@taiton.in</a><br />
                  <a href="mailto:support@taiton.in" className="text-white text-decoration-none hover-cyan">support@taiton.in</a>
                </div>
              </li>
              <li className="d-flex align-items-center gap-3">
                <i className="fas fa-globe footer-contact-icon"></i>
                <a href="https://www.taiton.in" target="_blank" rel="noopener noreferrer" className="text-white text-decoration-none hover-cyan taiton-footer-text">
                  www.taiton.in
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-2 mt-4">
              <a href="#linkedin" className="taiton-social-icon" aria-label="LinkedIn">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="#instagram" className="taiton-social-icon" aria-label="Instagram">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#facebook" className="taiton-social-icon" aria-label="Facebook">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#twitter" className="taiton-social-icon" aria-label="X (Twitter)">
                <i className="fab fa-x-twitter"></i>
              </a>
              <a href="#youtube" className="taiton-social-icon" aria-label="YouTube">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3 taiton-footer-col">
            <h6 className="taiton-footer-title">HEAD OFFICE</h6>
            <div className="d-flex align-items-start gap-3 mb-4 footer-address-block">
              <i className="fas fa-map-marker-alt text-white-50 mt-1 flex-shrink-0 fs-5"></i>
              <div>
                <div className="footer-company-name mb-1">TAITON Architectural Hardware Pvt. Ltd.</div>
                <div className="taiton-footer-text">
                  #8-3-677/21, Sri Krishna Devaraya Nagar, Yellareddyguda, Hyderabad - 500073
                </div>
              </div>
            </div>

            <div className="mb-3">
              <Link to="/about#locations-sec" className="taiton-branches-btn">
                <span>VIEW ALL BRANCHES</span> <i className="fas fa-arrow-right"></i>
              </Link>
            </div>
          </div>

          <div className="col-12 col-md-6 col-lg-3 taiton-footer-col ps-lg-2">
            <h6 className="taiton-footer-title">OUR LOCATION</h6>

            <div className="map-container position-relative rounded-3 overflow-hidden border shadow-sm" style={{ height: '170px' }}>
              <div className="footer-map-bg h-100">
                <div className="position-absolute top-50 start-50 translate-middle text-center" style={{ width: '90%' }}>
                  <i className="fas fa-map-marker-alt text-danger fs-2 footer-map-pin"></i>
                  <div className="bg-white text-dark fw-bold rounded-2 px-2 py-1 shadow-sm mt-1 small" style={{ fontSize: '0.68rem', lineHeight: '1.2' }}>
                    TAITON Architectural Hardware Pvt. Ltd.
                  </div>
                </div>
                
                <div className="position-absolute top-0 end-0 m-2">
                  <a
                    href="https://maps.google.com/?q=TAITON+Architectural+Hardware+Hyderabad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-white btn-sm shadow-sm p-1 rounded bg-white text-dark border d-flex align-items-center justify-content-center"
                    style={{ width: '26px', height: '26px', fontSize: '0.75rem' }}
                    aria-label="Expand in Google Maps"
                  >
                    <i className="fas fa-expand-alt"></i>
                  </a>
                </div>

                <div className="position-absolute bottom-0 end-0 m-2 d-flex flex-column gap-1">
                  <span className="badge bg-white text-dark border p-1 shadow-sm text-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem', lineHeight: '14px', cursor: 'pointer' }}>+</span>
                  <span className="badge bg-white text-dark border p-1 shadow-sm text-center" style={{ width: '22px', height: '22px', fontSize: '0.75rem', lineHeight: '14px', cursor: 'pointer' }}>-</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <div className="taiton-layout-container taiton-footer-bottom footer-bottom-border">
        <div className="row align-items-center gy-2 footer-bottom-row">
          <div className="col-12 col-md-6 text-center text-md-start taiton-footer-text">
            © 2026 TAITON Architectural Hardware Pvt. Ltd. All Rights Reserved.
          </div>
          <div className="col-12 col-md-6 text-center text-md-end">
            <ul className="list-inline mb-0">
              <li className="list-inline-item">
                <a href="#privacy" className="text-white text-decoration-none hover-cyan taiton-footer-text">
                  Privacy Policy
                </a>
              </li>
              <li className="list-inline-item mx-2 text-white-50">|</li>
              <li className="list-inline-item">
                <a href="#terms" className="text-white text-decoration-none hover-cyan taiton-footer-text">
                  Terms &amp; Conditions
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
