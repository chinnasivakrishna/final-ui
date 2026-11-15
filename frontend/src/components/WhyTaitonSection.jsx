import React, { useRef, useEffect } from 'react';
import statsConfig from '../data/whyTaiton.json';

export default function WhyTaitonSection() {
  const whySectionRef = useRef(null);
  const statRefs = useRef([]);

  useEffect(() => {
    const whyEl = whySectionRef.current;
    if (!whyEl) return;

    let countersStarted = false;
    const duration = 1800;

    const startCounters = () => {
      if (countersStarted) return;
      countersStarted = true;
      const startTime = performance.now();

      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        statsConfig.forEach((cfg, idx) => {
          const el = statRefs.current[idx];
          if (el) {
            const currentVal = Math.floor(ease * cfg.target);
            el.textContent = currentVal.toLocaleString() + cfg.suffix;
          }
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          statsConfig.forEach((cfg, idx) => {
            const el = statRefs.current[idx];
            if (el) {
              el.textContent = cfg.target.toLocaleString() + cfg.suffix;
            }
          });
        }
      }
      requestAnimationFrame(animate);
    };

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              startCounters();
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.25 }
      );
      observer.observe(whyEl);
    } else {
      startCounters();
    }

    return () => {
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className="why_taiton" ref={whySectionRef}>
      <section className="py-5 bg-white">
        <div className="site-container">
          <div className="row g-0 why-taiton-box shadow-sm border">
            <div className="col-12 col-lg-5 why-taiton-left p-5 d-flex flex-column justify-content-center">
              <div className="why-taiton-qmark">?</div>
              <div className="position-relative z-1">
                <h5 className="text-uppercase tracking-widest text-white-50 fw-bold mb-1 why-taiton-tag">WHY</h5>
                <h1 className="display-3 fw-black text-white mb-0 why-taiton-title">TAITON</h1>
                <div className="why-taiton-divider bg-white mt-3"></div>
              </div>
            </div>
            <div className="col-12 col-lg-7 p-4 p-md-5 why-taiton-right">
              <div className="row g-4 text-center align-items-center">
                {statsConfig.map((stat, idx) => (
                  <React.Fragment key={idx}>
                    {idx === 3 && (
                      <div className="col-12">
                        <hr className="my-0 why-stat-divider" />
                      </div>
                    )}
                    <div
                      className={`col-4 ${stat.borderEnd ? 'border-end' : ''} ${
                        stat.borderBottom ? 'pb-3' : 'pt-3'
                      }`}
                    >
                      <h2
                        className="display-5 fw-extrabold mb-1 why-stat-num"
                        ref={(el) => (statRefs.current[idx] = el)}
                      >
                        0
                      </h2>
                      <div className="text-dark small fw-bold why-stat-label">
                        {stat.labelLine1}
                        <br />
                        {stat.labelLine2}
                      </div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

