import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HERO_LAYOUT_IDS } from '../data/heroData';
import { resolveImageUrl } from '../api/catalogApi';

export default function HeroSection({ heroData, children }) {
  const layoutId = heroData?.layoutId || HERO_LAYOUT_IDS.LARGE_PREMIUM_BANNER;
  const data = heroData?.data || {};

  const slides = Array.isArray(data.slides) ? data.slides : [];

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const slideCount = slides.length;
  const autoplayInterval = data.autoplayInterval || 5000;

  const activeIndex = currentSlideIndex >= slideCount ? 0 : currentSlideIndex;
  const currentSlide = slides[activeIndex] || null;

  const isVideoLayout = layoutId === HERO_LAYOUT_IDS.FULL_PAGE_VIDEO;
  const isBannerLayout = layoutId === HERO_LAYOUT_IDS.LARGE_PREMIUM_BANNER;

  const goToSlide = (idx) => {
    setCurrentSlideIndex(idx);
  };

  useEffect(() => {
    if (slideCount <= 1) return;

    const intervalId = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slideCount);
    }, autoplayInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [slideCount, autoplayInterval]);

  if (slideCount === 0) {
    return children ? <div className="hero-fold-wrapper">{children}</div> : null;
  }

  const content = currentSlide?.content;
  const hasContent = Boolean(content && (content.tag || content.title || content.titleAccent || content.subtitle));

  const cta = currentSlide?.cta;
  const hasCta = Boolean(cta && cta.label && cta.url);

  const ctaLinks = currentSlide?.ctaLinks;
  const hasCtaLinks = Boolean(Array.isArray(ctaLinks) && ctaLinks.length > 0);

  const hasActions = hasCta || hasCtaLinks;
  const hasAnyContent = hasContent || hasActions;

  const defaultOverlay = isVideoLayout ? 'dark' : 'light';
  const overlayStyle = currentSlide?.overlayStyle !== undefined
    ? currentSlide.overlayStyle
    : (hasAnyContent ? defaultOverlay : 'none');

  let overlayClass = 'hero-overlay-none';
  if (overlayStyle === 'light') {
    overlayClass = 'hero-overlay hero-overlay-light';
  } else if (overlayStyle === 'dark') {
    overlayClass = 'hero-overlay hero-overlay-dark';
  }

  const isDarkTheme = overlayStyle === 'dark' || (isVideoLayout && overlayStyle !== 'light');

  return (
    <div
      className={`hero-fold-wrapper hero-carousel-wrapper ${isBannerLayout ? 'hero-layout-banner' : ''} ${isVideoLayout ? 'hero-layout-video' : ''} ${!hasAnyContent ? 'hero-variation-clean' : ''}`}
      data-layout-id={layoutId}
    >
      <div className="hero-media-backdrop">
        {slides.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.id || index}
              className={`hero-slide-item ${isActive ? 'active' : ''}`}
              aria-hidden={!isActive}
            >
              {isVideoLayout ? (
                <video
                  className="hero-video-media"
                  autoPlay
                  loop
                  muted
                  playsInline
                  poster={resolveImageUrl(slide.posterImage)}
                  preload="auto"
                  aria-hidden="true"
                >
                  {slide.videoUrl && <source src={slide.videoUrl} type="video/mp4" />}
                </video>
              ) : (
                <img
                  src={resolveImageUrl(slide.backgroundImage)}
                  alt={`TAITON Hero Slide ${index + 1}`}
                  className="hero-banner-image"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              )}
            </div>
          );
        })}
      </div>

      {overlayStyle !== 'none' && <div className={overlayClass}></div>}

      {hasAnyContent && (
        <div className={`hero-content-area ${isDarkTheme ? 'hero-theme-dark' : ''}`}>
          <div className="taiton-layout-container">
            <div className="row align-items-center">
              <div className="col-12 col-lg-7">
                {content?.tag && (
                  <div className="hero-tag mb-3">
                    {content.tag}
                  </div>
                )}

                {(content?.title || content?.titleAccent) && (
                  <h1 className="hero-title mb-4">
                    {content?.title}
                    {content?.title && content?.titleAccent && <br />}
                    {content?.titleAccent && (
                      <span className="hero-title-accent">{content.titleAccent}</span>
                    )}
                  </h1>
                )}

                {content?.subtitle && (
                  <p className="hero-subtitle mb-0">
                    {content.subtitle}
                  </p>
                )}

                {hasActions && (
                  <div className="hero-cta-container mt-4">
                    {hasCta && (
                      <div className="hero-cta-main-row">
                        {cta.url.startsWith('/') ? (
                          <Link to={cta.url} className="hero-btn-primary">
                            <span>{cta.label}</span>
                            {cta.icon && <i className={cta.icon}></i>}
                          </Link>
                        ) : (
                          <a href={cta.url} className="hero-btn-primary">
                            <span>{cta.label}</span>
                            {cta.icon && <i className={cta.icon}></i>}
                          </a>
                        )}
                      </div>
                    )}

                    {hasCtaLinks && (
                      <div className="hero-cta-links-row">
                        {ctaLinks.map((linkItem, linkIdx) => {
                          const isInternal = linkItem.url.startsWith('/');
                          const LinkTag = isInternal ? Link : 'a';
                          const linkProps = isInternal ? { to: linkItem.url } : { href: linkItem.url };

                          return (
                            <LinkTag
                              key={linkIdx}
                              {...linkProps}
                              className="hero-cta-link-pill"
                            >
                              {linkItem.icon && <i className={linkItem.icon}></i>}
                              <span>{linkItem.label}</span>
                            </LinkTag>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {slideCount > 1 && (
        <div className="hero-carousel-dots-wrap">
          <div className="hero-carousel-dots" role="tablist" aria-label="Hero Carousel Slides">
            {slides.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                className={`hero-dot ${dotIdx === activeIndex ? 'active' : ''}`}
                onClick={() => goToSlide(dotIdx)}
                aria-label={`Go to slide ${dotIdx + 1}`}
                role="tab"
                aria-selected={dotIdx === activeIndex}
              />
            ))}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
