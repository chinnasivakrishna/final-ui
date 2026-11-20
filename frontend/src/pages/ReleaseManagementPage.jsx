import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/authContext.js';
import { enterpriseApi } from '../api/enterpriseApi.js';
import { notify } from '../utils/notify.js';
import { PageBreadcrumb } from '../components/PageBreadcrumb.jsx';
import { roleMatchesCsv } from '../utils/roleAccess.js';

const TYPE_COLORS = {
  category: '#2563eb',
  subcategory: '#0284c7',
  product: '#16a34a',
  variant: '#0d9488',
  blog: '#7c3aed',
  career: '#d97706',
  catalog: '#ea580c',
  seo: '#475569',
  ui_element: '#4f46e5',
  ui_layout: '#0891b2',
  space: '#059669',
  explore_space: '#059669',
};

const TYPE_LABELS = {
  category: 'Category',
  subcategory: 'Sub-Category',
  product: 'Product',
  variant: 'Variant',
  blog: 'Blog',
  career: 'Career & Job',
  catalog: 'Catalog',
  seo: 'SEO Meta',
  ui_element: 'UI Element',
  ui_layout: 'UI Layout',
  space: 'Explore Space',
  explore_space: 'Explore Space',
};

export function ReleaseManagementPage() {
  const { user, token, activeOrganization } = useAuth();
  const rawRole = String(activeOrganization?.roleCode || activeOrganization?.roleLabel || user?.roleCode || user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
  const canRelease = rawRole === 'org_admin' || rawRole === 'organization_admin' || rawRole === 'admin' || rawRole === 'super_admin' || rawRole === 'sys_admin' || roleMatchesCsv(activeOrganization?.roleCode, 'org_admin,organization_admin,admin,sys_admin,super_admin');

  const [loading, setLoading] = useState(true);
  const [readyData, setReadyData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [releaseNote, setReleaseNote] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [reverting, setReverting] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [revertingBatchId, setRevertingBatchId] = useState(null);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [readyRes, statusRes, historyRes] = await Promise.all([
        enterpriseApi.getReadyForReleaseItems(token).catch(() => ({ data: null })),
        enterpriseApi.getReleaseStatus(token).catch(() => ({ data: null })),
        enterpriseApi.getReleaseHistory(token).catch(() => ({ data: [] })),
      ]);

      const items = readyRes.data?.allItems || [];
      setReadyData(readyRes.data);
      setStatusData(statusRes.data);
      setHistory(historyRes.data || []);
      // Default to selecting all ready items
      setSelectedKeys(items.map((item) => `${item.type}:${item.id}`));
    } catch (err) {
      notify.apiError(err, 'Failed to load release data');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const allItems = readyData?.allItems || [];
  const filteredItems = filterType === 'all' 
    ? allItems 
    : allItems.filter((i) => i.type === filterType);

  function toggleSelectItem(key) {
    setSelectedKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleSelectAll() {
    if (selectedKeys.length === allItems.length) {
      setSelectedKeys([]);
    } else {
      setSelectedKeys(allItems.map((item) => `${item.type}:${item.id}`));
    }
  }

  async function handleGoLive() {
    if (!token || selectedKeys.length === 0) return;
    setPublishing(true);
    try {
      const res = await enterpriseApi.goLiveRelease(token, {
        selected_items: selectedKeys,
        release_note: releaseNote.trim() || undefined,
      });

      notify.success(
        'Production Release Deployed!',
        `Successfully published ${res.data?.syncedCount ?? selectedKeys.length} items live to web_schema.`
      );
      setReleaseNote('');
      setShowConfirmModal(false);
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Go to Live is failed');
    } finally {
      setPublishing(false);
    }
  }

  async function handleRevert(batchId = null) {
    if (!token) return;
    const confirmMsg = 'Are you sure you want to revert this release? Changes will be restored to their previous snapshot and reset to Ready-To-Live in CPanel.';
    if (!window.confirm(confirmMsg)) return;

    setReverting(true);
    try {
      const res = await enterpriseApi.rollbackRelease(token, batchId);
      notify.success('Release Reverted', res.message || 'Restored previous state.');
      await loadData();
    } catch (err) {
      notify.apiError(err, 'Failed to revert release');
    } finally {
      setReverting(false);
      setRevertingBatchId(null);
    }
  }

  if (!canRelease) {
    return (
      <div className="cp-stack">
        <PageBreadcrumb current="Production Release" />
        <section className="cp-card cp-card-pad" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a' }}>Access Restricted</h2>
          <p className="cp-muted" style={{ marginTop: '8px' }}>
            Production Website Release ("Go For Live") is restricted to Organization Administrators.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="cp-stack">
      <PageBreadcrumb current="Production Release" />

      {/* Page Header */}
      <div className="cp-page-head" style={{ alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 className="cp-page-title" style={{ margin: 0 }}>Production Website Release ("Go For Live")</h1>
            <span className="cp-tag cp-tag-success" style={{ fontWeight: '700', fontSize: '11px', letterSpacing: '0.5px' }}>
              TWO-PHASE PUBLISH
            </span>
          </div>
          <p className="cp-muted" style={{ marginTop: '6px', maxWidth: '750px', fontSize: '13px' }}>
            Deploy approved content, catalog updates, and product changes from the Support DB (<code>taiton_cpanel</code>) 
            to the live customer website (<code>web_schema</code>) using transactional outbox batching with point-in-time revert protection.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" className="cp-btn cp-btn-secondary" onClick={loadData} disabled={loading || publishing || reverting}>
            {loading ? 'Refreshing…' : 'Refresh State'}
          </button>
          <button
            type="button"
            className="cp-btn cp-btn-primary"
            onClick={() => setShowConfirmModal(true)}
            disabled={loading || publishing || reverting || selectedKeys.length === 0}
            style={{ backgroundColor: '#0f172a', fontWeight: '600' }}
          >
            🚀 Deploy to Production ({selectedKeys.length})
          </button>
        </div>
      </div>

      {/* Production Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        <div className="cp-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '4px solid #16a34a' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Current Production Release</span>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', wordBreak: 'break-all' }}>
            {statusData?.activeReleaseVersion || 'REL-INIT-001'}
          </div>
          <span style={{ fontSize: '11px', color: '#16a34a' }}>
            {statusData?.lastReleasedAt ? `Live since ${new Date(statusData.lastReleasedAt).toLocaleString()}` : 'Initial state active'}
          </span>
        </div>

        <div className="cp-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '4px solid #2563eb' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Target Database</span>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            <code>{statusData?.productionDatabase || 'web_schema'}</code>
          </div>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>
            ✔ Online ({statusData?.totalLiveProducts ?? 0} active products in catalog)
          </span>
        </div>

        <div className="cp-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '4px solid #d97706' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Pending Manifest</span>
          <div style={{ fontSize: '20px', fontWeight: '800', color: allItems.length > 0 ? '#b45309' : '#16a34a' }}>
            {allItems.length} Item{allItems.length !== 1 ? 's' : ''} Ready
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {allItems.length > 0 ? `${selectedKeys.length} selected for next release` : 'All approved items are live'}
          </span>
        </div>

        <div className="cp-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px', borderLeft: '4px solid #7c3aed' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Rollback & Safety</span>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
            Point-In-Time Undo Log
          </div>
          <span style={{ fontSize: '11px', color: '#7c3aed' }}>
            ✔ Deterministic LIFO Revert Enabled
          </span>
        </div>
      </div>

      {/* Main Content: Pending Manifest & Actions */}
      <section className="cp-card cp-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Release Candidate Manifest ({filteredItems.length})
            </h2>
            <p className="cp-muted" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
              Select the approved items you want to include in this release batch.
            </p>
          </div>

          {/* Filter Pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['all', 'category', 'subcategory', 'product', 'variant', 'blog', 'career', 'catalog', 'seo', 'ui_element', 'ui_layout'].map((type) => {
              const count = type === 'all'
                ? allItems.length
                : (readyData?.[`${type}s`] || readyData?.[type] || (type === 'ui_layout' ? readyData?.uiLayouts : []) || []).length;
              if (type !== 'all' && count === 0) return null;
              const isSelected = filterType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFilterType(type)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '16px',
                    fontSize: '11px',
                    fontWeight: isSelected ? '700' : '500',
                    border: isSelected ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                    color: isSelected ? '#1d4ed8' : '#64748b',
                    cursor: 'pointer',
                  }}
                >
                  {type === 'all' ? 'All Types' : (TYPE_LABELS[type] || type)} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <p className="cp-muted" style={{ padding: '30px 0', textAlign: 'center' }}>Scanning release candidates…</p>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
            <span style={{ fontSize: '28px' }}>✨</span>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#0f172a', marginTop: '8px' }}>No Pending Changes</h3>
            <p className="cp-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
              All approved products, categories, blogs, and content are currently in sync with the production website.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cp-table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedKeys.length === allItems.length && allItems.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th>Type</th>
                  <th>Item Name / Title</th>
                  <th>Change Type</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th>Last Modified</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const key = `${item.type}:${item.id}`;
                  const isChecked = selectedKeys.includes(key);
                  return (
                    <tr key={key} style={{ backgroundColor: isChecked ? '#f8fafc' : 'transparent' }}>
                      <td>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectItem(key)}
                        />
                      </td>
                      <td>
                        <span
                          className="cp-tag"
                          style={{
                            backgroundColor: `${TYPE_COLORS[item.type] || '#64748b'}15`,
                            color: TYPE_COLORS[item.type] || '#64748b',
                            border: `1px solid ${TYPE_COLORS[item.type] || '#64748b'}30`,
                            fontWeight: '600',
                            fontSize: '11px',
                          }}
                        >
                          {TYPE_LABELS[item.type] || item.type}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{item.name || item.title || `${item.type} #${item.id}`}</strong>
                        {item.summary && item.summary !== item.name && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{String(item.summary).slice(0, 80)}</div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`cp-tag cp-tag-${
                            item.operationType === 'DELETE'
                              ? 'error'
                              : item.operationType === 'UPDATE'
                                ? 'info'
                                : 'primary'
                          }`}
                          style={{ fontSize: '10px', fontWeight: '700' }}
                        >
                          {item.operationType === 'DELETE' ? 'DEACTIVATE' : (item.operationType || 'CREATE')}
                        </span>
                      </td>
                      <td>
                        {['inactive', 'deleted', 'archived'].includes(String(item.status || '').toLowerCase()) ? (
                          <span className="cp-tag cp-tag-error" style={{ fontSize: '10px' }}>
                            INACTIVE
                          </span>
                        ) : (
                          <span className="cp-tag cp-tag-warning" style={{ fontSize: '10px' }}>
                            READY TO LIVE
                          </span>
                        )}
                      </td>
                      <td>v{item.content_version || 1}</td>
                      <td style={{ fontSize: '11px', color: '#64748b' }}>
                        {item.updated_at ? new Date(item.updated_at).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Bar */}
        {filteredItems.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '14px 18px',
              backgroundColor: '#f1f5f9',
              borderRadius: '8px',
              marginTop: '10px',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                {selectedKeys.length} of {allItems.length} items selected
              </span>
              {selectedKeys.length < allItems.length && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Select All
                </button>
              )}
            </div>

            <button
              type="button"
              className="cp-btn cp-btn-primary"
              onClick={() => setShowConfirmModal(true)}
              disabled={publishing || reverting || selectedKeys.length === 0}
              style={{ backgroundColor: '#0f172a', fontWeight: '600', padding: '9px 20px' }}
            >
              {publishing ? 'Publishing Live…' : `🚀 Go Live with Selected (${selectedKeys.length})`}
            </button>
          </div>
        )}
      </section>

      {/* Release History & Point-in-Time Revert */}
      <section className="cp-card cp-card-pad" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
              Release History & Revert Log
            </h2>
            <p className="cp-muted" style={{ margin: '2px 0 0 0', fontSize: '12px' }}>
              Immutable record of all previous production deployments with 1-click safe revert.
            </p>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="cp-muted" style={{ padding: '16px 0' }}>No previous release batches recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cp-table" style={{ width: '100%', fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Release Batch</th>
                  <th>Deployed At</th>
                  <th>Released By</th>
                  <th>Total Items</th>
                  <th>Breakdown</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Rollback Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((batch, idx) => {
                  const isLatest = idx === 0 && batch.status === 'COMMITTED';
                  const breakdown = batch.syncedBreakdown || {};
                  return (
                    <tr key={batch.id || batch.batchUuid} style={{ backgroundColor: isLatest ? '#f0fdf4' : 'transparent' }}>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{batch.releaseVersion || `Batch #${batch.id}`}</strong>
                        {batch.releaseNote && (
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{batch.releaseNote}</div>
                        )}
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {batch.committedAt || batch.createdAt ? new Date(batch.committedAt || batch.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td>{batch.createdByName || 'Organization Admin'}</td>
                      <td>
                        <strong style={{ color: '#0f172a' }}>{batch.totalItems || 0}</strong> items
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {Object.entries(breakdown).map(([k, v]) => {
                            if (!v || v === 0) return null;
                            return (
                              <span
                                key={k}
                                style={{
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  backgroundColor: '#f1f5f9',
                                  color: '#334155',
                                  border: '1px solid #cbd5e1',
                                }}
                              >
                                {v} {TYPE_LABELS[k] || k}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`cp-tag cp-tag-${batch.status === 'COMMITTED' ? 'success' : batch.status === 'REVERTED' ? 'warning' : 'info'}`}
                          style={{ fontSize: '10px', fontWeight: '700' }}
                        >
                          {batch.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {batch.status === 'COMMITTED' && (
                          <button
                            type="button"
                            className="cp-btn"
                            disabled={reverting}
                            onClick={() => handleRevert(batch.id)}
                            style={{
                              padding: '5px 12px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: '#fee2e2',
                              color: '#991b1b',
                              border: '1px solid #fca5a5',
                              borderRadius: '6px',
                              cursor: reverting ? 'not-allowed' : 'pointer',
                            }}
                          >
                            {reverting && revertingBatchId === batch.id ? 'Reverting…' : '⏪ Revert Release'}
                          </button>
                        )}
                        {batch.status === 'REVERTED' && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Reverted {batch.revertedAt ? new Date(batch.revertedAt).toLocaleDateString() : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
          }}
        >
          <div
            className="cp-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '24px',
              borderRadius: '12px',
              backgroundColor: '#ffffff',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                🚀 Confirm Production Deployment
              </h3>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: '#334155', margin: 0 }}>
                You are about to publish <strong>{selectedKeys.length} items</strong> from <code>taiton_cpanel</code> directly to the live customer website (<code>web_schema</code>).
              </p>

              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '6px', color: '#0f172a' }}>Release Safety Safeguards:</strong>
                <ul style={{ margin: 0, paddingLeft: '18px', color: '#475569' }}>
                  <li>Automatic snapshot backup captured prior to deployment.</li>
                  <li>Target database rows updated idempotently with live status.</li>
                  <li>Pre-sync undo logs preserved for instant point-in-time rollback.</li>
                </ul>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#0f172a', marginBottom: '4px' }}>
                  Release Note / Summary (Optional)
                </label>
                <input
                  type="text"
                  className="cp-input"
                  value={releaseNote}
                  onChange={(e) => setReleaseNote(e.target.value)}
                  placeholder="e.g. Catalog spring refresh & new products release"
                  maxLength={500}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                type="button"
                className="cp-btn cp-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={publishing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cp-btn cp-btn-primary"
                onClick={handleGoLive}
                disabled={publishing}
                style={{ backgroundColor: '#0f172a', fontWeight: '600', padding: '9px 24px' }}
              >
                {publishing ? 'Publishing Live…' : 'Confirm & Go Live'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
