import React from 'react';
import { Link } from 'react-router-dom';
import { resolveImageUrl } from '../../api/catalogApi';

export default function DynamicLandmarkProjects({ config }) {
  if (!config) return null;

  const title = config.title || 'Landmark Projects';
  const knowMoreText = config.knowMoreText || 'Know More';
  const knowMoreUrl = config.knowMoreUrl || '/about#locations-sec';
  const items = Array.isArray(config.items) ? config.items : [];

  return (
    <section id="landmark-sec" className="py-5 bg-white dynamic-landmark-projects-section">
      <div className="site-container">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h3 className="section-main-title mb-0 fw-bold">{title}</h3>
          {knowMoreText && (
            <Link to={knowMoreUrl} className="text-primary text-decoration-none fw-semibold">
              {knowMoreText} <i className="fas fa-arrow-right ms-1"></i>
            </Link>
          )}
        </div>

        <div className="row g-3">
          {items.map((project, idx) => (
            <div key={project.id || idx} className="col-12 col-sm-6 col-md-4">
              <div className="card border-0 shadow-sm rounded-3 overflow-hidden h-100 hover-lift">
                {project.image && (
                  <img
                    src={resolveImageUrl(project.image)}
                    alt={project.title || 'Landmark Project'}
                    className="project-card-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
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

