import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { emitUnreadRefresh } from '../../utils/events.js';
import { canApprovePendingItem, contentTypeToResource } from '../../utils/approvalAccess.js';
import { notify } from '../../utils/notify.js';
import { formatRoleName } from '../../utils/displayLabels.js';

const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || window.location.origin;
  return `${base}${cleanPath}`;
};

export function ApprovalsPage() {
  const { token, activeOrganization } = useAuth();
  const [pending, setPending] = useState([]);
  const [approvalRules, setApprovalRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [actionBusy, setActionBusy] = useState(false);

  const roleCode = activeOrganization?.roleCode ?? '';

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [rulesRes, res] = await Promise.all([
        enterpriseApi.orgApprovalRules(token),
        enterpriseApi.pendingApprovals(token),
      ]);

      const rules = rulesRes.rules ?? [];
      setApprovalRules(rules);

      const items = (res.items ?? []).map((row) => {
        const resource = contentTypeToResource(row.contentType);
        const typeClean = String(row.contentType || row.type || '').toLowerCase();
        
        let typeLabel = 'Page Action';
        if (typeClean === 'product') typeLabel = 'Product';
        else if (typeClean === 'category') typeLabel = 'Category';
        else if (typeClean === 'subcategory') typeLabel = 'Sub-Category';
        else if (typeClean === 'variant') typeLabel = 'Variant';
        else if (typeClean === 'seo') typeLabel = 'SEO';
        else if (typeClean === 'ui_element') typeLabel = 'UI Element';
        else if (typeClean === 'ui_layout' || typeClean === 'tb_ui_component_content') typeLabel = 'UI Layout';
        else if (typeClean === 'blog') typeLabel = 'Blog';
        else if (typeClean === 'career') typeLabel = 'Career';
        else if (typeClean === 'catalog') typeLabel = 'Catalog';
        else if (typeClean === 'user' || typeClean === 'tb_board_users' || typeClean === '/app/org/users') typeLabel = 'Add User';

        return {
          ...row,
          resource,
          typeLabel,
        };
      });
      setPending(items);

      console.log('[ApprovalsPage] Logged-in Role:', roleCode, '| Total Pending from API:', items.length, '| Rules:', rules);
    } catch (e) {
      notify.apiError(e, 'Failed to load approvals');
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, [token, roleCode]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, [load]);

  const visiblePending = pending;

  useEffect(() => {
    console.log('[ApprovalsPage] User (' + roleCode + ') can review ' + visiblePending.length + ' item(s):', visiblePending);
  }, [roleCode, visiblePending]);

  useEffect(() => {
    if (visiblePending.length > 0) {
      if (!selectedId || !visiblePending.some((item) => item.id === selectedId)) {
        setSelectedId(visiblePending[0].id);
      }
    } else {
      setSelectedId(null);
    }
  }, [visiblePending, selectedId]);

  const selectedRow = visiblePending.find((item) => item.id === selectedId) || visiblePending[0];

  async function onApprove(row, approve) {
    if (!token || !row || actionBusy) return;
    setActionBusy(true);
    try {
      await enterpriseApi.approveItem(token, row.id, { approve });
      emitUnreadRefresh();
      notify.success(approve ? 'Approved' : 'Rejected', `${row.typeLabel}: ${row.title}`);
      await load();
    } catch (err) {
      notify.apiError(err, 'Action failed');
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <div className="cp-stack">
      <PageBreadcrumb current="Approvals" />
      <div className="cp-page-head">
        <div>
          <h1 className="cp-page-title">Approvals</h1>
          <p className="cp-muted">Below-priority requests waiting for your approval as checker.</p>
        </div>
        <button
          type="button"
          className="cp-btn cp-btn-secondary"
          onClick={load}
          disabled={loading || actionBusy}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <section className="cp-card cp-card-pad">
          <p className="cp-muted">Loading pending approvals…</p>
        </section>
      ) : visiblePending.length === 0 ? (
        <section className="cp-card cp-card-pad">
          <p className="cp-muted">No items waiting for your approval.</p>
        </section>
      ) : (
        /* Mail-style 2-Column Split View */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '360px 1fr',
            gap: '20px',
            alignItems: 'start',
            minHeight: '520px',
          }}
        >
          {/* Left Inbox List Pane */}
          <div
            className="cp-card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '12px',
              gap: '10px',
              maxHeight: '680px',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 6px',
                borderBottom: '1px solid var(--cp-border, #e2e8f0)',
                paddingBottom: '10px',
              }}
            >
              <span style={{ fontWeight: '600', fontSize: '14px', color: 'var(--cp-text, #0f172a)' }}>
                Pending Inbox ({visiblePending.length})
              </span>
              <span style={{ fontSize: '11px', color: 'var(--cp-muted, #64748b)' }}>Click to read</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {visiblePending.map((row) => {
                const isSelected = selectedRow && selectedRow.id === row.id;

                return (
                  <div
                    key={`${row.contentType}-${row.id}`}
                    onClick={() => setSelectedId(row.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'var(--cp-bg, #eff6ff)' : 'var(--cp-surface, #ffffff)',
                      border: isSelected
                        ? '1.5px solid var(--cp-primary, #2563eb)'
                        : '1px solid var(--cp-border, #e2e8f0)',
                      boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.12)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span
                        className="cp-tag cp-tag-info"
                        style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase' }}
                      >
                        {row.typeLabel}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--cp-muted, #64748b)' }}>
                        {row.createdAt || row.created_at ? new Date(row.createdAt || row.created_at).toLocaleDateString() : ''}
                      </span>
                    </div>

                    <div
                      style={{
                        fontWeight: isSelected ? '700' : '600',
                        fontSize: '13px',
                        color: 'var(--cp-text, #0f172a)',
                        lineHeight: '1.3',
                        wordBreak: 'break-word',
                      }}
                    >
                      {row.title}
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--cp-muted, #64748b)' }}>
                      From: {formatRoleName(row.maker || row.createdByRole || 'Submitter')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Detail Preview Pane */}
          {selectedRow ? (
            <div
              className="cp-card cp-card-pad"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '520px',
                backgroundColor: 'var(--cp-surface, #ffffff)',
                border: '1px solid var(--cp-border, #e2e8f0)',
                borderRadius: '12px',
              }}
            >
              <div>
                {/* Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--cp-border, #e2e8f0)',
                    paddingBottom: '16px',
                    marginBottom: '20px',
                  }}
                >
                  <div>
                    <span className="cp-tag cp-tag-primary" style={{ marginBottom: '8px', display: 'inline-block' }}>
                      {selectedRow.typeLabel} Approval Request
                    </span>
                    <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--cp-text, #0f172a)', margin: '4px 0' }}>
                      {selectedRow.title}
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--cp-muted, #64748b)', margin: 0 }}>
                      Submitted by{' '}
                      <strong>{formatRoleName(selectedRow.maker || selectedRow.createdByRole || 'Submitter')}</strong>
                      {selectedRow.createdAt || selectedRow.created_at
                        ? ` on ${new Date(selectedRow.createdAt || selectedRow.created_at).toLocaleString()}`
                        : ''}
                    </p>
                  </div>
                  <span className="cp-tag cp-tag-warning">Pending Approval</span>
                </div>

                {/* Body Details Card */}
                <div
                  style={{
                    backgroundColor: 'var(--cp-bg, #f8fafc)',
                    border: '1px solid var(--cp-border, #e2e8f0)',
                    borderRadius: '8px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px',
                  }}
                >
                  <h3 style={{ fontSize: '14px', fontWeight: '600', margin: 0, color: 'var(--cp-text, #0f172a)' }}>
                    Submission Details
                  </h3>

                  {/* Optional Image Thumbnail Preview */}
                  {(selectedRow.payload?.img || selectedRow.payload?.primary_img || selectedRow.payload?.category_image || selectedRow.payload?.subcategory_image) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={resolveImageUrl(selectedRow.payload.img || selectedRow.payload.primary_img || selectedRow.payload.category_image || selectedRow.payload.subcategory_image)}
                        alt={selectedRow.title}
                        style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                      />
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>Uploaded Image</span>
                        <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b' }}>
                          Primary media asset attached to this submission.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Render payload attributes in clean key-value grid */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                      gap: '14px',
                      fontSize: '13px',
                    }}
                  >
                    {selectedRow.payload?.full_name && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Full Name
                        </span>
                        <strong>{selectedRow.payload.full_name}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.email && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Email Address
                        </span>
                        <strong>{selectedRow.payload.email}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.mobile && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Mobile Number
                        </span>
                        <strong>{selectedRow.payload.mobile}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.role && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Assigned Role
                        </span>
                        <strong>{formatRoleName(selectedRow.payload.role)}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.parent_category && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Parent Category
                        </span>
                        <strong>{selectedRow.payload.parent_category}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.category && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Category Name
                        </span>
                        <strong>{selectedRow.payload.category}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.parent_subcategory && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Parent Sub-Category
                        </span>
                        <strong>{selectedRow.payload.parent_subcategory}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.sub_category && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Sub-Category Name
                        </span>
                        <strong>{selectedRow.payload.sub_category}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.product && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Product Name
                        </span>
                        <strong>{selectedRow.payload.product}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.parent_product && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Parent Product
                        </span>
                        <strong>{selectedRow.payload.parent_product}</strong>
                      </div>
                    )}

                    {selectedRow.payload?.variant_name && (
                      <div>
                        <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                          Variant Name
                        </span>
                        <strong>{selectedRow.payload.variant_name}</strong>
                      </div>
                    )}

                    {/* Dynamically render all remaining primitive attributes */}
                    {Object.entries(selectedRow.payload || {}).map(([key, val]) => {
                      if (
                        !val ||
                        typeof val === 'object' ||
                        [
                          'id', 'status', 'created_at', 'updated_at', 'content_version', 'org_code',
                          'cat_id', 'sub_id', 'pdt_id', 'full_name', 'email', 'mobile', 'role',
                          'category', 'sub_category', 'product', 'variant_name', 'img',
                          'primary_img', 'category_image', 'subcategory_image', 'parent_category',
                          'parent_subcategory', 'parent_product'
                        ].includes(key)
                      ) return null;

                      const label = key
                        .replace(/_/g, ' ')
                        .replace(/([A-Z])/g, ' $1')
                        .replace(/^./, (str) => str.toUpperCase());

                      return (
                        <div key={key}>
                          <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                            {label}
                          </span>
                          <strong style={{ wordBreak: 'break-word' }}>{String(val)}</strong>
                        </div>
                      );
                    })}
                  </div>

                  {selectedRow.message && (
                    <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px solid var(--cp-border, #e2e8f0)' }}>
                      <span style={{ color: 'var(--cp-muted, #64748b)', fontSize: '11px', display: 'block' }}>
                        Submission Summary
                      </span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--cp-text, #334155)' }}>
                        {selectedRow.message}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '12px',
                  paddingTop: '20px',
                  borderTop: '1px solid var(--cp-border, #e2e8f0)',
                  marginTop: '20px',
                }}
              >
                <button
                  type="button"
                  className="cp-btn"
                  disabled={actionBusy}
                  onClick={() => onApprove(selectedRow, false)}
                  style={{
                    backgroundColor: '#fee2e2',
                    color: '#991b1b',
                    border: '1px solid #fca5a5',
                    padding: '9px 20px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: actionBusy ? 'not-allowed' : 'pointer',
                  }}
                >
                  {actionBusy ? 'Processing…' : 'Reject'}
                </button>
                <button
                  type="button"
                  className="cp-btn cp-btn-primary"
                  disabled={actionBusy}
                  onClick={() => onApprove(selectedRow, true)}
                  style={{
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    padding: '9px 24px',
                    fontWeight: '600',
                    borderRadius: '8px',
                    cursor: actionBusy ? 'not-allowed' : 'pointer',
                  }}
                >
                  {actionBusy ? 'Processing…' : 'Approve'}
                </button>
              </div>
            </div>
          ) : (
            <div className="cp-card cp-card-pad" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p className="cp-muted">Select a request from the left inbox to view details.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
