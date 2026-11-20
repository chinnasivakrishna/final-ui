import React from 'react';
import { Link } from 'react-router-dom';

export default function Breadcrumb({ items = [] }) {
  if (!items || items.length === 0) return null;

  // Filter out any duplicate leading "Home" passed by caller
  const displayItems = items.filter((item, idx) => {
    if (idx === 0 && (item?.label || '').trim().toLowerCase() === 'home') {
      return false;
    }
    return true;
  });

  const lastItem = displayItems[displayItems.length - 1];
  const parentItem = displayItems.length > 1 ? displayItems[displayItems.length - 2] : null;
  const parentUrl = parentItem?.url || (displayItems.length > 1 ? displayItems[0]?.url : '/');

  return (
    <div className="taiton-breadcrumb-bar py-3">
      <div className="site-container">
        <nav aria-label="breadcrumb">
          {/* Desktop Breadcrumb: Full hierarchy */}
          <ol className="breadcrumb mb-0 small align-items-center flex-nowrap overflow-x-auto text-nowrap d-none d-md-flex">
            <li className="breadcrumb-item flex-shrink-0 d-inline-flex align-items-center">
              <Link to="/" className="text-decoration-none text-muted d-inline-flex align-items-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="me-1"
                  aria-hidden="true"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                Home
              </Link>
            </li>
            {displayItems.map((item, idx) => {
              const isLast = idx === displayItems.length - 1;
              return (
                <React.Fragment key={idx}>
                  <li className="breadcrumb-sep flex-shrink-0 d-inline-flex align-items-center px-2 text-muted" aria-hidden="true">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  </li>
                  {isLast ? (
                    <li
                      className="breadcrumb-item active text-primary fw-semibold flex-shrink-0 d-inline-flex align-items-center"
                      aria-current="page"
                    >
                      {item.label}
                    </li>
                  ) : (
                    <li className="breadcrumb-item flex-shrink-0 d-inline-flex align-items-center">
                      {item.url ? (
                        <Link to={item.url} className="text-decoration-none text-muted">
                          {item.label}
                        </Link>
                      ) : (
                        <span className="text-muted">{item.label}</span>
                      )}
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ol>

          {/* Mobile Breadcrumb (Android/iOS): Compact '... > Ending Item' when lengthy */}
          <ol className="breadcrumb mb-0 small align-items-center flex-nowrap text-nowrap d-flex d-md-none">
            {displayItems.length > 1 ? (
              <>
                <li className="breadcrumb-item flex-shrink-0 d-inline-flex align-items-center">
                  {parentUrl ? (
                    <Link
                      to={parentUrl}
                      className="text-decoration-none text-muted fw-bold px-1"
                      title={parentItem?.label ? `Back to ${parentItem.label}` : 'Back'}
                      style={{ letterSpacing: '2px', fontSize: '1rem' }}
                    >
                      ...
                    </Link>
                  ) : (
                    <span className="text-muted fw-bold px-1" style={{ letterSpacing: '2px', fontSize: '1rem' }}>
                      ...
                    </span>
                  )}
                </li>
                <li className="breadcrumb-sep flex-shrink-0 d-inline-flex align-items-center px-2 text-muted" aria-hidden="true">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </li>
                <li
                  className="breadcrumb-item active text-primary fw-semibold flex-shrink-0 d-inline-flex align-items-center text-truncate"
                  style={{ maxWidth: '240px' }}
                  aria-current="page"
                >
                  {lastItem.label}
                </li>
              </>
            ) : (
              <>
                <li className="breadcrumb-item flex-shrink-0 d-inline-flex align-items-center">
                  <Link to="/" className="text-decoration-none text-muted d-inline-flex align-items-center">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="me-1"
                      aria-hidden="true"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                      <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    Home
                  </Link>
                </li>
                {lastItem && (
                  <>
                    <li className="breadcrumb-sep flex-shrink-0 d-inline-flex align-items-center px-2 text-muted" aria-hidden="true">
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </li>
                    <li
                      className="breadcrumb-item active text-primary fw-semibold flex-shrink-0 d-inline-flex align-items-center text-truncate"
                      style={{ maxWidth: '240px' }}
                      aria-current="page"
                    >
                      {lastItem.label}
                    </li>
                  </>
                )}
              </>
            )}
          </ol>
        </nav>
      </div>
    </div>
  );
}

