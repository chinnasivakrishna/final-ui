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
import { BulkUploadForm } from '../components/BulkUploadForm.jsx';
import { HistoryAuditDrawer } from '../components/HistoryAuditDrawer.jsx';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const base = import.meta.env?.VITE_API_BASE || window.location.origin;
  return new URL(path, base).toString();
};

export function BlogPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // History / Audit Drawer state
  const [historyTarget, setHistoryTarget] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Reset page when queries/filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, activeTab]);

  // Bulk upload files state
  const [excelFile, setExcelFile] = useState(null);
  const [imagesList, setImagesList] = useState([]);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [uploadStats, setUploadStats] = useState(null);
  const [uploadErrors, setUploadErrors] = useState([]);
  const [downloadUrl, setDownloadUrl] = useState('');

  // Load blogs list
  const loadBlogs = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await enterpriseApi.contentList(token, 'blog');
      setBlogs(res.items ?? []);
    } catch (e) {
      notify.apiError(e, 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadBlogs();
  }, [loadBlogs]);

  // Actions
  const handleToggleView = async (item) => {
    try {
      const nextView = item.view === 'hide' ? 'view' : 'hide';
      const updatedPayload = { ...(item.payload || {}), view: nextView };
      await enterpriseApi.contentUpdate(token, 'blog', item.id, {
        title: item.title,
        summary: item.summary,
        status: item.status,
        view: nextView,
        payload: updatedPayload,
      });
      notify.success(
        nextView === 'view' ? 'Website Visibility Enabled' : 'Website Visibility Hidden',
        `"${item.title || 'Blog'}" is now ${nextView === 'view' ? 'visible on website' : 'hidden from website'}.`
      );
      loadBlogs();
    } catch (err) {
      notify.apiError(err, 'Failed to update website visibility');
    }
  };

  const handleSoftDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to set blog "${item.title}" as Inactive?`)) return;
    try {
      const updatedPayload = { ...(item.payload || {}), status: 'inactive' };
      await enterpriseApi.contentUpdate(token, 'blog', item.id, {
        title: item.title,
        summary: item.summary,
        status: 'inactive',
        payload: updatedPayload,
      });
      notify.success('Deactivated', `Blog "${item.title}" marked as Inactive.`);
      loadBlogs();
    } catch (err) {
      notify.apiError(err, 'Failed to deactivate blog');
    }
  };

  const openHistoryDrawer = (item) => {
    setHistoryTarget(item);
    setLoadingAudit(true);
    setAuditLogs([]);

    if (token && item) {
      enterpriseApi.getAuditLogs(token, {
        record_id: item.id,
        table_name: 'tb_web_blogs',
        type: 'blog'
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

  // Bulk upload handler
  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!excelFile) {
      notify.formWarning('Please select a template Excel file.');
      return;
    }
    setUploadingBulk(true);
    setUploadStats(null);
    setUploadErrors([]);
    setDownloadUrl('');
    try {
      const res = await enterpriseApi.bulkUploadBlogs(token, excelFile, imagesList);
      if (res.stats) {
        setUploadStats(res.stats);
      }
      if (res.report) {
        setUploadErrors(res.report.filter(r => r.status === 'failed'));
      }
      if (res.downloadUrl) {
        setDownloadUrl(res.downloadUrl);
      }
      if (res.stats && res.stats.failed > 0) {
        notify.warning(`Bulk upload completed with ${res.stats.failed} failures.`);
      } else {
        notify.success('Bulk Upload Completed Successfully', res.message);
        setExcelFile(null);
        setImagesList([]);
        setActiveTab('list');
      }
      emitUnreadRefresh();
      await loadBlogs();
    } catch (err) {
      notify.apiError(err, 'Bulk upload failed');
    } finally {
      setUploadingBulk(false);
    }
  };

  const clearUploadReport = () => {
    setUploadStats(null);
    setUploadErrors([]);
    setDownloadUrl('');
    setExcelFile(null);
    setImagesList([]);
    setActiveTab('list');
  };

  const getStatusTag = (status) => {
    const s = String(status || 'live').toLowerCase();
    let style = { background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' };
    let text = s.toUpperCase();

    if (s === 'active' || s === 'live') {
      style = { background: '#dcfce7', color: '#15803d', borderColor: '#86efac' };
    } else if (s === 'inactive' || s === 'rejected') {
      style = { background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' };
    }

    return (
      <span className="cp-tag" style={{ ...style, fontWeight: '600', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', display: 'inline-block' }}>
        {text}
      </span>
    );
  };

  return (
    <PermissionRoute permission={PERMISSIONS.BLOGS_READ}>
      <div className="cp-stack" style={{ position: 'relative' }}>
        <PageBreadcrumb current="Blogs" />
        <div className="cp-page-head">
          <div>
            <h1 className="cp-page-title">Blog Management</h1>
            <p className="cp-muted">Create, edit, approve, toggle visibility, and bulk upload articles and blog posts.</p>
          </div>
          <button type="button" className="cp-btn cp-btn-secondary" onClick={loadBlogs}>
            Refresh
          </button>
        </div>

        {/* Custom Tab Selector */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--cp-border)', paddingBottom: '10px' }}>
          <button
            type="button"
            className={`cp-btn ${activeTab === 'list' ? 'cp-btn-primary' : 'cp-btn-secondary'}`}
            onClick={() => { setActiveTab('list'); setSearchQuery(''); setStatusFilter(''); }}
          >
            All Blog Posts
          </button>
          {/* Hidden Bulk Upload Tab per requirement */}
          {false && (
            <button
              type="button"
              className={`cp-btn ${activeTab === 'bulk' ? 'cp-btn-primary' : 'cp-btn-secondary'}`}
              onClick={() => { setActiveTab('bulk'); setSearchQuery(''); setStatusFilter(''); }}
            >
              Bulk Upload
            </button>
          )}
        </div>

        {/* 1. Blog Posts List */}
        {activeTab === 'list' && (
          <section className="cp-card cp-card-pad">
            <div className="cp-list-head" style={{ marginBottom: '16px' }}>
              <h2 className="cp-section-title">All Blog Posts</h2>
              <PermissionGate permission={PERMISSIONS.BLOGS_WRITE}>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  onClick={() => navigate('/app/blog/create')}
                >
                  Add Blog Post
                </button>
              </PermissionGate>
            </div>

            <TableFilters
              searchVal={searchQuery}
              onSearchChange={setSearchQuery}
              statusVal={statusFilter}
              onStatusChange={setStatusFilter}
              searchPlaceholder="Search blogs by title or ID..."
              onReset={() => { setSearchQuery(''); setStatusFilter(''); }}
            />

            {loading ? (
              <p className="cp-muted">Loading blogs…</p>
            ) : (() => {
              const filtered = blogs.filter((row) => {
                const matchesSearch = row.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      (row.payload?.blog_id || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = !statusFilter || row.status === statusFilter;
                return matchesSearch && matchesStatus;
              });

              if (filtered.length === 0) {
                return <p className="cp-muted">No blog posts match your filters.</p>;
              }

              const sliced = filtered.slice((page - 1) * 10, page * 10);

              return (
                <>
                  <div className="cp-accounts-table-wrap">
                    <table className="cp-accounts-table">
                      <thead>
                        <tr>
                          <th>Featured Image</th>
                          <th>Blog ID</th>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Author</th>
                          <th>Status</th>
                          <th>Created Date</th>
                          <th aria-label="Actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sliced.map((row) => {
                          const isPending = row.status === 'pending_approval';
                          return (
                          <tr key={row.id}>
                            <td>
                              {row.payload?.featured_image ? (
                                <img
                                  src={resolveImageUrl(row.payload.featured_image)}
                                  alt="Featured"
                                  style={{ width: '80px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                              ) : (
                                <div style={{
                                  width: '80px',
                                  height: '50px',
                                  background: 'var(--cp-surface)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'var(--cp-text-muted)',
                                  fontSize: '11px',
                                  borderRadius: '4px',
                                  border: '1px solid var(--cp-border)'
                                }}>
                                  No Image
                                </div>
                              )}
                            </td>
                            <td>{row.payload?.blog_id || `blog-${row.id}`}</td>
                            <td><strong>{row.title}</strong></td>
                            <td>
                              {row.payload?.blog_category ? (
                                <span className="cp-tag cp-tag-info" style={{ textTransform: 'none' }}>
                                  {row.payload.blog_category}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>{row.payload?.author_name || 'Rakesh'}</td>
                            <td>{getStatusTag(row.status)}</td>
                            <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <PermissionGate permission={PERMISSIONS.BLOGS_WRITE}>
                                  {/* 1. Website Visibility Toggle Button */}
                                  <button
                                    type="button"
                                    className="cp-btn-icon"
                                    disabled={isPending}
                                    onClick={() => !isPending && handleToggleView(row)}
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
                                      opacity: isPending ? 0.35 : 1,
                                      cursor: isPending ? 'not-allowed' : 'pointer',
                                    }}
                                    title={isPending ? 'Record is locked while pending approval' : (row.view === 'hide' ? 'Hidden on Website (Click to View)' : 'Visible on Website (Click to Hide)')}
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
                                    disabled={isPending}
                                    onClick={() => !isPending && navigate(`/app/blog/create?editId=${row.id}`)}
                                    style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                    title={isPending ? 'Record is locked while pending approval' : 'Edit Blog'}
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
                                    disabled={isPending}
                                    onClick={() => !isPending && handleSoftDelete(row)}
                                    style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                    title={isPending ? 'Record is locked while pending approval' : 'Set Inactive (Delete)'}
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
                    labelSingle="blog post"
                    labelPlural="blog posts"
                  />
                </>
              );
            })()}
          </section>
        )}

        {/* 2. Blog Bulk Upload */}
        {activeTab === 'bulk' && (
          <PermissionGate permission={PERMISSIONS.BLOGS_WRITE}>
            <BulkUploadForm
              title="Bulk Import Blogs via Excel"
              description="Download the structured template, specify Blog details, and upload both the Excel sheet and optional image files together."
              templateUrl={enterpriseApi.downloadBlogsTemplateUrl(token)}
              processButtonLabel="Start Import Processing"
              uploading={uploadingBulk}
              uploadStats={uploadStats}
              uploadErrors={uploadErrors}
              downloadUrl={downloadUrl}
              onUpload={async (file, images) => {
                setUploadingBulk(true);
                setUploadStats(null);
                setUploadErrors([]);
                setDownloadUrl('');
                try {
                  const res = await enterpriseApi.bulkUploadBlogs(token, file, images);
                  if (res.stats) setUploadStats(res.stats);
                  if (res.report) setUploadErrors(res.report.filter(r => r.status === 'failed'));
                  if (res.downloadUrl) setDownloadUrl(res.downloadUrl);
                  if (res.stats && res.stats.failed > 0) {
                    notify.warning(`Bulk upload completed with ${res.stats.failed} failures.`);
                  } else {
                    notify.success('Bulk Upload Completed Successfully', res.message);
                    setActiveTab('list');
                  }
                  emitUnreadRefresh();
                  await loadBlogs();
                } catch (err) {
                  notify.apiError(err, 'Bulk upload failed');
                } finally {
                  setUploadingBulk(false);
                }
              }}
              onClearReport={clearUploadReport}
              imageLabel="Select Accompanying Image Files (Optional)"
            />
          </PermissionGate>
        )}

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
