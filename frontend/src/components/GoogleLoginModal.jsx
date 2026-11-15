import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG } from '../config/appConfig';

export default function GoogleLoginModal() {
  const { isLoginModalOpen, closeLoginModal, handleGoogleCredentialResponse } = useAuth();
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!isLoginModalOpen) return;

    const clientId = APP_CONFIG.googleClientId;

    const renderBtn = () => {
      if (typeof window !== 'undefined' && window.google?.accounts?.id && buttonRef.current) {
        buttonRef.current.innerHTML = '';
        if (clientId) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleGoogleCredentialResponse,
          });
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: 'outline',
            size: 'large',
            type: 'standard',
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
            width: 280,
          });
        }
      }
    };

    renderBtn();
    const t = setTimeout(renderBtn, 300);
    return () => clearTimeout(t);
  }, [isLoginModalOpen, handleGoogleCredentialResponse]);

  if (!isLoginModalOpen) return null;

  return (
    <div
      className="modal-backdrop-custom d-flex align-items-center justify-content-center position-fixed top-0 start-0 w-100 h-100"
      style={{
        backgroundColor: 'rgba(11, 31, 58, 0.65)',
        zIndex: 9999,
        backdropFilter: 'blur(4px)',
      }}
      onClick={closeLoginModal}
    >
      <div
        className="bg-white rounded-4 shadow-xl p-4 p-md-5 text-center position-relative"
        style={{ maxWidth: '440px', width: '90%', border: '1px solid #e2e8f0' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-3"
          aria-label="Close"
          onClick={closeLoginModal}
        ></button>

        <div className="mb-4">
          <img
            src="/Taiton/Taiton Logo without Tagline.png"
            alt="TAITON"
            style={{ height: '42px', objectFit: 'contain' }}
            className="mb-3"
          />
          <h4
            className="fw-bold mb-1"
            style={{ fontFamily: 'var(--taiton-font-heading)', color: '#002b5c' }}
          >
            Welcome to TAITON
          </h4>
          <p className="text-muted small mb-0">
            Continue with your Google account to access your Cart, Wishlist, Recently Viewed items, and Profile.
          </p>
        </div>

        <div className="d-flex flex-column align-items-center justify-content-center py-2">
          <div ref={buttonRef} id="google-signin-button-container" className="my-2"></div>

          {!APP_CONFIG.googleClientId && (
            <div className="alert alert-info py-2 px-3 small mt-3 text-start w-100 rounded-3">
              <i className="fas fa-info-circle me-1 text-primary"></i>
              <strong>Note:</strong> Set <code>VITE_GOOGLE_CLIENT_ID</code> in <code>web-ui/.env</code> to connect your Google Cloud Console Client ID.
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-top text-center text-muted small">
          <i className="fas fa-shield-alt text-success me-1"></i> Automatic secure signup &amp; login
        </div>
      </div>
    </div>
  );
}

