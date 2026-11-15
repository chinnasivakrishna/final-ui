import React from 'react';
import DynamicHeroic from './DynamicHeroic';
import DynamicFeaturedProducts from './DynamicFeaturedProducts';
import DynamicLandmarkProjects from './DynamicLandmarkProjects';
import DynamicClientTestimonials from './DynamicClientTestimonials';

export default function ComponentRenderer({ componentKey, configuration, fallback = null }) {
  if (!configuration) return fallback;

  switch (componentKey) {
    case 'heroic':
    case 'hero_section':
      return <DynamicHeroic config={configuration} />;

    case 'featured-products':
    case 'featured_products':
      return <DynamicFeaturedProducts config={configuration} />;

    case 'landmark-projects':
    case 'landmark_projects':
      return <DynamicLandmarkProjects config={configuration} />;

    case 'client-testimonials':
    case 'testimonials':
      return <DynamicClientTestimonials config={configuration} />;

    default:
      return fallback;
  }
}

