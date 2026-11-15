import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../api/catalogApi';

export default function LandmarkProjectsSection({ config }) {
  const trackRef = useRef(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const isDraggingRef = useRef(false);

  const title = config?.title || 'Landmark Projects';
  const knowMoreText = config?.knowMoreText || 'Know More';
  const knowMoreUrl = config?.knowMoreUrl || '/about#landmark-sec';

  const projects = Array.isArray(config?.items) && config.items.length > 0
    ? config.items.map((item, idx) => ({
        id: item.id || idx,
        title: item.title,
        location: item.location || '',
        image: resolveImageUrl(item.image),
        link: item.link || '/about#landmark-sec'
      }))
    : [];

  const scrollProjects = (direction) => {
    if (!trackRef.current) return;
    const track = trackRef.current;
    const scrollAmount = 240;

    if (direction === 'right') {
      if (track.scrollLeft + track.clientWidth >= track.scrollWidth - 10) {
        track.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    } else {
      if (track.scrollLeft <= 10) {
        track.scrollTo({ left: track.scrollWidth, behavior: 'smooth' });
      } else {
        track.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
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

  if (!projects || projects.length === 0) return null;

  return (
    <div className="projects">
      <section id="landmark-sec" className="py-5 bg-white">
        <div className="site-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="section-main-title mb-0">{title}</h3>
            {knowMoreText && (
              <Link to={knowMoreUrl} className="btn-action-link">
                {knowMoreText} <i className="fas fa-arrow-right ms-1"></i>
              </Link>
            )}
          </div>

          <div className="position-relative px-0 px-md-4">
            <button
              type="button"
              className="carousel-nav-btn position-absolute start-0 top-50 translate-middle-y z-3 d-none d-md-flex"
              id="projectsPrevBtn"
              aria-label="Previous"
              onClick={() => scrollProjects('left')}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              type="button"
              className="carousel-nav-btn position-absolute end-0 top-50 translate-middle-y z-3 d-none d-md-flex"
              id="projectsNextBtn"
              aria-label="Next"
              onClick={() => scrollProjects('right')}
            >
              <i className="fas fa-chevron-right"></i>
            </button>

            <div
              className="projects-scroll-track overflow-x-auto pb-2"
              id="projectsTrack"
              ref={trackRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
            >
              <div className="projects-track-row">
                {projects.map((project, idx) => (
                  <div className="project-card-item flex-shrink-0" key={project.id || idx}>
                    <Link
                      to={project.link || '/about#landmark-sec'}
                      className="text-decoration-none text-dark d-block h-100"
                      onClick={(e) => {
                        if (isDraggingRef.current) {
                          e.preventDefault();
                        }
                      }}
                    >
                      <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100 hover-lift">
                        <img
                          src={project.image}
                          alt={project.title}
                          className="project-card-img"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="p-3">
                          <h6 className="fw-bold text-dark mb-1 project-card-title text-truncate" title={project.title}>
                            {project.title}
                          </h6>
                          {project.location && (
                            <div className="text-muted project-card-location">
                              <i className="fas fa-map-marker-alt me-1 project-card-loc-icon"></i>
                              {project.location}
                            </div>
                          )}
                        </div>
                      </div>
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

