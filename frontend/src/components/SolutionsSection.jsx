import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
// import solutionsData from '../data/solutions.json';

const SOLUTION_AREA_IMAGES = [
  { alt: 'Residential Spaces', image: '/images/solutions/residential-spaces.webp', link: '/products' },
  { alt: 'Corporate & Workspaces', image: '/images/solutions/corporate-workspaces.webp', link: '/products' },
  { alt: 'Retail & Commercial', image: '/images/solutions/retail-commercial.webp', link: '/products' },
  { alt: 'Hospitality & Leisure', image: '/images/solutions/hospitality-leisure.webp', link: '/products' },
  { alt: 'Healthcare & Wellness', image: '/images/solutions/healthcare-wellness.webp', link: '/products' },
  { alt: 'Education & Institutions', image: '/images/solutions/education-institutions.webp', link: '/products' },
  { alt: 'Commercial Buildings', image: '/images/solutions/commercial-buildings.webp', link: '/products' },
  { alt: 'Shopping Malls', image: '/images/solutions/shopping-malls.webp', link: '/products' },
  { alt: 'Airports', image: '/images/solutions/airports.webp', link: '/products' },
  { alt: 'Automobile Showrooms', image: '/images/solutions/automobile-showrooms.webp', link: '/products' },
  { alt: 'Sports Complex', image: '/images/solutions/sports-complex.webp', link: '/products' }
];

export default function SolutionsSection() {
  const trackRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);

  const scrollSolutions = (direction) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    if (direction === 'right') {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: 240, behavior: 'smooth' });
      }
    } else {
      if (track.scrollLeft <= 10) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -240, behavior: 'smooth' });
      }
    }
  };

  const handleMouseDown = (e) => {
    if (!trackRef.current) return;
    isDownRef.current = true;
    isDraggingRef.current = false;
    startXRef.current = e.pageX - trackRef.current.offsetLeft;
    scrollLeftRef.current = trackRef.current.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDownRef.current || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      isDraggingRef.current = true;
    }
    trackRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDownRef.current = false;
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  };

  return (
    <div className="solutions">
      <section id="solutions-sec" className="py-5 bg-white">
        <div className="site-container">
          <div className="text-center mb-4">
            <h3 className="section-main-title text-center">SOLUTIONS / APPLICATION AREAS</h3>
            <div className="title-underline-center"></div>
          </div>

          <div className="position-relative px-0 px-md-4">
            <button
              type="button"
              className="carousel-nav-btn position-absolute start-0 top-50 translate-middle-y z-3 d-none d-md-flex"
              id="solutionsPrevBtn"
              aria-label="Previous"
              onClick={() => scrollSolutions('left')}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="carousel-nav-btn position-absolute end-0 top-50 translate-middle-y z-3 d-none d-md-flex"
              id="solutionsNextBtn"
              aria-label="Next"
              onClick={() => scrollSolutions('right')}
            >
              <i className="fas fa-chevron-right"></i>
            </button>

            <div
              className="solutions-scroll-track overflow-x-auto pb-2"
              id="solutionsTrack"
              ref={trackRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <div className="text-center solutions-track-row">
                {/*
                  Before code preserved in comments (circular thumbnail + separate title below):
                  {solutionsData.map((item, idx) => (
                    <div className="cat-item flex-shrink-0" key={idx}>
                      <Link
                        to={item.link || '/products'}
                        className="text-decoration-none"
                        onClick={(e) => {
                          if (isDraggingRef.current) e.preventDefault();
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.alt}
                          className="cat-circle-img mb-3"
                        />
                        <h6 className="fw-bold hover-blue cat-title">
                          {item.titleLine1}
                          <br />
                          {item.titleLine2}
                        </h6>
                      </Link>
                    </div>
                  ))}
                */}
                {SOLUTION_AREA_IMAGES.map((item, idx) => (
                  <div className="solution-poster-item flex-shrink-0" key={idx}>
                    <Link
                      to={item.link || '/products'}
                      className="text-decoration-none d-block"
                      onClick={(e) => {
                        if (isDraggingRef.current) e.preventDefault();
                      }}
                    >
                      <img
                        src={item.image}
                        alt={item.alt}
                        className="solution-poster-img d-block w-100"
                      />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

