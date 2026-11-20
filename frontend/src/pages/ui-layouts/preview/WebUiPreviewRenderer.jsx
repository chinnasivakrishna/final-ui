import React, { useState, useEffect, useRef } from 'react';
import './PreviewStyles.css';

/**
 * Hero Section Preview
 */
function HeroSectionPreview({ config, activeSlideIdx = 0, onSlideChange }) {
  const layoutId = config?.layoutId || 'large-premium-banner';
  const data = config?.data || config || {};

  const slides = Array.isArray(data.slides) && data.slides.length > 0
    ? data.slides
    : [
        {
          id: 'slide-1',
          backgroundImage: data.backgroundImage || '/Taiton/banners/1.webp',
          videoUrl: data.videoUrl || '',
          posterImage: data.posterImage || '',
          overlayStyle: data.overlayStyle || 'light',
          content: data.content,
          cta: data.cta,
          ctaLinks: data.ctaLinks,
        },
      ];

  const currentIdx = Math.max(0, Math.min(activeSlideIdx, slides.length - 1));
  const activeSlide = slides[currentIdx] || slides[0];
  const slideCount = slides.length;

  const isVideo = layoutId === 'full-page-video';
  const isBanner = layoutId === 'large-premium-banner';

  const content = activeSlide?.content;
  const hasContent = Boolean(content && (content.tag || content.title || content.titleAccent || content.subtitle));

  const cta = activeSlide?.cta;
  const hasCta = Boolean(cta && (cta.label || cta.url));

  const ctaLinks = activeSlide?.ctaLinks;
  const hasCtaLinks = Boolean(Array.isArray(ctaLinks) && ctaLinks.length > 0);

  const hasActions = hasCta || hasCtaLinks;
  const hasAnyContent = hasContent || hasActions;

  const overlayStyle = activeSlide?.overlayStyle || (isVideo ? 'dark' : 'light');
  const isDarkTheme = overlayStyle === 'dark' || (isVideo && overlayStyle !== 'light');

  return (
    <div
      className={`hero-fold-wrapper hero-carousel-wrapper ${isBanner ? 'hero-layout-banner' : ''} ${isVideo ? 'hero-layout-video' : ''} ${!hasAnyContent ? 'hero-variation-clean' : ''}`}
    >
      {/* Media backdrop */}
      <div className="hero-media-backdrop">
        {slides.map((slide, sIdx) => {
          const isActive = sIdx === (currentIdx >= slides.length ? 0 : currentIdx);
          return (
            <div key={slide.id || sIdx} className={`hero-slide-item ${isActive ? 'active' : ''}`}>
              {isVideo ? (
                slide.videoUrl ? (
                  <video
                    className="hero-video-media"
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster={slide.posterImage}
                  >
                    <source src={slide.videoUrl} type="video/mp4" />
                  </video>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100 bg-dark text-white p-5 text-center">
                    <div>
                      <i className="fas fa-video fa-3x mb-3 text-primary"></i>
                      <h5>Video Background Preview</h5>
                      <p className="text-white-50 small">Configure a Video URL to preview video</p>
                    </div>
                  </div>
                )
              ) : (
                <img
                  src={slide.backgroundImage || '/Taiton/banners/1.webp'}
                  alt={`Slide ${sIdx + 1}`}
                  className="hero-banner-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80';
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Overlay gradient */}
      {overlayStyle !== 'none' && (
        <div className={`hero-overlay ${overlayStyle === 'dark' ? 'hero-overlay-dark' : 'hero-overlay-light'}`} />
      )}

      {/* Content & Actions */}
      {hasAnyContent && (
        <div className={`hero-content-area ${isDarkTheme ? 'hero-theme-dark' : ''}`}>
          <div className="taiton-layout-container">
            <div className="row align-items-center">
              <div className="col-12 col-lg-8">
                {content?.tag && <div className="hero-tag mb-3">{content.tag}</div>}

                {(content?.title || content?.titleAccent) && (
                  <h1 className="hero-title mb-3">
                    {content?.title}
                    {content?.title && content?.titleAccent && <br />}
                    {content?.titleAccent && (
                      <span className="hero-title-accent ms-1">{content.titleAccent}</span>
                    )}
                  </h1>
                )}

                {content?.subtitle && <p className="hero-subtitle mb-0">{content.subtitle}</p>}

                {hasActions && (
                  <div className="hero-cta-container mt-4">
                    {hasCta && (
                      <div>
                        <span className="hero-btn-primary">
                          <span>{cta.label}</span>
                          <i className={cta.icon || 'fas fa-arrow-right ms-1'}></i>
                        </span>
                      </div>
                    )}

                    {hasCtaLinks && (
                      <div className="hero-cta-links-row">
                        {ctaLinks.map((link, lIdx) => (
                          <span key={lIdx} className="hero-cta-link-pill">
                            {link.icon && <i className={`${link.icon} me-1`}></i>}
                            <span>{link.label}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide Navigation Dots */}
      {slideCount > 1 && (
        <div className="hero-carousel-dots-wrap">
          <div className="hero-carousel-dots">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                className={`hero-dot ${dotIdx === currentIdx ? 'active' : ''}`}
                onClick={() => onSlideChange && onSlideChange(dotIdx)}
                title={`Go to slide ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

/**
 * Featured Products Preview
 */
function FeaturedProductsPreview({ config }) {
  const title = config?.title || 'Featured Products';
  const items = Array.isArray(config?.items) ? config.items : [];

  return (
    <section className="py-5 bg-white">
      <div className="site-container">
        <div className="mb-4">
          <h3 className="section-main-title mb-0 fw-bold">{title}</h3>
        </div>

        <div className="row g-4">
          {items.map((product, idx) => (
            <div key={product.id || idx} className="col-12 col-sm-6 col-lg-3">
              <div className="product-card h-100 d-flex flex-column">
                <img
                  src={product.image || 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80'}
                  alt={product.title || 'Product'}
                  className="product-card-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="p-3 d-flex flex-column flex-grow-1">
                  <h6 className="fw-bold text-dark mb-2">{product.title}</h6>
                  {product.description && (
                    <p className="text-muted small mb-0 flex-grow-1">{product.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Landmark Projects Preview
 */
function LandmarkProjectsPreview({ config }) {
  const title = config?.title || 'Landmark Projects';
  const knowMoreText = config?.knowMoreText || 'Know More';
  const items = Array.isArray(config?.items) ? config.items : [];

  return (
    <section className="py-5 bg-white border-top">
      <div className="site-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="section-main-title mb-0 fw-bold">{title}</h3>
          {knowMoreText && (
            <span className="text-primary fw-semibold small">
              {knowMoreText} <i className="fas fa-arrow-right ms-1"></i>
            </span>
          )}
        </div>

        <div className="row g-3">
          {items.map((project, idx) => (
            <div key={project.id || idx} className="col-12 col-sm-6 col-md-4">
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100 hover-lift">
                <img
                  src={project.image || 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=400&q=80'}
                  alt={project.title}
                  className="project-card-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&w=400&q=80';
                  }}
                />
                <div className="p-3">
                  <h6 className="fw-bold text-dark mb-1">{project.title}</h6>
                  {project.location && (
                    <div className="text-muted small">
                      <i className="fas fa-map-marker-alt me-1 text-primary"></i> {project.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/**
 * Client Testimonials Preview
 */
function ClientTestimonialsPreview({ config }) {
  const title = config?.title || 'Client Testimonials';
  const knowMoreText = config?.knowMoreText || 'Know More';
  const items = Array.isArray(config?.items) ? config.items : [];

  const leftItem = items[0] || null;
  const centerItem = items[1] || items[0] || null;
  const rightItem = items[2] || items[1] || null;

  return (
    <section className="py-5 bg-white border-top">
      <div className="site-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="section-main-title mb-0 fw-bold">{title}</h3>
          {knowMoreText && (
            <span className="text-primary fw-semibold small">
              {knowMoreText} <i className="fas fa-arrow-right ms-1"></i>
            </span>
          )}
        </div>

        <div className="testimonial-track-bg">
          <div className="d-flex align-items-center justify-content-between h-100 position-relative">
            {leftItem && (
              <div className="testimonial-side-card w-50 me-2 d-none d-md-block">
                <p className="mb-3">{leftItem.quote}</p>
                <div className="d-flex align-items-center justify-content-end gap-2">
                  <span className="fw-bold small">{leftItem.clientName}</span>
                  {leftItem.location && <span className="small text-muted">{leftItem.location}</span>}
                </div>
              </div>
            )}

            {centerItem && (
              <div className="testimonial-center-card text-center mx-auto">
                <p className="mb-4 text-dark">{centerItem.quote}</p>
                <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
                  <div className="text-end">
                    <div className="fw-bold text-dark">{centerItem.clientName}</div>
                    {centerItem.location && (
                      <div className="text-muted small">
                        {centerItem.location} <i className="fas fa-map-marker-alt text-primary"></i>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {rightItem && (
              <div className="testimonial-side-card w-50 ms-2 d-none d-md-block">
                <p className="mb-3">{rightItem.quote}</p>
                <div className="d-flex align-items-center justify-content-end gap-2">
                  <span className="fw-bold small">{rightItem.clientName}</span>
                  {rightItem.location && <span className="small text-muted">{rightItem.location}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Master Preview Renderer for cPanel Live Preview Panel
 */
export function WebUiPreviewRenderer({ componentKey, configuration, activeSlideIdx = 0, onSlideChange }) {
  if (!configuration) {
    return (
      <div className="p-5 text-center text-muted">
        <i className="fas fa-eye fa-3x mb-3 text-secondary"></i>
        <p>No preview data available for this component.</p>
      </div>
    );
  }

  return (
    <div className="web-ui-preview-viewport shadow-sm rounded-3 border">
      {(() => {
        switch (componentKey) {
          case 'heroic':
          case 'hero_section':
            return <HeroSectionPreview config={configuration} activeSlideIdx={activeSlideIdx} onSlideChange={onSlideChange} />;
          case 'featured-products':
          case 'featured_products':
            return <FeaturedProductsPreview config={configuration} />;
          case 'landmark-projects':
          case 'landmark_projects':
            return <LandmarkProjectsPreview config={configuration} />;
          case 'client-testimonials':
          case 'testimonials':
            return <ClientTestimonialsPreview config={configuration} />;
          default:
            return (
              <div className="p-5 text-center text-muted">
                <h5>Preview for {componentKey}</h5>
                <pre className="text-start bg-light p-3 small rounded">{JSON.stringify(configuration, null, 2)}</pre>
              </div>
            );
        }
      })()}
    </div>
  );
}

