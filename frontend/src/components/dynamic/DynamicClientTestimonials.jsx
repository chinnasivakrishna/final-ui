import React, { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_TESTIMONIALS = [
  {
    author: 'Rahul Sharma',
    location: 'Hyderabad',
    quote: 'Excellent product quality and professional service. Very happy with the overall experience.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
  },
  {
    author: 'Priya Reddy',
    location: 'Bengaluru',
    quote: 'Great experience with TAITON. The team was helpful, responsive and professional.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80'
  },
  {
    author: 'Arjun Mehta',
    location: 'Chennai',
    quote: 'Impressive quality and attention to detail. Highly satisfied with the service.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
  }
];

export default function DynamicClientTestimonials({ config }) {
  const title = config?.title || 'Client Testimonials';

  // Use frontend defined testimonials directly so backend static dummy data doesn't override
  const rawItems = DEFAULT_TESTIMONIALS;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  const prevIdx = rawItems.length > 0 ? (currentIdx - 1 + rawItems.length) % rawItems.length : 0;
  const nextIdx = rawItems.length > 0 ? (currentIdx + 1) % rawItems.length : 0;

  const currentItem = rawItems[currentIdx] || null;
  const prevItem = rawItems[prevIdx] || null;
  const nextItem = rawItems[nextIdx] || null;

  const changeTestimonial = useCallback((targetIdx) => {
    if (rawItems.length <= 1) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrentIdx((targetIdx + rawItems.length) % rawItems.length);
      setTimeout(() => {
        setAnimating(false);
      }, 40);
    }, 150);
  }, [rawItems.length]);

  const handlePrev = useCallback(() => {
    changeTestimonial(currentIdx - 1);
  }, [changeTestimonial, currentIdx]);

  const handleNext = useCallback(() => {
    changeTestimonial(currentIdx + 1);
  }, [changeTestimonial, currentIdx]);

  useEffect(() => {
    if (isPaused || rawItems.length <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, handleNext, rawItems.length]);

  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    if (diff > 45) {
      handleNext();
    } else if (diff < -45) {
      handlePrev();
    }
    touchStartXRef.current = null;
  };

  if (rawItems.length === 0) {
    return null;
  }

  return (
    <div className="testinomials">
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="section-main-title mb-0">{title}</h3>

          </div>

          <div
            className="position-relative px-md-3"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="testimonial-track-bg" id="testimonialTrack">
              <button
                type="button"
                className="carousel-nav-btn testimonial-nav-btn testimonial-nav-prev"
                onClick={handlePrev}
                aria-label="Previous Testimonial"
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <button
                type="button"
                className="carousel-nav-btn testimonial-nav-btn testimonial-nav-next"
                onClick={handleNext}
                aria-label="Next Testimonial"
              >
                <i className="fas fa-chevron-right"></i>
              </button>

              <div className="d-flex align-items-center justify-content-between h-100 position-relative">
                {prevItem && (
                  <div
                    className="testimonial-side-card"
                    onClick={handlePrev}
                    title="Click to view testimonial"
                  >
                    <p className="testimonial-side-text">{prevItem.quote}</p>
                    <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
                      {prevItem.image && (
                        <img
                          src={prevItem.image}
                          alt={prevItem.author}
                          className="rounded-circle testimonial-side-img"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="text-end">
                        <div className="fw-bold testimonial-side-author">{prevItem.author}</div>
                        {prevItem.location && (
                          <div className="testimonial-side-loc">
                            <i className="fas fa-map-marker-alt me-1 testimonial-side-loc-icon"></i>
                            {prevItem.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {nextItem && (
                  <div
                    className="testimonial-side-card"
                    onClick={handleNext}
                    title="Click to view testimonial"
                  >
                    <p className="testimonial-side-text">{nextItem.quote}</p>
                    <div className="d-flex align-items-center justify-content-end gap-2 pt-2 border-top">
                      {nextItem.image && (
                        <img
                          src={nextItem.image}
                          alt={nextItem.author}
                          className="rounded-circle testimonial-side-img"
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      )}
                      <div className="text-end">
                        <div className="fw-bold testimonial-side-author">{nextItem.author}</div>
                        {nextItem.location && (
                          <div className="testimonial-side-loc">
                            <i className="fas fa-map-marker-alt me-1 testimonial-side-loc-icon"></i>
                            {nextItem.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {currentItem && (
                  <div className="position-absolute top-50 start-50 translate-middle testimonial-center-card-wrap">
                    <div className={`testimonial-center-card text-center ${animating ? 'animating' : ''}`}>

                      <p className="mb-4 testimonial-center-text">{currentItem.quote}</p>
                      <div className="d-flex align-items-center justify-content-end gap-3 pt-3 border-top border-light">
                        {currentItem.image && (
                          <img
                            src={currentItem.image}
                            alt={currentItem.author}
                            className="rounded-circle border border-2 border-white shadow-sm testimonial-center-img"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        )}
                        <div className="text-end">
                          <div className="fw-bold testimonial-center-author">{currentItem.author}</div>
                          {currentItem.location && (
                            <div className="text-muted testimonial-center-loc">
                              <i className="fas fa-map-marker-alt me-1 testimonial-center-loc-icon"></i>
                              {currentItem.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {rawItems.length > 1 && (
              <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                {rawItems.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`testimonial-dot ${i === currentIdx ? 'active' : ''}`}
                    onClick={() => changeTestimonial(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
