import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchProducts, fetchCategories, resolveImageUrl } from '../api/catalogApi';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [categories, setCategories] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const trendingChips = [
    "Top Pivot Patch",
    "Hydraulic Floor Spring",
    "Synchro Sliding",
    "Digital RFID Lock",
    "Shower Cubicle",
    "Automatic Telescopic",
    "Office Partitions",
    "5D Embossed Glass"
  ];

  // Load live categories on mount
  useEffect(() => {
    let mounted = true;
    fetchCategories().then((cats) => {
      if (mounted && Array.isArray(cats) && cats.length > 0) {
        setCategories(cats.slice(0, 6));
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleClose = React.useCallback(() => {
    setQuery('');
    setSearchResults([]);
    if (onClose) onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const timer = setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);

      return () => {
        clearTimeout(timer);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  const cleanQuery = query.trim().toLowerCase();

  useEffect(() => {
    if (!cleanQuery) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setIsSearching(true);

      // Query live backend API dynamically
      fetchProducts({ search: cleanQuery, limit: 12 }).then((apiProds) => {
        if (Array.isArray(apiProds) && apiProds.length > 0) {
          const apiMapped = apiProds.map((p) => {
            const code = p.pdt_code || p.code || String(p.id);
            const name = p.product || p.fullname || p.name || code;
            const category = p.category_name || p.cat_name || 'Architectural Hardware';
            const desc = p.description || p.desc || '';
            const img = resolveImageUrl(p.image || p.img_url || p.primary_img || '');
            return {
              id: p.id,
              code,
              name,
              category,
              desc,
              image: img,
              url: `/product-detail?code=${encodeURIComponent(code)}`,
            };
          });

          // Deduplicate by code
          const seen = new Set();
          const unique = [];
          for (const item of apiMapped) {
            if (!seen.has(item.code)) {
              seen.add(item.code);
              unique.push(item);
            }
          }
          setSearchResults(unique);
        } else {
          setSearchResults([]);
        }
        setIsSearching(false);
      }).catch(() => {
        setSearchResults([]);
        setIsSearching(false);
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [cleanQuery]);

  const highlightMatch = (text, q) => {
    if (!q || !text) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const terms = escaped.split(/\s+/).filter(Boolean).join("|");
    if (!terms) return text;
    const regex = new RegExp(`(${terms})`, "gi");
    const parts = String(text).split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <span key={i} className="search-match-highlight">{part}</span> : part
    );
  };

  const handleChipClick = (chip) => {
    setQuery(chip);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleExecuteSearch = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      handleClose();
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleProductSelect = (url) => {
    handleClose();
    navigate(url);
  };

  if (!isOpen) return null;

  return (
    <div
      id="fullPageSearchOverlay"
      className={`full-page-search-overlay ${isOpen ? 'active show' : ''}`}
      aria-label="Full Page Search"
      role="dialog"
      aria-modal="true"
    >
      {/* Search Header */}
      <div className="search-overlay-header p-3 border-bottom bg-white shadow-sm flex-shrink-0">
        <div className="taiton-layout-container">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-light rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0 search-overlay-back-btn"
              id="closeSearchOverlayBtn"
              onClick={handleClose}
              aria-label="Close Search"
            >
              <i className="fas fa-arrow-left fs-5 text-dark"></i>
            </button>

            <form onSubmit={handleExecuteSearch} className="position-relative flex-grow-1 mb-0">
              <input
                ref={inputRef}
                type="text"
                id="fullPageSearchInput"
                className="form-control form-control-lg border-0 ps-3 pe-5 py-2"
                placeholder="Search products, models, categories (e.g. Patch, Lock, Sliding)..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
              {query && (
                <button
                  type="button"
                  className="btn btn-link position-absolute end-0 top-50 translate-middle-y text-muted p-0 me-3"
                  id="clearSearchBtn"
                  onClick={() => setQuery('')}
                  aria-label="Clear Input"
                >
                  <i className="fas fa-times-circle"></i>
                </button>
              )}
            </form>

            <button
              type="button"
              className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center p-0 flex-shrink-0 shadow-sm search-overlay-submit-btn"
              id="executeSearchBtn"
              onClick={handleExecuteSearch}
              aria-label="Submit Search"
            >
              <i className="fas fa-search fs-6 text-white"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Search Body */}
      <div className="search-overlay-body flex-grow-1 overflow-y-auto p-3 p-md-4 bg-white">
        <div className="taiton-layout-container search-results-wrapper">
          {cleanQuery.length === 0 ? (
            <div id="searchInitialState">
              {/* Popular & Trending Searches */}
              <div className="mb-4">
                <h6 className="text-uppercase fw-bold text-muted small mb-3 search-section-title">
                  <i className="fas fa-fire-alt text-dark me-1"></i> Popular &amp; Trending Searches
                </h6>
                <div className="d-flex flex-wrap gap-2" id="trendingSearchChips">
                  {trendingChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="btn btn-sm btn-light border rounded-pill px-3 py-1 trending-chip text-dark"
                      onClick={() => handleChipClick(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Browse Live Categories */}
              {categories.length > 0 && (
                <div className="mb-4">
                  <h6 className="text-uppercase fw-bold text-muted small mb-3 search-section-title">
                    <i className="fas fa-th me-1 text-dark"></i> Browse Categories
                  </h6>
                  <div className="row g-2">
                    {categories.map((cat, idx) => (
                      <div className="col-6 col-md-4" key={cat.id || idx}>
                        <Link
                          to={`/products?catId=${cat.id}`}
                          onClick={handleClose}
                          className="text-decoration-none"
                        >
                          <div className="p-3 border rounded-3 bg-light hover-lift d-flex align-items-center gap-3">
                            <div
                              className="rounded-circle text-white d-flex align-items-center justify-content-center category-card-icon flex-shrink-0 bg-dark"
                              style={{ width: '36px', height: '36px' }}
                            >
                              <i className="fas fa-cube"></i>
                            </div>
                            <div>
                              <div className="fw-bold text-dark category-card-title" style={{ fontSize: '0.85rem' }}>
                                {cat.name}
                              </div>
                              <div className="text-muted small category-card-count" style={{ fontSize: '0.7rem' }}>
                                Explore Products &rarr;
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div id="searchSuggestionsContainer">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <span className="text-muted small" id="searchResultsCount">
                  {isSearching ? 'Searching...' : `${searchResults.length} products found`}
                </span>
                <span className="badge bg-light text-dark border small" id="searchKeywordBadge">
                  "{query}"
                </span>
              </div>

              {searchResults.length === 0 && !isSearching ? (
                <div id="searchNoResults" className="text-center py-5">
                  <i className="fas fa-search fs-1 text-muted mb-3 opacity-50"></i>
                  <h6 className="fw-bold text-dark mb-1">No products match your search</h6>
                  <p className="text-muted small mb-3">
                    Try searching for generic terms like "Patch", "Lock", "Spring", or "Hinge".
                  </p>
                  <Link
                    to="/products"
                    className="btn btn-outline-dark btn-sm rounded-pill px-4"
                    onClick={handleClose}
                  >
                    Browse All Catalogues
                  </Link>
                </div>
              ) : (
                <div className="list-group list-group-flush" id="searchSuggestionsList">
                  {searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      className="list-group-item list-group-item-action p-3 search-suggestion-item text-decoration-none"
                      onClick={() => handleProductSelect(item.url)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex align-items-center justify-content-between gap-3">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="rounded-3 bg-light border p-1 d-flex align-items-center justify-content-center flex-shrink-0 suggestion-icon-wrap"
                            style={{ width: '48px', height: '48px' }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              />
                            ) : (
                              <i className="fas fa-box-open fs-5 text-secondary"></i>
                            )}
                          </div>
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="badge bg-dark text-white fw-bold px-2 py-0 suggestion-code-badge" style={{ fontSize: '0.72rem' }}>
                                {item.code}
                              </span>
                              <span className="badge bg-light text-muted border suggestion-cat-badge" style={{ fontSize: '0.7rem' }}>
                                {item.category}
                              </span>
                            </div>
                            <div className="fw-bold text-dark suggestion-title" style={{ fontSize: '0.92rem' }}>
                              {highlightMatch(item.name, query)}
                            </div>
                            {item.desc && (
                              <div className="text-muted small suggestion-desc" style={{ fontSize: '0.78rem' }}>
                                {highlightMatch(item.desc, query)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="text-end flex-shrink-0">
                          <span
                            className="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 fw-semibold d-none d-sm-inline-block"
                            style={{ fontSize: '0.75rem' }}
                          >
                            View Details <i className="fas fa-chevron-right ms-1" style={{ fontSize: '0.65rem' }}></i>
                          </span>
                          <i className="fas fa-arrow-right text-dark d-sm-none fs-6"></i>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
