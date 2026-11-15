import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './CatalogueViewer.css';

const TOTAL_PAGES = 128;
const TOTAL_SPREADS = Math.ceil(TOTAL_PAGES / 2);

const TOC_SECTIONS = [
  { t: 'Company Overview', p: 2 },
  { t: 'Our Brands', p: 6 },
  {
    t: 'Glass Hardware',
    p: 12,
    s: [
      ['Patch Fittings', 14],
      ['Floor Springs', 28],
      ['Door Handles', 42],
      ['Glass Connectors', 56],
      ['Locks & Latches', 68],
      ['Pull Handles', 80],
      ['Door Closers', 92],
    ],
  },
  { t: 'Digital Locks', p: 98 },
  { t: 'Shower Cubicles', p: 106 },
  { t: 'Sliding Systems', p: 114 },
  { t: 'Automatic Doors', p: 120 },
  { t: 'Railings', p: 124 },
];

const CATALOGUES_LIST = [
  {
    id: 'master-catalogue',
    brand: 'TAITON',
    title: 'Master Catalogue (Hardware Section)',
    pages: 128,
    thumb: '/images/catalogues/master_catalogue.png',
  },
  {
    id: 'digital-locks',
    brand: 'TAITON',
    title: 'Digital Locks Catalogue',
    pages: 72,
    thumb: '/images/catalogues/digital_locks.png',
  },
  {
    id: 'tavic-office-partition',
    brand: 'TAVIC',
    title: 'Profiles Catalogue',
    pages: 96,
    thumb: '/images/catalogues/tavic_partition.png',
  },
  {
    id: 'maxia-shower-cubicles',
    brand: 'MAXIA',
    title: 'Shower Cubicles Catalogue',
    pages: 64,
    thumb: '/images/catalogues/maxia_shower.png',
  },
  {
    id: 'turbozip',
    brand: 'TURBO',
    title: 'Metro Entry Gate Pass Technology Catalogue',
    pages: 56,
    thumb: '/images/catalogues/turbozip.png',
  },
  {
    id: 'glass',
    brand: 'TAITON',
    title: 'Glass Catalogue',
    pages: 60,
    thumb: '/images/catalogues/glass.png',
  },
  {
    id: 'prochil',
    brand: 'TAITON',
    title: 'New TV Catalogue',
    pages: 40,
    thumb: '/images/catalogues/prochil.png',
  },
  {
    id: 'all-in-one',
    brand: 'TAITON',
    title: 'ALL IN ONE Complete Catalogue',
    pages: 128,
    thumb: '/images/catalogues/all_in_one.png',
  },
];

function getPageImgSrc(n) {
  if (n < 1 || n > TOTAL_PAGES) return '';
  const pad4 = String(n).padStart(4, '0');
  return `/catalogues/Portrait view/${pad4}.webp`;
}

function getSecOf(n) {
  if (n >= 5 && n < 12) return 2;
  let r = 0;
  TOC_SECTIONS.forEach((s, i) => {
    if (n >= s.p) r = i;
  });
  return r;
}

function getSubOf(n) {
  const s = TOC_SECTIONS[getSecOf(n)];
  let r = null;
  (s.s || []).forEach((x) => {
    if (n >= x[1]) r = x;
  });
  return r;
}

const spreadOf = (p) => Math.floor((Math.min(Math.max(p, 1), TOTAL_PAGES) - 1) / 2);

export default function CatalogueViewerPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get('id');
  const requestedPage = parseInt(searchParams.get('page') || searchParams.get('p'), 10);
  const initialSpread = !isNaN(requestedPage) ? spreadOf(requestedPage) : 0;

  const [activeCat, setActiveCat] = useState(() => {
    if (requestedId) {
      const match = CATALOGUES_LIST.find((c) => c.id === requestedId);
      if (match) return match.id;
    }
    return CATALOGUES_LIST[0].id;
  });

  const [spread, setSpread] = useState(initialSpread);
  const [pageInput, setPageInput] = useState(() => `${2 * initialSpread + 1} - ${2 * initialSpread + 2}`);
  const [noL, setNoL] = useState(false);
  const [noR, setNoR] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const bookRef = useRef(null);
  const hlRef = useRef(null);
  const hrRef = useRef(null);
  const isBusyRef = useRef(false);
  const spreadRef = useRef(initialSpread);
  const toastTimerRef = useRef(null);

  const leftPageNum = 2 * spread + 1;
  const rightPageNum = 2 * spread + 2;

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage('');
    }, 2400);
  }, []);

  const renderPageHtml = useCallback((pageNum) => {
    if (pageNum < 1 || pageNum > TOTAL_PAGES) return '';
    const src = getPageImgSrc(pageNum);
    const pad4 = String(pageNum).padStart(4, '0');
    return `<img class="cv-page-img" src="${src}" onerror="if(!this.dataset.t1){this.dataset.t1=1;this.src='/Portrait view/${pad4}.webp'}else if(!this.dataset.t2){this.dataset.t2=1;this.src='/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-${pad4}.webp'}else{this.src='/catalogues/Portrait view/0001.webp'}" alt="Page ${pageNum}">`;
  }, []);

  // Realistic 3D flip animation matching Taiton Catalogue Viewer.html
  const flipToSpread = useCallback(
    (targetSpread) => {
      if (
        isBusyRef.current ||
        targetSpread === spreadRef.current ||
        targetSpread < 0 ||
        targetSpread >= TOTAL_SPREADS
      ) {
        return;
      }

      isBusyRef.current = true;
      const oldSpread = spreadRef.current;
      const fwd = targetSpread > oldSpread;
      const bookEl = bookRef.current;
      const hlEl = hlRef.current;
      const hrEl = hrRef.current;

      const flipDiv = document.createElement('div');
      flipDiv.className = `cv-flip ${fwd ? 'n' : 'p'}`;

      if (fwd) {
        if (hrEl) hrEl.innerHTML = renderPageHtml(2 * targetSpread + 2);
        flipDiv.innerHTML = `
          <div class="cv-face cv-face fr">${renderPageHtml(2 * oldSpread + 2)}</div>
          <div class="cv-face cv-face b fl">${renderPageHtml(2 * targetSpread + 1)}</div>
        `;
      } else {
        if (hlEl) hlEl.innerHTML = renderPageHtml(2 * targetSpread + 1);
        flipDiv.innerHTML = `
          <div class="cv-face cv-face fl">${renderPageHtml(2 * oldSpread + 1)}</div>
          <div class="cv-face cv-face b fr">${renderPageHtml(2 * targetSpread + 2)}</div>
        `;
      }

      if (bookEl) {
        bookEl.appendChild(flipDiv);
        flipDiv.offsetWidth; // trigger reflow
        flipDiv.classList.add('go');
      }

      spreadRef.current = targetSpread;
      setSpread(targetSpread);
      setPageInput(`${2 * targetSpread + 1} - ${2 * targetSpread + 2}`);

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const duration = prefersReducedMotion ? 40 : 920;

      setTimeout(() => {
        if (fwd) {
          if (hlEl) hlEl.innerHTML = renderPageHtml(2 * targetSpread + 1);
        } else {
          if (hrEl) hrEl.innerHTML = renderPageHtml(2 * targetSpread + 2);
        }
        flipDiv.remove();
        isBusyRef.current = false;
      }, duration);
    },
    [renderPageHtml]
  );

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') {
        flipToSpread(spreadRef.current + 1);
      } else if (e.key === 'ArrowLeft') {
        flipToSpread(spreadRef.current - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flipToSpread]);

  const handlePageInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      const pageNum = parseInt(pageInput, 10);
      if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= TOTAL_PAGES) {
        flipToSpread(spreadOf(pageNum));
      } else {
        setPageInput(`${leftPageNum} - ${rightPageNum}`);
      }
      e.target.blur();
    }
  };

  const handlePageInputBlur = () => {
    setPageInput(`${leftPageNum} - ${rightPageNum}`);
  };

  const handleFullscreen = () => {
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    } catch {
      showToast('Fullscreen mode is not supported by your browser.');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'TAITON Catalogue Viewer',
          url: window.location.href,
        });
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    } catch {
      showToast('Sharing is not available.');
    }
  };

  const activeSecIdx = getSecOf(leftPageNum);
  const activeSub = getSubOf(leftPageNum);

  return (
    <div className={`cv-app ${noL ? 'noL' : ''} ${noR ? 'noR' : ''}`} id="cv-app">
      {/* Left Sidebar: Table of Contents */}
      <aside className="cv-side cv-sL">
        <h2>
          <span>Contents</span>
          <button onClick={() => setNoL(true)} title="Collapse contents" aria-label="Collapse contents">
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </h2>
        <nav className="cv-list cv-toc" aria-label="Contents">
          {TOC_SECTIONS.map((sec, idx) => {
            const isMainActive = idx === activeSecIdx;
            return (
              <React.Fragment key={sec.t}>
                <button
                  type="button"
                  className={`cv-row ${isMainActive ? 'on' : ''}`}
                  onClick={() => flipToSpread(spreadOf(sec.p))}
                >
                  <span>
                    {String(idx + 1).padStart(2, '0')}. {sec.t}
                  </span>
                  <b>{String(sec.p).padStart(2, '0')}</b>
                </button>
                {isMainActive &&
                  sec.s &&
                  sec.s.map((sub) => {
                    const isSubCur = activeSub && activeSub[1] === sub[1];
                    return (
                      <button
                        key={sub[0]}
                        type="button"
                        className={`cv-row cv-sub ${isSubCur ? 'cur' : ''}`}
                        onClick={() => flipToSpread(spreadOf(sub[1]))}
                      >
                        <span>{sub[0]}</span>
                        <b>{sub[1]}</b>
                      </button>
                    );
                  })}
              </React.Fragment>
            );
          })}
        </nav>
      </aside>

      {/* Main Center Stage: 3D Book & Controls */}
      <section className="cv-main">
        <div className="cv-stage">
          {/* Re-open buttons */}
          <button
            type="button"
            className="cv-open l"
            onClick={() => setNoL(false)}
            title="Show contents"
            aria-label="Show contents"
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
          <button
            type="button"
            className="cv-open r"
            onClick={() => setNoR(false)}
            title="Show catalogues"
            aria-label="Show catalogues"
          >
            <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* 3D Realistic Flipbook */}
          <div className="cv-book" ref={bookRef}>
            <div className="cv-half L" ref={hlRef}>
              <img
                className="cv-page-img"
                src={getPageImgSrc(leftPageNum)}
                alt={`Page ${leftPageNum}`}
                onError={(e) => {
                  const pad4 = String(leftPageNum).padStart(4, '0');
                  if (!e.currentTarget.dataset.t1) {
                    e.currentTarget.dataset.t1 = '1';
                    e.currentTarget.src = `/Portrait view/${pad4}.webp`;
                  } else if (!e.currentTarget.dataset.t2) {
                    e.currentTarget.dataset.t2 = '1';
                    e.currentTarget.src = `/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-${pad4}.webp`;
                  } else {
                    e.currentTarget.src = `/catalogues/Portrait view/0001.webp`;
                  }
                }}
              />
            </div>
            <div className="cv-half R" ref={hrRef}>
              <img
                className="cv-page-img"
                src={getPageImgSrc(rightPageNum)}
                alt={`Page ${rightPageNum}`}
                onError={(e) => {
                  const pad4 = String(rightPageNum).padStart(4, '0');
                  if (!e.currentTarget.dataset.t1) {
                    e.currentTarget.dataset.t1 = '1';
                    e.currentTarget.src = `/Portrait view/${pad4}.webp`;
                  } else if (!e.currentTarget.dataset.t2) {
                    e.currentTarget.dataset.t2 = '1';
                    e.currentTarget.src = `/catalogues/Portrait view/FINAL MASTER CATALOGUE %23EDITION 11 FEB-26_page-${pad4}.webp`;
                  } else {
                    e.currentTarget.src = `/catalogues/Portrait view/0002.webp`;
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Control Bar */}
        <div className="cv-bar">
          <div className="cv-grp">
            <button type="button" className="cv-btn plain" onClick={handleShare}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <circle cx="6" cy="12" r="2.5" />
                <circle cx="18" cy="6" r="2.5" />
                <circle cx="18" cy="18" r="2.5" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 11l8-4M8 13l8 4" />
              </svg>
              <span className="t">Share</span>
            </button>
            <button type="button" className="cv-btn plain" onClick={handleFullscreen}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
              </svg>
              <span className="t">Full Screen</span>
            </button>
          </div>

          <div className="cv-grp">
            <button
              type="button"
              className="cv-btn plain"
              disabled={spread === 0}
              onClick={() => flipToSpread(spread - 1)}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 5v14M18 6l-8 6 8 6z" />
              </svg>
              <span className="t">Previous</span>
            </button>
            <span className="cv-pl">Page</span>
            <input
              id="cv-pin"
              aria-label="Go to page"
              inputMode="numeric"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={handlePageInputKeyDown}
              onBlur={handlePageInputBlur}
              onFocus={(e) => e.target.select()}
            />
            <span className="cv-pl" style={{ color: 'var(--cv-mute)', fontWeight: 500 }}>
              / {TOTAL_PAGES}
            </span>
            <button
              type="button"
              className="cv-btn plain"
              disabled={spread === TOTAL_SPREADS - 1}
              onClick={() => flipToSpread(spread + 1)}
            >
              <span className="t">Next</span>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 5v14M6 6l8 6-8 6z" />
              </svg>
            </button>
          </div>

          <div className="cv-grp">
            <button type="button" className="cv-btn" onClick={() => window.print()}>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 9V4h10v5M7 17H4v-7h16v7h-3M7 14h10v6H7z" />
              </svg>
              <span className="t">Print</span>
            </button>
            <button
              type="button"
              className="cv-btn"
              onClick={() => {
                showToast('Downloading complete high-resolution catalogue PDF...');
                const link = document.createElement('a');
                link.href = '/catalogues/Portrait view/0001.webp';
                link.download = 'TAITON_Master_Catalogue.pdf';
                link.click();
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11M7 11l5 5 5-5M5 20h14" />
              </svg>
              <span className="t">Download</span>
            </button>
          </div>
        </div>
      </section>

      {/* Right Sidebar: Catalogues List & Back Button */}
      <aside className="cv-side cv-sR">
        <h2>
          <span>Catalogues</span>
          <button onClick={() => setNoR(true)} title="Collapse catalogues" aria-label="Collapse catalogues">
            <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </h2>
        <div className="cv-list">
          {CATALOGUES_LIST.map((c) => {
            const isSelected = activeCat === c.id;
            return (
              <button
                key={c.id}
                type="button"
                className={`cv-cat ${isSelected ? 'on' : ''}`}
                onClick={() => {
                  setActiveCat(c.id);
                  flipToSpread(0);
                  showToast(`Loaded ${c.title}`);
                }}
              >
                <div className="cv-cv">
                  <img src={c.thumb} alt={c.title} />
                </div>
                <div className="cv-cat-info">
                  <em>{c.brand}</em>
                  <span>{c.title}</span>
                  <small>{c.pages} Pages</small>
                </div>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className="cv-back"
          onClick={() => navigate('/catalogues')}
          title="Return to Catalogues library"
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Catalogues
        </button>
      </aside>

      {/* Toast Feedback */}
      <div className={`cv-toast ${toastMessage ? 'on' : ''}`} role="status">
        {toastMessage}
      </div>
    </div>
  );
}
