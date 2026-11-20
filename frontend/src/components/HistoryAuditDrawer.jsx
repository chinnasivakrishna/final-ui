import React from 'react';

export function HistoryAuditDrawer({ target, onClose, auditLogs = [], approvals = [], loading = false }) {
  if (!target) return null;

  // Normalize target object format whether passed as target or target.item
  const item = target.item || target;
  const itemTitle = target.title || target.name || item.title || item.name || 'Item History';
  const rawType = String(target.type || item.type || 'RECORD').toLowerCase();
  
  let displayType = 'RECORD';
  if (rawType.includes('blog')) displayType = 'BLOG';
  else if (rawType.includes('cat')) displayType = 'CATEGORY';
  else if (rawType.includes('sub')) displayType = 'SUB CATEGORY';
  else if (rawType.includes('prod')) displayType = 'PRODUCT';
  else if (rawType.includes('var')) displayType = 'VARIANT';
  else if (rawType.includes('career') || rawType.includes('job')) displayType = 'CAREER';
  else if (rawType.includes('user') || rawType.includes('member') || rawType.includes('account')) displayType = 'USER';
  else displayType = rawType.toUpperCase();

  const itemId = item.payload?.prd_id || item.payload?.variant_id || item.payload?.cat_id || item.payload?.sub_cat_id || item.payload?.blog_id || item.payload?.job_id || item.id || target.id;
  const createdBy = item.created_by_name || item.createdBy || item.maker_name || item.fullName || item.full_name || item.payload?.author_name || item.payload?.written_by || 'User';
  const createdOn = item.createdAt || item.created_at ? new Date(item.createdAt || item.created_at).toLocaleString() : 'Initial Record';

  return (
    <>
      {/* Overlay Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 1100,
        }}
      />

      {/* Slide-over Right Drawer Panel matching Product style exactly */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '460px',
          maxWidth: '90vw',
          background: '#FFFFFF',
          boxShadow: '-8px 0 30px rgba(0, 0, 0, 0.18)',
          zIndex: 1101,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', sans-serif",
          animation: 'slideInRight 0.25s ease-out',
        }}
      >
        {/* Drawer Header matching Product header styling */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#0D63C9' }}>
              History & Audit Timeline
            </span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '18px', fontWeight: '700', color: '#003E7E', fontFamily: "'Poppins', sans-serif" }}>
              {itemTitle}
            </h3>
            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
              {displayType} ID: #{itemId}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 'none', background: '#E2E8F0', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#475569', fontSize: '16px' }}
            title="Close Drawer"
          >
            &times;
          </button>
        </div>

        {/* Drawer Content - Structured Lifecycle Timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: '#F8FAFC' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Loading audit history timeline…</div>
          ) : (() => {
            const events = [];
            let hasInsertInAudit = false;
            let hasApprovalEvent = false;
            let hasRejectionEvent = false;

            const normalizedStatus = String(item.status || target.status || '').toLowerCase();

            // 1. Process Audit Logs
            (auditLogs || []).forEach((log, i) => {
              const actLower = String(log.action || '').toLowerCase();
              const msgLower = String(log.message || log.details || '').toLowerCase();

              const isCreation = actLower === 'insert' || actLower === 'create' || msgLower.includes('created');
              const isRejection = actLower === 'rejection' || actLower === 'rejected' || msgLower.includes('rejected');
              const isApproval = !isRejection && (actLower === 'approval' || actLower === 'approved' || msgLower.includes('approved'));

              if (isCreation) {
                hasInsertInAudit = true;
                events.push({
                  id: `audit-ins-${log.id || i}`,
                  title: `Created ${displayType.toLowerCase()} "${itemTitle}"`,
                  userLabel: 'Created By',
                  user: log.user_name || log.maker || createdBy,
                  timeLabel: 'Created On',
                  time: log.created_at ? new Date(log.created_at).toLocaleString() : createdOn,
                  statusNote: normalizedStatus === 'pending_approval' ? 'Sent for Approval' : 'Ready To Live',
                  badgeText: 'CREATED',
                  badgeBg: '#D1FAE5',
                  badgeColor: '#059669',
                  dotColor: '#10B981',
                  timestamp: log.created_at ? new Date(log.created_at).getTime() : 0,
                });
                return;
              }

              if (isRejection) {
                hasRejectionEvent = true;
                events.push({
                  id: `audit-rej-${log.id || i}`,
                  title: `Rejected by Checker`,
                  userLabel: 'Rejected By',
                  user: log.user_name || log.maker || 'Checker User',
                  timeLabel: 'Rejected On',
                  time: log.created_at ? new Date(log.created_at).toLocaleString() : createdOn,
                  statusNote: 'Rejected',
                  badgeText: 'REJECTED',
                  badgeBg: '#FEE2E2',
                  badgeColor: '#DC2626',
                  dotColor: '#DC2626',
                  timestamp: log.created_at ? new Date(log.created_at).getTime() : Date.now(),
                });
                return;
              }

              if (isApproval) {
                hasApprovalEvent = true;
                events.push({
                  id: `audit-appr-${log.id || i}`,
                  title: `Approved by Checker`,
                  userLabel: 'Approved By',
                  user: log.user_name || log.maker || 'Checker User',
                  timeLabel: 'Approved On',
                  time: log.created_at ? new Date(log.created_at).toLocaleString() : createdOn,
                  statusNote: 'Approved & Ready To Live',
                  badgeText: 'APPROVED',
                  badgeBg: '#D1FAE5',
                  badgeColor: '#059669',
                  dotColor: '#059669',
                  timestamp: log.created_at ? new Date(log.created_at).getTime() : Date.now(),
                });
                return;
              }

              events.push({
                id: `audit-${log.id || i}`,
                title: `Modified ${displayType.toLowerCase()}`,
                userLabel: 'Modified By',
                user: log.user_name || log.maker || 'User',
                timeLabel: 'Modified On',
                time: log.created_at ? new Date(log.created_at).toLocaleString() : 'Recent Update',
                statusNote: 'Updated record',
                badgeText: 'MODIFIED',
                badgeBg: '#DBEAFE',
                badgeColor: '#1D4ED8',
                dotColor: '#2563EB',
                timestamp: log.created_at ? new Date(log.created_at).getTime() : Date.now(),
              });
            });

            // 2. Incorporate approvals from tb_org_approvals if not already caught in audit logs
            (approvals || []).forEach((appr, idx) => {
              const apprStatus = String(appr.approval_status || '').toLowerCase();
              if (apprStatus === 'approved' && !hasApprovalEvent) {
                hasApprovalEvent = true;
                events.push({
                  id: `appr-succ-${appr.id || idx}`,
                  title: `Approved by Checker`,
                  userLabel: 'Approved By',
                  user: appr.checker_name || appr.checker || 'Checker User',
                  timeLabel: 'Approved On',
                  time: appr.actioned_at ? new Date(appr.actioned_at).toLocaleString() : createdOn,
                  statusNote: 'Approved & Ready To Live',
                  badgeText: 'APPROVED',
                  badgeBg: '#D1FAE5',
                  badgeColor: '#059669',
                  dotColor: '#059669',
                  timestamp: appr.actioned_at ? new Date(appr.actioned_at).getTime() : Date.now(),
                });
              } else if (apprStatus === 'rejected' && !hasRejectionEvent) {
                hasRejectionEvent = true;
                events.push({
                  id: `appr-rej-${appr.id || idx}`,
                  title: `Rejected by Checker`,
                  userLabel: 'Rejected By',
                  user: appr.checker_name || appr.checker || 'Checker User',
                  timeLabel: 'Rejected On',
                  time: appr.actioned_at ? new Date(appr.actioned_at).toLocaleString() : createdOn,
                  statusNote: 'Rejected',
                  badgeText: 'REJECTED',
                  badgeBg: '#FEE2E2',
                  badgeColor: '#DC2626',
                  dotColor: '#DC2626',
                  timestamp: appr.actioned_at ? new Date(appr.actioned_at).getTime() : Date.now(),
                });
              }
            });

            // 3. Fallback Creation Event if not present in audit logs
            if (!hasInsertInAudit) {
              const apprCreator = approvals.length > 0 ? (approvals[0].maker_full_name || approvals[0].maker_name || approvals[0].maker) : null;
              const finalCreatedBy = apprCreator || createdBy;
              events.push({
                id: 'event-creation',
                title: `Created ${displayType.toLowerCase()} "${itemTitle}"`,
                userLabel: 'Created By',
                user: finalCreatedBy,
                timeLabel: 'Created On',
                time: createdOn,
                statusNote: normalizedStatus === 'pending_approval' ? 'Sent for Approval' : 'Ready To Live',
                badgeText: 'CREATED',
                badgeBg: '#D1FAE5',
                badgeColor: '#059669',
                dotColor: '#10B981',
                timestamp: item.createdAt || item.created_at ? new Date(item.createdAt || item.created_at).getTime() : 0,
              });
            }

            events.sort((a, b) => b.timestamp - a.timestamp); // Newest on top

            events.sort((a, b) => b.timestamp - a.timestamp); // Newest on top

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {events.map((ev, idx) => (
                  <div
                    key={ev.id || idx}
                    style={{
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '10px',
                      padding: '16px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                      position: 'relative',
                    }}
                  >
                    {/* Card Top Title & Status Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#0F172A' }}>
                        {ev.title}
                      </div>
                      <span
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: ev.badgeBg,
                          color: ev.badgeColor,
                          fontSize: '11px',
                          fontWeight: '700',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {ev.badgeText}
                      </span>
                    </div>

                    {/* Card Details Grid matching Product layout exactly */}
                    <div style={{ fontSize: '13px', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#64748B', width: '100px' }}>{ev.userLabel}:</span>
                        <span style={{ fontWeight: '600', color: '#0F172A' }}>{ev.user}</span>
                      </div>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <span style={{ fontWeight: '600', color: '#64748B', width: '100px' }}>{ev.timeLabel}:</span>
                        <span>{ev.time}</span>
                      </div>

                      {ev.statusNote && (
                        <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px dashed #E2E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748B' }}>Status:</span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: ev.dotColor }}>{ev.statusNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </>
  );
}
