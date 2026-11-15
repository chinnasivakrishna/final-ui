import React from 'react';
import HeroSection from '../HeroSection';
import PillarsBanner from '../PillarsBanner';
import { HERO_LAYOUT_IDS } from '../../data/heroData';

export default function DynamicHeroic({ config }) {
  if (!config) return null;

  const layoutId = config.layoutId || HERO_LAYOUT_IDS.LARGE_PREMIUM_BANNER;
  const data = config.data || config;

  const heroData = {
    layoutId,
    data,
  };

  return (
    <div className="dynamic-hero-wrapper position-relative">
      <HeroSection heroData={heroData}>
        <PillarsBanner />
      </HeroSection>
    </div>
  );
}

