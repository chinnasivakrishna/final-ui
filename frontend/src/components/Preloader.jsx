import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Preloader() {
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Trigger loader on route transition
    setLoading(true);
    setFadeOut(false);

    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 280);

    const hideTimer = setTimeout(() => {
      setLoading(false);
    }, 450);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [location.pathname]);

  if (!loading) return null;

  return (
    <div
      className={`taiton-pre-main-loader ${fadeOut ? 'fade-out' : ''}`}
      aria-hidden="true"
    >
      <div className="preloader-content-box">
        <div className="preloader-brand-logo mb-3">
          <img
            src="/Taiton/Taiton Logo without Tagline.png"
            alt="TAITON"
            className="preloader-logo-img"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
        <div className="preloader-spinner-wrap">
          <div className="preloader-ring"></div>
        </div>
        <div className="preloader-loading-text mt-3">
          <span>Architectural Hardware</span>
        </div>
      </div>
    </div>
  );
}

