import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';
import { enterpriseApi } from '../api/enterpriseApi.js';
import { PERMISSIONS } from '../constants/permissions.js';
import { PermissionRoute } from '../routes/PermissionRoute.jsx';
import { PermissionGate } from '../components/PermissionGate.jsx';
import { PageBreadcrumb } from '../components/PageBreadcrumb.jsx';
import { notify } from '../utils/notify.js';
import { emitUnreadRefresh } from '../utils/events.js';
import { TableFilters } from '../components/TableFilters.jsx';
import { TablePagination } from '../components/TablePagination.jsx';
import { HistoryAuditDrawer } from '../components/HistoryAuditDrawer.jsx';

const resolveUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env?.VITE_API_BASE || window.location.origin;
  return new URL(path, base).toString();
};

export function CatalogsPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [catalogs, setCatalogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal & History State
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [catalogName, setCatalogName] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [thumbnailImg, setThumbnailImg] = useState('');
  const [catalogStatus, setCatalogStatus] = useState('live');
  const [submitting, setSubmitting] = useState(false);

  // History / Audit Drawer state
  const [historyTarget, setHistoryTarget] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  // Load Catalogs
  const loadCatalogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await enterpriseApi.contentList(token, 'catalog');
      const activeItems = res.items ?? [];
      setCatalogs(activeItems);
    } catch (e) {
      notify.apiError(e, 'Failed to load catalogs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  // Action Functions
  const handleToggleView = async (item) => {
    try {
      const nextView = item.view === 'hide' ? 'view' : 'hide';
      const updatedPayload = { ...(item.payload || {}), view: nextView };
      await enterpriseApi.contentUpdate(token, 'catalog', item.id, {
        title: item.title,
        summary: item.summary,
        status: item.status,
        view: nextView,
        payload: updatedPayload,
      });
      notify.success(
        nextView === 'view' ? 'Website Visibility Enabled' : 'Website Visibility Hidden',
        `"${item.title || 'Catalog'}" is now ${nextView === 'view' ? 'visible on website' : 'hidden from website'}.`
      );
      loadCatalogs();
    } catch (err) {
      notify.apiError(err, 'Failed to update website visibility');
    }
  };

  const handleSoftDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to set catalog "${item.title}" as Inactive?`)) return;
    try {
      const updatedPayload = { ...(item.payload || {}), status: 'inactive' };
      await enterpriseApi.contentUpdate(token, 'catalog', item.id, {
        title: item.title,
        summary: item.summary,
        status: 'inactive',
        payload: updatedPayload,
      });
      notify.success('Deactivated', `Catalog "${item.title}" marked as Inactive.`);
      loadCatalogs();
    } catch (err) {
      notify.apiError(err, 'Failed to deactivate catalog');
    }
  };

  const openHistoryDrawer = (item) => {
    setHistoryTarget(item);
    setLoadingAudit(true);
    setAuditLogs([]);

    if (token && item) {
      enterpriseApi.getAuditLogs(token, {
        record_id: item.id,
        table_name: 'tb_web_catalogs',
        type: 'catalog'
      })
        .then((res) => {
          setAuditLogs(res.data || []);
        })
        .catch((err) => console.error('Failed to fetch audit logs:', err))
        .finally(() => setLoadingAudit(false));
    } else {
      setLoadingAudit(false);
    }
  };

  const getStatusTag = (status) => {
    const s = String(status || 'live').toLowerCase();
    let style = { background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' };
    let text = s.toUpperCase();

    if (s === 'active' || s === 'live') {
      style = { background: '#dcfce7', color: '#15803d', borderColor: '#86efac' };
    } else if (s === 'inactive' || s === 'rejected' || s === 'deleted') {
      style = { background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' };
    }

    return (
      <span className="cp-tag" style={{ ...style, fontWeight: '600', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', display: 'inline-block' }}>
        {text}
      </span>
    );
  };

  return (
    <PermissionRoute permission={PERMISSIONS.UI_WRITE}>
      <div className="cp-stack" style={{ position: 'relative' }}>
        <PageBreadcrumb current="Catalogs" />
        <div className="cp-page-head">
          <div>
            <h1 className="cp-page-title">Catalogs & Brochures</h1>
            <p className="cp-muted">Manage downloadable product catalogs, brochures, PDF documentation and visibility.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <PermissionGate permission={PERMISSIONS.UI_WRITE}>
              <button type="button" className="cp-btn cp-btn-primary" onClick={() => navigate('/app/catalogs/create')}>
                Add Catalog
              </button>
            </PermissionGate>
            <button type="button" className="cp-btn cp-btn-secondary" onClick={loadCatalogs}>
              Refresh
            </button>
          </div>
        </div>

        <section className="cp-card cp-card-pad">
          <TableFilters
            searchVal={searchQuery}
            onSearchChange={setSearchQuery}
            statusVal={statusFilter}
            onStatusChange={setStatusFilter}
            searchPlaceholder="Search catalogs by name or category..."
            onReset={() => { setSearchQuery(''); setStatusFilter(''); }}
          />

          {loading ? (
            <p className="cp-muted">Loading catalogs…</p>
          ) : (() => {
            const filtered = catalogs.filter((row) => {
              const name = row.title || row.payload?.catalog_name || row.payload?.name || '';
              const category = row.summary || row.payload?.category || '';
              const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                    category.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesStatus = !statusFilter || row.status === statusFilter;
              return matchesSearch && matchesStatus;
            });

            if (filtered.length === 0) {
              return <p className="cp-muted">No catalogs match your filters.</p>;
            }

            const sliced = filtered.slice((page - 1) * 10, page * 10);

            return (
              <>
                <div className="cp-accounts-table-wrap">
                  <table className="cp-accounts-table">
                    <thead>
                      <tr>
                        <th>Thumbnail</th>
                        <th>Catalog Name</th>
                        <th>Category</th>
                        <th>File Download</th>
                        <th>Status</th>
                        <th>Added By</th>
                        <th>Date Added</th>
                        <th aria-label="Actions">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sliced.map((row) => {
                        const thumb = row.payload?.thumbnail_img || row.payload?.thumbnail;
                        const file = row.payload?.file_url;
                        const name = row.title || row.payload?.catalog_name || row.payload?.name || 'Untitled';
                        const cat = row.summary || row.payload?.category || '—';

                        return (
                          <tr key={row.id}>
                            <td>
                              {thumb ? (
                                <img
                                  src={resolveUrl(thumb)}
                                  alt="Cover"
                                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--cp-border)' }}
                                />
                              ) : (
                                <div style={{
                                  width: '60px',
                                  height: '60px',
                                  background: 'var(--cp-surface)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--cp-text-muted)',
                                  fontSize: '10px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--cp-border)'
                                }}>
                                  No Cover
                                </div>
                              )}
                            </td>
                            <td>
                              <strong>{name}</strong>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}>
                                {row.payload?.publish_year && (
                                  <span style={{ fontSize: '11px', background: '#EFF6FF', color: '#1D4ED8', padding: '1px 6px', borderRadius: '4px', fontWeight: '600' }}>
                                    {row.payload.publish_year}
                                  </span>
                                )}
                                {row.payload?.page_name && (
                                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                                    {row.payload.page_name}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="cp-tag cp-tag-info" style={{ textTransform: 'none' }}>
                                {cat}
                              </span>
                            </td>
                            <td>
                              {file && file !== '#' ? (
                                <a
                                  href={resolveUrl(file)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="cp-btn cp-btn-secondary"
                                  style={{ padding: '4px 10px', fontSize: '12px' }}
                                >
                                  📄 Download PDF
                                </a>
                              ) : (
                                <span className="cp-muted" style={{ fontSize: '12px' }}>No File Attached</span>
                              )}
                            </td>
                            <td>{getStatusTag(row.status)}</td>
                            <td>{row.created_by_name || row.createdBy || 'Creator'}</td>
                            <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <PermissionGate permission={PERMISSIONS.UI_WRITE}>
                                  {/* 1. Website Visibility Toggle Button */}
                                  <button
                                    type="button"
                                    className="cp-btn-icon"
                                    onClick={() => handleToggleView(row)}
                                    style={{
                                      minWidth: '32px',
                                      height: '32px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      borderRadius: '6px',
                                      border: '1px solid var(--cp-border)',
                                      background: row.view === 'hide' ? '#f1f5f9' : '#eff6ff',
                                      borderColor: row.view === 'hide' ? '#cbd5e1' : '#bfdbfe',
                                      color: row.view === 'hide' ? '#64748b' : '#2563eb',
                                    }}
                                    title={row.view === 'hide' ? 'Hidden on Website (Click to View)' : 'Visible on Website (Click to Hide)'}
                                  >
                                    {row.view === 'hide' ? (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                      </svg>
                                    ) : (
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                      </svg>
                                    )}
                                  </button>

                                  {/* 2. Audit History Button */}
                                  <button
                                    type="button"
                                    className="cp-btn-icon"
                                    onClick={() => openHistoryDrawer(row)}
                                    style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', background: '#F8FAFC', color: '#003E7E' }}
                                    title="View History & Audit Timeline"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <circle cx="12" cy="12" r="10" />
                                      <polyline points="12 6 12 12 16 14" />
                                    </svg>
                                  </button>

                                  {/* 3. Edit Button */}
                                  <button
                                    type="button"
                                    className="cp-btn-icon cp-btn-icon--primary"
                                    onClick={() => navigate(`/app/catalogs/create?editId=${row.id}`)}
                                    style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)' }}
                                    title="Edit Catalog"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                      <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                  </button>

                                  {/* 4. Delete / Deactivate Button */}
                                  <button
                                    type="button"
                                    className="cp-btn-icon cp-btn-icon--danger"
                                    onClick={() => handleSoftDelete(row)}
                                    style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)' }}
                                    title="Set Inactive (Delete)"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="3 6 5 6 21 6" />
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                      <line x1="10" y1="11" x2="10" y2="17" />
                                      <line x1="14" y1="11" x2="14" y2="17" />
                                    </svg>
                                  </button>
                                </PermissionGate>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <TablePagination
                  page={page}
                  onChange={setPage}
                  total={filtered.length}
                  pageSize={10}
                  labelSingle="catalog"
                  labelPlural="catalogs"
                />
              </>
            );
          })()}
        </section>

        {/* History & Audit Drawer */}
        <HistoryAuditDrawer
          target={historyTarget}
          onClose={() => setHistoryTarget(null)}
          auditLogs={auditLogs}
          loading={loadingAudit}
        />
      </div>
    </PermissionRoute>
  );
}
