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

export function SeoPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list');
  const [seoList, setSeoList] = useState([]);
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

  const loadSeo = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await enterpriseApi.contentList(token, 'seo_page');
      setSeoList(res.items ?? []);
    } catch (e) {
      notify.apiError(e, 'Failed to load SEO pages');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSeo();
  }, [loadSeo]);

  // Actions
  const handleToggleView = async (item) => {
    try {
      const nextView = item.view === 'hide' ? 'view' : 'hide';
      const updatedPayload = { ...(item.payload || {}), view: nextView };
      await enterpriseApi.contentUpdate(token, 'seo_page', item.id, {
        title: item.title,
        summary: item.summary,
        status: item.status,
        view: nextView,
        payload: updatedPayload,
      });
      notify.success(
        nextView === 'view' ? 'Website Visibility Enabled' : 'Website Visibility Hidden',
        `"${item.title || 'SEO page'}" is now ${nextView === 'view' ? 'visible on website' : 'hidden from website'}.`
      );
      loadSeo();
    } catch (err) {
      notify.apiError(err, 'Failed to update website visibility');
    }
  };

  const handleSoftDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to set SEO configuration "${item.title}" as Inactive?`)) return;
    try {
      const updatedPayload = { ...(item.payload || {}), status: 'inactive' };
      await enterpriseApi.contentUpdate(token, 'seo_page', item.id, {
        title: item.title,
        summary: item.summary,
        status: 'inactive',
        payload: updatedPayload,
      });
      notify.success('Deactivated', `SEO configuration "${item.title}" marked as Inactive.`);
      loadSeo();
    } catch (err) {
      notify.apiError(err, 'Failed to deactivate SEO page');
    }
  };

  const openHistoryDrawer = (item) => {
    setHistoryTarget(item);
    setLoadingAudit(true);
    setAuditLogs([]);

    if (token && item) {
      enterpriseApi.getAuditLogs(token, {
        record_id: item.id,
        table_name: 'tb_web_seo',
        type: 'seo_page'
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
      const res = await enterpriseApi.bulkUploadSeo(token, excelFile, imagesList);
      if (res.stats) {
        setUploadStats(res.stats);
      }
      if (res.report) {
        const errors = res.report.filter(r => r.status === 'failed');
        setUploadErrors(errors);
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
      await loadSeo();
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
    <PermissionRoute permission={PERMISSIONS.SEO_WRITE}>
      <div className="cp-stack" style={{ position: 'relative' }}>
        <PageBreadcrumb current="SEO" />
        <div className="cp-page-head">
          <div>
            <h1 className="cp-page-title">SEO Management</h1>
            <p className="cp-muted">Configure SEO page targets, focus keywords, social share og graphics and canonicals.</p>
          </div>
          <button type="button" className="cp-btn cp-btn-secondary" onClick={loadSeo}>
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
            SEO Pages Configurations
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

        {/* 1. SEO Configuration list */}
        {activeTab === 'list' && (
          <section className="cp-card cp-card-pad">
            <div className="cp-list-head" style={{ marginBottom: '16px' }}>
              <h2 className="cp-section-title">Page Configurations</h2>
              <PermissionGate permission={PERMISSIONS.SEO_WRITE}>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  onClick={() => navigate('/app/seo/create')}
                >
                  Add Page SEO
                </button>
              </PermissionGate>
            </div>

            <TableFilters
              searchVal={searchQuery}
              onSearchChange={setSearchQuery}
              statusVal={statusFilter}
              onStatusChange={setStatusFilter}
              searchPlaceholder="Search by page name, slug or URL..."
              onReset={() => { setSearchQuery(''); setStatusFilter(''); }}
            />

            {loading ? (
              <p className="cp-muted">Loading SEO pages…</p>
            ) : (() => {
              const filtered = seoList.filter((row) => {
                const matchesSearch = (row.payload?.page_name || row.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                                      (row.payload?.url_slug || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      (row.payload?.page_url || '').toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = !statusFilter || row.status === statusFilter;
                return matchesSearch && matchesStatus;
              });

              if (filtered.length === 0) {
                return <p className="cp-muted">No SEO pages match your filters.</p>;
              }

              const sliced = filtered.slice((page - 1) * 10, page * 10);

              return (
                <>
                  <div className="cp-accounts-table-wrap">
                    <table className="cp-accounts-table">
                      <thead>
                        <tr>
                          <th>Page Name</th>
                          <th>URL / Route</th>
                          <th>URL Slug</th>
                          <th>Meta Title</th>
                          <th>Focus Keyword</th>
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
                            <td><strong>{row.payload?.page_name || row.title}</strong></td>
                            <td>{row.payload?.page_url || '—'}</td>
                            <td>{row.payload?.url_slug || '—'}</td>
                            <td>{row.summary || row.payload?.seo_meta_title || '—'}</td>
                            <td>
                              {row.payload?.focus_keyword ? (
                                <span className="cp-tag cp-tag-info" style={{ textTransform: 'none' }}>{row.payload.focus_keyword}</span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>{getStatusTag(row.status)}</td>
                            <td>{row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</td>
                            <td>
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <PermissionGate permission={PERMISSIONS.SEO_WRITE}>
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
                                    onClick={() => !isPending && navigate(`/app/seo/create?editId=${row.id}`)}
                                    style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                    title={isPending ? 'Record is locked while pending approval' : 'Edit SEO Page'}
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
                    labelSingle="SEO page configuration"
                    labelPlural="SEO page configurations"
                  />
                </>
              );
            })()}
          </section>
        )}

        {/* History Audit Drawer */}
        <HistoryAuditDrawer
          open={!!historyTarget}
          onClose={() => setHistoryTarget(null)}
          title={`Audit History — ${historyTarget?.title || 'SEO Page'}`}
          logs={auditLogs}
          loading={loadingAudit}
        />

        {/* 2. SEO Bulk Upload form */}
        {activeTab === 'bulk' && (
          <PermissionGate permission={PERMISSIONS.SEO_WRITE}>
            <BulkUploadForm
              title="Bulk Import SEO Pages via Excel"
              description="Import keywords and metadata configs for multiple pages simultaneously. Download the spreadsheet template, edit rows, and upload."
              templateUrl={enterpriseApi.downloadSeoTemplateUrl(token)}
              processButtonLabel="Process SEO Upload"
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
                  const res = await enterpriseApi.bulkUploadSeo(token, file, images);
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
                  await loadSeo();
                } catch (err) {
                  notify.apiError(err, 'Bulk upload failed');
                } finally {
                  setUploadingBulk(false);
                }
              }}
              onClearReport={clearUploadReport}
              imageLabel="Choose Accompanying OG Images (Optional)"
            />
          </PermissionGate>
        )}
      </div>
    </PermissionRoute>
  );
}
