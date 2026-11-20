import { useEffect } from 'react';
import { useAuth } from '../context/authContext.js';
import { useNotifications } from '../hooks/useEnterpriseQueries.js';
import { PageBreadcrumb } from '../components/PageBreadcrumb.jsx';
import { emitUnreadRefresh } from '../utils/events.js';
import { notify } from '../utils/notify.js';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env?.VITE_API_BASE || window.location.origin;
  return new URL(path, base).toString();
};

export function NotificationsPage() {
  const { token } = useAuth();
  const { items, loading, error, refresh, markRead, markAllRead } =
    useNotifications(token, { limit: 50 });

  useEffect(() => {
    emitUnreadRefresh();
  }, [items.length]);

  // 10s background polling for notifications
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 10000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleItemClick = async (n, e) => {
    if (e.target.closest('button') || e.target.closest('a')) return;
    const isUnread = !n.read && !n.is_read && !n.readAt && !n.read_at;
    if (isUnread) {
      try {
        await markRead(n.id);
      } catch (err) {
        notify.apiError(err, 'Failed to mark read');
      }
    }
  };

  return (
    <div className="cp-stack">
      <PageBreadcrumb current="Notifications" />
      <div className="cp-page-head">
        <div>
          <h1 className="cp-page-title">Notifications</h1>
          <p className="cp-muted">
            Items shown for your role and account (including broadcasts where you are included).
          </p>
        </div>
        <div className="cp-row">
          <button type="button" className="cp-btn cp-btn-secondary" onClick={() => refresh()}>
            Refresh
          </button>
          <button type="button" className="cp-btn cp-btn-primary" onClick={markAllRead}>
            Mark all read
          </button>
        </div>
      </div>

      {error ? <div className="cp-alert">{error}</div> : null}

      <section className="cp-card cp-card-pad">
        {loading ? (
          <p className="cp-muted">Loading…</p>
        ) : items.length === 0 ? (
          <p className="cp-muted">No notifications yet.</p>
        ) : (
          <ul className="cp-notify-list">
            {items.map((n) => {
              const isUnread = !n.read && !n.is_read && !n.readAt && !n.read_at;

              return (
                <li
                  key={n.id}
                  className={`cp-notify-item cp-notify-item--clickable ${isUnread ? 'cp-notify-item--unread' : ''}`}
                  onClick={(e) => handleItemClick(n, e)}
                >
                  <div className="cp-notify-content-wrapper">
                    {(() => {
                      const fullMsg = String(n.message || n.title || n.body || '');
                      const match = fullMsg.match(/(\/uploads\/[^\s\)]+)/);
                      const reportUrl = match ? match[1] : null;
                      const cleanText = reportUrl ? fullMsg.replace(/Download report:\s*\/uploads\/[^\s\)]+/gi, '').trim() : fullMsg;

                      return (
                        <>
                          <div className="cp-notify-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isUnread && <span className="cp-notify-unread-dot" />}
                            {cleanText}
                          </div>
                          {reportUrl ? (
                            <div style={{ marginTop: '10px' }}>
                              <a
                                href={resolveImageUrl(reportUrl)}
                                download
                                className="cp-btn"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  textDecoration: 'none',
                                  padding: '7px 16px',
                                  fontSize: '13px',
                                  fontWeight: '600',
                                  background: '#EFF6FF',
                                  color: '#1D4ED8',
                                  border: '1px solid #BFDBFE',
                                  borderRadius: '6px',
                                  boxShadow: '0 1px 2px rgba(29, 78, 216, 0.08)',
                                  transition: 'all 0.15s ease',
                                }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                  <polyline points="7 10 12 15 17 10" />
                                  <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                                Download Processed Excel Report
                              </a>
                            </div>
                          ) : null}
                          <div className="cp-muted cp-notify-meta" style={{ marginTop: '6px' }}>
                            {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
