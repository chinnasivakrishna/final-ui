import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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

export function CareersPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState(tabParam === 'applications' ? 'applications' : 'postings');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination states
  const [jobsPage, setJobsPage] = useState(1);
  const [appsPage, setAppsPage] = useState(1);

  // History / Audit Drawer state
  const [historyTarget, setHistoryTarget] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Reset page when queries/filters change
  useEffect(() => {
    setJobsPage(1);
    setAppsPage(1);
  }, [searchQuery, statusFilter, activeTab]);

  // Sync tab state from query parameter
  useEffect(() => {
    if (tabParam === 'tracking') {
      setActiveTab('tracking');
    } else {
      setActiveTab('postings');
    }
  }, [tabParam]);

  // Candidate apply modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [coverMessage, setCoverMessage] = useState('');
  const [submittingApp, setSubmittingApp] = useState(false);

  // Load all jobs and application requests
  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        enterpriseApi.contentList(token, 'career', { limit: 500 }),
        enterpriseApi.customerRequestsList(token, { limit: 100 })
      ]);
      
      const activeJobs = jobsRes.items ?? [];
      setJobs(activeJobs);

      // Filter requests by type = 'job_application'
      const appItems = (appsRes.items ?? []).filter(
        (req) => req.requestType === 'job_application' || req.payload?.request_type === 'job_application'
      );
      setApplications(appItems);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Action Functions
  const handleToggleView = async (item) => {
    try {
      const nextView = item.view === 'hide' ? 'view' : 'hide';
      const updatedPayload = { ...(item.payload || {}), view: nextView };
      await enterpriseApi.contentUpdate(token, 'career', item.id, {
        title: item.title,
        summary: item.summary,
        status: item.status,
        view: nextView,
        payload: updatedPayload,
      });
      notify.success(
        nextView === 'view' ? 'Website Visibility Enabled' : 'Website Visibility Hidden',
        `"${item.title || 'Job Opening'}" is now ${nextView === 'view' ? 'visible on website' : 'hidden from website'}.`
      );
      loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to update website visibility');
    }
  };

  const handleSoftDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to set job opening "${item.title}" as Inactive?`)) return;
    try {
      const updatedPayload = { ...(item.payload || {}), status: 'inactive' };
      await enterpriseApi.contentUpdate(token, 'career', item.id, {
        title: item.title,
        summary: item.summary,
        status: 'inactive',
        payload: updatedPayload,
      });
      notify.success('Deactivated', `Job opening "${item.title}" marked as Inactive.`);
      loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to deactivate job opening');
    }
  };

  const openHistoryDrawer = (item) => {
    setHistoryTarget(item);
    setLoadingAudit(true);
    setAuditLogs([]);

    if (token && item) {
      enterpriseApi.getAuditLogs(token, {
        record_id: item.id,
        table_name: 'tb_web_careers',
        type: 'career'
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

  // Handle mock candidate apply form submit
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!candidateName.trim() || !candidateEmail.trim() || !selectedJobId) {
      notify.formWarning('Name, Email, and Job target selection are required.');
      return;
    }
    if (candidatePhone && candidatePhone.length !== 10) {
      notify.formWarning('Phone number must be exactly 10 digits.');
      return;
    }

    setSubmittingApp(true);
    try {
      await enterpriseApi.createCustomerRequest(token, {
        customerName: candidateName.trim(),
        email: candidateEmail.trim(),
        phone: candidatePhone.trim() || null,
        subject: selectedJobId,
        message: coverMessage.trim(),
        type: 'job_application',
      });
      notify.success('Application Received', 'Candidate application has been submitted successfully.');
      setCandidateName('');
      setCandidateEmail('');
      setCandidatePhone('');
      setSelectedJobId('');
      setCoverMessage('');
      setShowApplyModal(false);
      emitUnreadRefresh();
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to submit candidate application');
    } finally {
      setSubmittingApp(false);
    }
  };

  // Update candidate review status
  const handleUpdateStatus = async (appId, nextStatus) => {
    if (!token) return;
    try {
      await enterpriseApi.updateCustomerRequestStatus(token, appId, nextStatus);
      notify.success('Status Updated', `Application status has been changed to ${nextStatus.toUpperCase()}`);
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to update application status');
    }
  };

  const getStatusTag = (status) => {
    const s = String(status || 'live').toLowerCase();
    let style = { background: '#fef3c7', color: '#b45309', borderColor: '#fcd34d' };
    let text = s.toUpperCase();

    if (s === 'active' || s === 'live' || s === 'responded') {
      style = { background: '#dcfce7', color: '#15803d', borderColor: '#86efac' };
    } else if (s === 'inactive' || s === 'rejected' || s === 'closed') {
      style = { background: '#fee2e2', color: '#b91c1c', borderColor: '#fca5a5' };
    }

    const label = status === 'responded' ? 'SHORTLISTED' : status === 'closed' ? 'REJECTED' : text;
    return (
      <span className="cp-tag" style={{ ...style, fontWeight: '600', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', display: 'inline-block' }}>
        {label}
      </span>
    );
  };

  // Find job title helper
  const getJobTitle = (jobId) => {
    const job = jobs.find((j) => (j.payload?.job_id === jobId || String(j.id) === String(jobId)));
    return job ? job.title : jobId || 'Unknown job posting';
  };

  return (
    <PermissionRoute permission={PERMISSIONS.UI_WRITE}>
      <div className="cp-stack" style={{ position: 'relative' }}>
        <PageBreadcrumb current="Careers" />
        <div className="cp-page-head">
          <div>
            <h1 className="cp-page-title">Careers & Job Openings</h1>
            <p className="cp-muted">Configure job specifications, post vacancy postings, toggle visibility and track candidate submissions.</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="cp-btn cp-btn-secondary"
              onClick={() => {
                const liveJobs = jobs.filter((j) => j.payload?.job_id);
                if (liveJobs.length > 0) {
                  setSelectedJobId(liveJobs[0].payload.job_id);
                }
                setShowApplyModal(true);
              }}
            >
              Mock Apply Candidate
            </button>
            <button type="button" className="cp-btn cp-btn-secondary" onClick={loadData}>
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="cp-tabs" style={{ marginBottom: '16px', display: 'flex', gap: '8px', borderBottom: '1px solid var(--cp-border)', paddingBottom: '8px' }}>
          <button
            type="button"
            className={`cp-tab-btn ${activeTab === 'postings' ? 'active' : ''}`}
            onClick={() => { setActiveTab('postings'); setSearchQuery(''); setStatusFilter(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'postings' ? 'var(--cp-primary-10)' : 'transparent',
              color: activeTab === 'postings' ? 'var(--cp-primary)' : 'var(--cp-text-muted)',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Job Postings
          </button>
          <button
            type="button"
            className={`cp-tab-btn ${activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => { setActiveTab('tracking'); setSearchQuery(''); setStatusFilter(''); }}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              background: activeTab === 'tracking' ? 'var(--cp-primary-10)' : 'transparent',
              color: activeTab === 'tracking' ? 'var(--cp-primary)' : 'var(--cp-text-muted)',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Applications Tracking ({applications.length})
          </button>
        </div>

        {/* Tab 1: Job Postings */}
        {activeTab === 'postings' && (
          <section className="cp-card cp-card-pad">
            <div className="cp-list-head" style={{ marginBottom: '16px' }}>
              <h2 className="cp-section-title">All Job Openings</h2>
              <PermissionGate permission={PERMISSIONS.UI_WRITE}>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  onClick={() => navigate('/app/careers/create')}
                >
                  Add Job Opening
                </button>
              </PermissionGate>
            </div>

            <TableFilters
              searchVal={searchQuery}
              onSearchChange={setSearchQuery}
              statusVal={statusFilter}
              onStatusChange={setStatusFilter}
              searchPlaceholder="Search jobs by title, department, or location..."
              onReset={() => { setSearchQuery(''); setStatusFilter(''); }}
            />

            {loading ? (
              <p className="cp-muted">Loading job openings…</p>
            ) : (() => {
              const filtered = jobs.filter((row) => {
                const titleStr = (row.title || row.payload?.title || row.summary || '').toLowerCase();
                const jobIdStr = (row.payload?.job_id || `job-${row.id}`).toLowerCase();
                const deptStr = (row.payload?.department || row.department || '').toLowerCase();
                const q = searchQuery.toLowerCase();
                const matchesSearch = !q || titleStr.includes(q) || jobIdStr.includes(q) || deptStr.includes(q);

                const normFilter = (statusFilter || '').toLowerCase();
                const normStatus = (row.status || '').toLowerCase();
                const matchesStatus = !normFilter || normFilter === 'all' || normFilter === 'any' || normStatus === normFilter;
                return matchesSearch && matchesStatus;
              });

              if (filtered.length === 0) {
                return <p className="cp-muted">No job openings match your filters.</p>;
              }

              const sliced = filtered.slice((jobsPage - 1) * 10, jobsPage * 10);

              return (
                <>
                  <div className="cp-accounts-table-wrap">
                    <table className="cp-accounts-table">
                      <thead>
                        <tr>
                          <th>Job ID</th>
                          <th>Title</th>
                          <th>Department</th>
                          <th>Location</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Added By</th>
                          <th>Created Date</th>
                          <th aria-label="Actions">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sliced.map((row) => {
                          const isPending = row.status === 'pending_approval';
                          return (
                          <tr key={row.id}>
                            <td><code>{row.payload?.job_id || `job-${row.id}`}</code></td>
                            <td><strong>{row.title}</strong></td>
                            <td>{row.payload?.department || '—'}</td>
                            <td>{row.payload?.location || '—'}</td>
                            <td>
                              {row.payload?.employment_type ? (
                                <span className="cp-tag cp-tag-info" style={{ textTransform: 'none' }}>
                                  {row.payload.employment_type}
                                </span>
                              ) : (
                                '—'
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
                                    onClick={() => !isPending && navigate(`/app/careers/create?editId=${row.id}`)}
                                    style={{ minWidth: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: '1px solid var(--cp-border)', opacity: isPending ? 0.35 : 1, cursor: isPending ? 'not-allowed' : 'pointer' }}
                                    title={isPending ? 'Record is locked while pending approval' : 'Edit Job Opening'}
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
                    page={jobsPage}
                    onChange={setJobsPage}
                    total={filtered.length}
                    pageSize={10}
                    labelSingle="job opening"
                    labelPlural="job openings"
                  />
                </>
              );
            })()}
          </section>
        )}

        {/* Tab 2: Candidate Applications Tracking */}
        {activeTab === 'tracking' && (
          <section className="cp-card cp-card-pad">
            <TableFilters
              searchVal={searchQuery}
              onSearchChange={setSearchQuery}
              statusVal={statusFilter}
              onStatusChange={setStatusFilter}
              searchPlaceholder="Search candidate by name, email, or job target..."
              onReset={() => { setSearchQuery(''); setStatusFilter(''); }}
            />

            {loading ? (
              <p className="cp-muted">Loading applications…</p>
            ) : (() => {
              const filtered = applications.filter((app) => {
                const name = app.customerName || app.payload?.customer_name || '';
                const email = app.email || app.payload?.email || '';
                const jobTarget = app.subject || app.payload?.subject || '';
                const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                      jobTarget.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesStatus = !statusFilter || app.status === statusFilter;
                return matchesSearch && matchesStatus;
              });

              if (filtered.length === 0) {
                return <p className="cp-muted">No candidate applications match your filters.</p>;
              }

              const sliced = filtered.slice((appsPage - 1) * 10, appsPage * 10);

              return (
                <>
                  <div className="cp-accounts-table-wrap">
                    <table className="cp-accounts-table">
                      <thead>
                        <tr>
                          <th>Candidate Name</th>
                          <th>Contact Details</th>
                          <th>Job Position</th>
                          <th>Cover Note / Message</th>
                          <th>Status</th>
                          <th>Applied Date</th>
                          <th aria-label="Review Actions">Review Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sliced.map((app) => {
                          const jobId = app.subject || app.payload?.subject;
                          const name = app.customerName || app.payload?.customer_name || 'Candidate';
                          const email = app.email || app.payload?.email || '—';
                          const phone = app.phone || app.payload?.phone || '—';

                          return (
                            <tr key={app.id}>
                              <td><strong>{name}</strong></td>
                              <td>
                                <div style={{ fontSize: '12px' }}>
                                  <div>📧 {email}</div>
                                  <div>📞 {phone}</div>
                                </div>
                              </td>
                              <td>
                                <span className="cp-tag cp-tag-info" style={{ textTransform: 'none' }}>
                                  {getJobTitle(jobId)}
                                </span>
                              </td>
                              <td style={{ maxWidth: '280px', fontSize: '12px', color: 'var(--cp-text-muted)' }}>
                                {app.message || app.payload?.message || 'No cover letter attached.'}
                              </td>
                              <td>{getStatusTag(app.status)}</td>
                              <td>{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}</td>
                              <td>
                                <div style={{ display: 'flex', gap: '6px' }}>
                                  <PermissionGate permission={PERMISSIONS.UI_WRITE}>
                                    {app.status !== 'responded' && (
                                      <button
                                        type="button"
                                        className="cp-btn cp-btn-primary"
                                        onClick={() => handleUpdateStatus(app.id, 'responded')}
                                        style={{ padding: '4px 8px', fontSize: '11px' }}
                                      >
                                        Shortlist
                                      </button>
                                    )}
                                    {app.status !== 'closed' && (
                                      <button
                                        type="button"
                                        className="cp-btn cp-btn-secondary"
                                        onClick={() => handleUpdateStatus(app.id, 'closed')}
                                        style={{ padding: '4px 8px', fontSize: '11px', color: '#ef4444' }}
                                      >
                                        Reject
                                      </button>
                                    )}
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
                    page={appsPage}
                    onChange={setAppsPage}
                    total={filtered.length}
                    pageSize={10}
                    labelSingle="application"
                    labelPlural="applications"
                  />
                </>
              );
            })()}
          </section>
        )}

        {/* History & Audit Drawer */}
        <HistoryAuditDrawer
          target={historyTarget}
          onClose={() => setHistoryTarget(null)}
          auditLogs={auditLogs}
          loading={loadingAudit}
        />

        {/* Mock Apply Modal */}
        {showApplyModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
          }}>
            <div className="cp-card cp-card-pad" style={{ width: '480px', maxWidth: '90%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 className="cp-section-title" style={{ margin: 0 }}>Mock Apply Candidate</h3>
                <button type="button" onClick={() => setShowApplyModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleApplySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <label className="cp-field">
                  <span>Candidate Name *</span>
                  <input type="text" className="cp-input" value={candidateName} onChange={(e) => setCandidateName(e.target.value)} required />
                </label>
                <label className="cp-field">
                  <span>Candidate Email *</span>
                  <input type="email" className="cp-input" value={candidateEmail} onChange={(e) => setCandidateEmail(e.target.value)} required />
                </label>
                <label className="cp-field">
                  <span>Candidate Phone (10 digits)</span>
                  <input type="tel" className="cp-input" value={candidatePhone} onChange={(e) => setCandidatePhone(e.target.value.replace(/\D/g, '').slice(0, 10))} maxLength={10} />
                </label>
                <label className="cp-field">
                  <span>Job Target Opening *</span>
                  <select className="cp-input" value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)} required>
                    <option value="">Select Job Opening</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.payload?.job_id || j.id}>
                        {j.title} ({j.payload?.department || 'General'})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="cp-field">
                  <span>Cover Note / Message</span>
                  <textarea className="cp-input" rows={3} value={coverMessage} onChange={(e) => setCoverMessage(e.target.value)} />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
                  <button type="button" className="cp-btn cp-btn-secondary" onClick={() => setShowApplyModal(false)}>Cancel</button>
                  <button type="submit" className="cp-btn cp-btn-primary" disabled={submittingApp}>
                    {submittingApp ? 'Submitting…' : 'Submit Candidate Application'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PermissionRoute>
  );
}
