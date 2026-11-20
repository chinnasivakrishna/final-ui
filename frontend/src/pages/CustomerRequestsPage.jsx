import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/authContext.js';
import { enterpriseApi } from '../api/enterpriseApi.js';
import { notify } from '../utils/notify.js';
import { FieldLabel } from '../components/FieldLabel.jsx';

const TICKET_TYPES = ['Bug', 'Issue', 'Enhancement', 'Clarification'];

const URGENCY_OPTIONS = [
  { key: 'low', label: 'Low', color: '#64748B' },
  { key: 'normal', label: 'Normal', color: '#0D63C9' },
  { key: 'high', label: 'High', color: '#F59E0B' },
  { key: 'urgent', label: 'Urgent / Critical', color: '#EF4444' },
];

export function CustomerRequestsPage({ title = 'Techtrole Customer Service' }) {
  const { token, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [activeTicket, setActiveTicket] = useState(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Form state
  const [requestType, setRequestType] = useState('Issue');
  const [ticketTitle, setTicketTitle] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [raisedBy, setRaisedBy] = useState(user?.fullName || user?.name || 'Rakesh Taiton');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [commentSubmitting, setCommentSubmitting] = useState(false);

  // Load all tickets from backend (tb_cs_tickets)
  const loadTickets = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await enterpriseApi.supportTickets(token, { limit: 120 });
      const items = res.items || res.tickets || res.data || [];
      setTickets(items);
      if (selectedTicketId) {
        const found = items.find((t) => String(t.id) === String(selectedTicketId));
        if (found) setActiveTicket(found);
      }
    } catch (e) {
      notify.apiError(e, 'Failed to load tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedTicketId]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleOpenTicketDrawer = async (t) => {
    setSelectedTicketId(t.id);
    setActiveTicket(t);
    setShowDrawer(true);
    if (token) {
      try {
        const detailRes = await enterpriseApi.supportTicket(token, t.id);
        const detailed = detailRes.ticket || detailRes.data || t;
        setActiveTicket(detailed);
      } catch (e) {}
    }
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !token) return;

    for (const file of files) {
      try {
        const res = await enterpriseApi.uploadImage(token, file);
        setAttachments((prev) => [...prev, res.url]);
        setAttachmentFiles((prev) => [...prev, { name: file.name, url: res.url }]);
        notify.success('Attachment uploaded', file.name);
      } catch (err) {
        notify.apiError(err, 'Failed to upload attachment');
      }
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!token) return;
    if (!ticketTitle.trim() || !description.trim()) {
      notify.formWarning('Title and description are required.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        requestType,
        title: ticketTitle.trim(),
        subject: ticketTitle.trim(),
        description: description.trim(),
        message: description.trim(),
        urgency,
        priority: urgency,
        raisedBy: raisedBy.trim() || 'Rakesh Taiton',
        assignedTo: 'Techtrole Support Team',
        attachments: attachmentFiles.map((a) => ({ file_path: a.url, file_name: a.name })),
      };

      const res = await enterpriseApi.supportCreateTicket(token, payload);
      notify.success('Ticket Raised', 'Your support ticket has been raised successfully.');
      setTicketTitle('');
      setDescription('');
      setAttachments([]);
      setAttachmentFiles([]);
      await loadTickets();
      if (res.ticket?.id) {
        handleOpenTicketDrawer(res.ticket);
      }
    } catch (err) {
      notify.apiError(err, 'Failed to raise ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (nextStatus) => {
    if (!token || !activeTicket) return;
    try {
      const res = await enterpriseApi.supportUpdateTicketStatus(
        token,
        activeTicket.id,
        nextStatus,
        raisedBy || 'Developer User',
        `Status updated to ${nextStatus}`
      );
      notify.success('Status Updated', `Ticket status changed to ${nextStatus}`);
      await loadTickets();
      if (res.ticket) setActiveTicket(res.ticket);
    } catch (err) {
      notify.apiError(err, 'Status update failed');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token || !activeTicket || !commentText.trim()) return;
    setCommentSubmitting(true);
    try {
      const res = await enterpriseApi.supportAddComment(token, activeTicket.id, {
        userName: raisedBy || user?.fullName || 'Client Developer',
        userRole: 'Developer',
        commentText: commentText.trim(),
      });
      notify.success('Comment Added', 'Your comment has been posted.');
      setCommentText('');
      await loadTickets();
      if (res.ticket) setActiveTicket(res.ticket);
    } catch (err) {
      notify.apiError(err, 'Failed to post comment');
    } finally {
      setCommentSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (typeFilter && t.requestType !== typeFilter) return false;
    if (statusFilter && t.status !== statusFilter) return false;
    return true;
  });

  const getStatusStageIndex = (statusStr) => {
    const s = String(statusStr || '').toLowerCase();
    if (s === 'raised' || s === 'open' || s === 'new') return 0;
    if (s === 'acknowledged') return 1;
    if (s === 'assigned') return 2;
    if (s === 'in_progress') return 3;
    if (s === 'ready') return 4;
    if (s === 'closed' || s === 'resolved') return 5;
    if (s === 'rejected') return 6;
    if (s === 'canceled') return 7;
    return 0;
  };

  const activeStageIdx = activeTicket ? getStatusStageIndex(activeTicket.status) : 0;

  const getTypeBadgeStyle = (typeStr) => {
    switch (typeStr) {
      case 'Bug':
        return { background: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA' };
      case 'Enhancement':
        return { background: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0' };
      case 'Clarification':
        return { background: '#F0F9FF', color: '#0284C7', border: '1px solid #BAE6FD' };
      default:
        return { background: '#EEF6FF', color: '#003E7E', border: '1px solid #CBD5E1' };
    }
  };

  const getUrgencyBadgeStyle = (prio) => {
    switch (prio) {
      case 'urgent':
        return { background: '#EF4444', color: '#FFFFFF' };
      case 'high':
        return { background: '#F59E0B', color: '#FFFFFF' };
      case 'low':
        return { background: '#94A3B8', color: '#FFFFFF' };
      default:
        return { background: '#0D63C9', color: '#FFFFFF' };
    }
  };

  return (
    <div className="cp-stack">
      {/* Dynamic Keyframes for Slide-Over Drawer */}
      <style>{`
        @keyframes cpSlideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      {/* Top Header */}
      <div
        className="cp-page-head"
        style={{
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1 className="cp-page-title">{title}</h1>
          <p className="cp-muted">
            Developer & Client Support Portal: Raise tickets, track live stage progress, attachments, and comments.
          </p>
        </div>
        <button
          type="button"
          className="cp-btn cp-btn-secondary"
          onClick={loadTickets}
          disabled={loading}
          style={{ height: '36px', fontSize: '13px' }}
        >
          🔄 Refresh Tickets
        </button>
      </div>

      {/* SIDE-BY-SIDE SPLIT GRID: Left Raise Ticket Form, Right All Tickets Table */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '20px', alignItems: 'start' }}>
        {/* LEFT COLUMN: RAISE NEW DEVELOPER SUPPORT TICKET FORM */}
        <section
          className="cp-card cp-card-pad"
          style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid var(--cp-border)' }}
        >
          <h2
            className="cp-section-title"
            style={{
              fontSize: '16px',
              fontWeight: '700',
              borderBottom: '1px solid var(--cp-border)',
              paddingBottom: '10px',
              marginBottom: '16px',
              color: '#003E7E',
            }}
          >
            ➕ Raise Support Ticket
          </h2>

          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label className="cp-field">
              <FieldLabel required>Ticket Type</FieldLabel>
              <select
                className="cp-input"
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                style={{ fontWeight: '600' }}
              >
                {TICKET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>

            <label className="cp-field">
              <FieldLabel required>Ticket Title / Summary</FieldLabel>
              <input
                type="text"
                className="cp-input"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="e.g. Navigation dropdown overflow on mobile"
                required
              />
            </label>

            <label className="cp-field">
              <FieldLabel required>Urgency / Priority</FieldLabel>
              <select className="cp-input" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                {URGENCY_OPTIONS.map((u) => (
                  <option key={u.key} value={u.key}>
                    {u.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="cp-field">
              <FieldLabel required>Raised By</FieldLabel>
              <input
                type="text"
                className="cp-input"
                value={raisedBy}
                onChange={(e) => setRaisedBy(e.target.value)}
                placeholder="Rakesh Taiton"
                required
              />
            </label>

            <label className="cp-field">
              <FieldLabel required>Description & Steps to Reproduce</FieldLabel>
              <textarea
                className="cp-input"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide complete bug description, expected vs actual result, or feature clarification..."
                required
              />
            </label>

            <label className="cp-field">
              <FieldLabel>Attachment of Raise (Screenshots / Logs / Docs)</FieldLabel>
              <input
                type="file"
                className="cp-input"
                multiple
                onChange={handleFileUpload}
                style={{ padding: '6px', fontSize: '12px' }}
              />
              {attachmentFiles.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {attachmentFiles.map((att, idx) => (
                    <div
                      key={idx}
                      style={{
                        fontSize: '11px',
                        background: '#F1F5F9',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span style={{ color: '#003E7E', fontWeight: '600' }}>📎 {att.name}</span>
                      <span style={{ color: '#10B981', fontWeight: '700' }}>Uploaded</span>
                    </div>
                  ))}
                </div>
              )}
            </label>

            <button
              type="submit"
              className="cp-btn cp-btn-primary"
              disabled={submitting}
              style={{
                height: '42px',
                marginTop: '8px',
                fontWeight: '700',
                fontSize: '14px',
                background: '#003E7E',
                borderColor: '#003E7E',
              }}
            >
              {submitting ? 'Raising Ticket…' : 'Submit Support Ticket'}
            </button>
          </form>
        </section>

        {/* RIGHT COLUMN: TICKETS LIST TABLE */}
        <section
          className="cp-card cp-card-pad"
          style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid var(--cp-border)' }}
        >
          <div
            style={{
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
              borderBottom: '1px solid var(--cp-border)',
              paddingBottom: '12px',
              marginBottom: '16px',
            }}
          >
            <h2 className="cp-section-title" style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: '#1E293B' }}>
              All Support Tickets ({filteredTickets.length})
            </h2>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <select
                className="cp-input"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ height: '32px', fontSize: '12px' }}
              >
                <option value="">All Types</option>
                {TICKET_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <select
                className="cp-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ height: '32px', fontSize: '12px' }}
              >
                <option value="">All Statuses</option>
                <option value="raised">Raised</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="ready">Ready</option>
                <option value="closed">Closed</option>
                <option value="rejected">Rejected</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p className="cp-muted" style={{ padding: '16px' }}>
              Loading support tickets…
            </p>
          ) : filteredTickets.length === 0 ? (
            <p className="cp-muted" style={{ padding: '16px' }}>
              No tickets raised yet matching criteria.
            </p>
          ) : (
            <div className="cp-table-wrap">
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Title</th>
                    <th>Raised By</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Urgency</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((t) => {
                    const isSelected = activeTicket && String(activeTicket.id) === String(t.id);
                    return (
                      <tr
                        key={t.id}
                        style={{
                          background: isSelected ? '#EEF6FF' : 'transparent',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleOpenTicketDrawer(t)}
                      >
                        <td style={{ fontWeight: '700', fontSize: '12px', color: '#003E7E' }}>#TK-{t.id}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              ...getTypeBadgeStyle(t.requestType),
                            }}
                          >
                            {t.requestType}
                          </span>
                        </td>
                        <td
                          style={{
                            fontWeight: '600',
                            color: '#1E293B',
                            maxWidth: '220px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {t.title}
                        </td>
                        <td style={{ fontSize: '12px' }}>{t.raisedBy || t.customerName}</td>
                        <td style={{ fontSize: '12px', color: '#475569' }}>
                          {t.assignedTo || 'Techtrole Support Team'}
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              textTransform: 'capitalize',
                              color: '#003E7E',
                              background: '#F1F5F9',
                              padding: '2px 8px',
                              borderRadius: '4px',
                            }}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              textTransform: 'uppercase',
                              ...getUrgencyBadgeStyle(t.urgency),
                            }}
                          >
                            {t.urgency}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="cp-btn cp-btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenTicketDrawer(t);
                            }}
                            style={{ padding: '2px 10px', fontSize: '11px', height: '28px', background: '#003E7E' }}
                          >
                            View Ticket ➔
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* RIGHT SIDE NAVIGATION / DRAWER OVERLAY PANEL ON VIEW TICKET CLICK */}
      {showDrawer && activeTicket && (
        <>
          {/* Backdrop Overlay */}
          <div
            onClick={() => setShowDrawer(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.45)',
              backdropFilter: 'blur(2px)',
              zIndex: 1999,
              transition: 'opacity 0.25s ease',
            }}
          />

          {/* Right Slide-Over Panel Container */}
          <aside
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: '740px',
              maxWidth: '92vw',
              background: '#FFFFFF',
              boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.2)',
              zIndex: 2000,
              display: 'flex',
              flexDirection: 'column',
              animation: 'cpSlideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Drawer Header (Sticky Top Bar) */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#F8FAFC',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: '800',
                    color: '#003E7E',
                    background: '#EEF6FF',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                  }}
                >
                  #TK-{activeTicket.id}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '12px',
                    ...getTypeBadgeStyle(activeTicket.requestType),
                  }}
                >
                  {activeTicket.requestType}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                    ...getUrgencyBadgeStyle(activeTicket.urgency),
                  }}
                >
                  Urgency: {activeTicket.urgency}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowDrawer(false)}
                style={{
                  background: '#E2E8F0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '700',
                  color: '#475569',
                }}
                title="Close Ticket View"
              >
                ✕
              </button>
            </div>

            {/* Drawer Body (Scrollable Workspace Content) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Ticket Title & Metadata */}
              <div style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 10px 0', color: '#1E293B' }}>
                  {activeTicket.title}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <span>
                    👤 Raised By: <strong>{activeTicket.raisedBy || activeTicket.customerName}</strong>
                  </span>
                  <span>
                    🛠️ Assigned To: <strong>{activeTicket.assignedTo || 'Techtrole Support Team'}</strong>
                  </span>
                  <span>📅 Raised On: {new Date(activeTicket.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update Control */}
              <div
                style={{
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  background: '#EEF6FF',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  marginBottom: '20px',
                }}
              >
                <span style={{ fontSize: '13px', fontWeight: '700', color: '#003E7E' }}>Update Ticket Status:</span>
                <select
                  className="cp-input"
                  value={activeTicket.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  style={{
                    height: '34px',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderColor: '#003E7E',
                    cursor: 'pointer',
                    width: '160px',
                  }}
                >
                  <option value="raised">Raised</option>
                  <option value="acknowledged">Acknowledged</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="ready">Ready</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              {/* TIMELY TRACKING STATUS STEPPER / TIMELINE */}
              <div
                style={{
                  background: '#F8FAFC',
                  padding: '18px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  marginBottom: '24px',
                }}
              >
                <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#003E7E', margin: '0 0 16px 0' }}>
                  ⏱️ Timely Tracking Status Progress
                </h4>

                <div
                  style={{
                    display: 'flex',
                    justify: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  {['raised', 'acknowledged', 'assigned', 'in_progress', 'ready', 'closed'].map((stageKey, idx) => {
                    const isPassed = activeStageIdx >= idx;
                    const isCurrent = activeTicket.status === stageKey;

                    // Find timestamp from status history log
                    const histItem = (activeTicket.history || []).find((h) => h.to_status === stageKey);
                    const timestampStr = histItem
                      ? new Date(histItem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : null;

                    return (
                      <div
                        key={stageKey}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          flex: 1,
                          minWidth: '80px',
                        }}
                      >
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: isCurrent ? '#003E7E' : isPassed ? '#10B981' : '#CBD5E1',
                            color: '#ffffff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '13px',
                            fontWeight: '700',
                            boxShadow: isCurrent ? '0 0 0 4px rgba(0,62,126,0.25)' : 'none',
                          }}
                        >
                          {isPassed ? '✓' : idx + 1}
                        </div>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: isCurrent ? '800' : '600',
                            color: isCurrent ? '#003E7E' : isPassed ? '#1E293B' : '#94A3B8',
                            marginTop: '6px',
                            textTransform: 'capitalize',
                          }}
                        >
                          {stageKey.replace('_', ' ')}
                        </span>
                        {timestampStr && (
                          <span style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{timestampStr}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TICKET DESCRIPTION & ATTACHMENTS */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0', color: '#1E293B' }}>
                  Description / Issue Details:
                </h4>
                <div
                  style={{
                    background: '#F1F5F9',
                    padding: '16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    color: '#334155',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {activeTicket.description || activeTicket.message || 'No description provided.'}
                </div>

                {/* Attachments list */}
                {(activeTicket.attachments || []).length > 0 && (
                  <div style={{ marginTop: '14px' }}>
                    <h5 style={{ fontSize: '12px', fontWeight: '700', margin: '0 0 8px 0', color: '#475569' }}>
                      📎 Raise Attachments:
                    </h5>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {activeTicket.attachments.map((att, idx) => (
                        <a
                          key={idx}
                          href={att.file_path || att.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '6px 12px',
                            background: '#EEF6FF',
                            color: '#003E7E',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            textDecoration: 'none',
                            border: '1px solid #CBD5E1',
                          }}
                        >
                          📥 {att.file_name || `Attachment #${idx + 1}`}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* COMMENTS THREAD / DISCUSSION FEED */}
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 14px 0', color: '#003E7E' }}>
                  💬 Discussion Comments Thread ({(activeTicket.comments || []).length})
                </h4>

                {/* Comment Feed Messages */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    marginBottom: '16px',
                    paddingRight: '6px',
                  }}
                >
                  {(activeTicket.comments || []).length === 0 ? (
                    <p className="cp-muted" style={{ fontSize: '12px' }}>
                      No comments yet. Be the first to add a reply below.
                    </p>
                  ) : (
                    activeTicket.comments.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          background: c.user_role === 'Developer' ? '#EEF6FF' : '#F8FAFC',
                          padding: '12px 16px',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justify: 'space-between',
                            alignItems: 'center',
                            marginBottom: '6px',
                          }}
                        >
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <strong style={{ fontSize: '13px', color: '#1E293B' }}>{c.user_name}</strong>
                            <span
                              style={{
                                fontSize: '10px',
                                background: '#003E7E',
                                color: '#fff',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: '700',
                              }}
                            >
                              {c.user_role || 'Developer'}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#64748B' }}>
                            {new Date(c.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                          {c.comment_text}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Comment Input Form */}
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="cp-input"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Type a developer reply or comment..."
                    style={{ flex: 1, height: '40px', fontSize: '13px' }}
                  />
                  <button
                    type="submit"
                    className="cp-btn cp-btn-primary"
                    disabled={commentSubmitting || !commentText.trim()}
                    style={{
                      height: '40px',
                      padding: '0 20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      background: '#003E7E',
                      borderColor: '#003E7E',
                    }}
                  >
                    {commentSubmitting ? 'Posting…' : 'Send Comment'}
                  </button>
                </form>
              </div>
            </div>
          </aside>
        </>
      )}
    </div>
  );
}
