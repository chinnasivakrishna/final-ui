import React from 'react';

/**
 * Shared top hero banner rendered above Breadcrumb on interior pages.
 */
export default function PageHeroBanner({
  imageUrl = '/images/about_hero_banner.webp',
  alt = 'TAITON Architectural Hardware',
}) {
  return (
    <div className="page-hero-banner-wrap w-100 overflow-hidden" style={{ height: '20vh', minHeight: '140px', maxHeight: '20vh' }}>
      <img
        src={imageUrl}
        alt={alt}
        className="w-100 h-100 page-hero-banner-img"
        style={{ height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
      />
    </div>
  );
}

