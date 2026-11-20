import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext.js';
import { ProfileBrandingEditor } from './ProfileBrandingEditor.jsx';
import { roleMatchesCsv } from '../utils/roleAccess.js';
import { formatRoleName } from '../utils/displayLabels.js';
import { enterpriseApi } from '../api/enterpriseApi.js';
import { notify } from '../utils/notify.js';
import { PageBreadcrumb } from '../components/PageBreadcrumb.jsx';
import { SidebarNavIcon } from '../components/SidebarNavIcon.jsx';

const BRANDING_EDITORS = 'super_admin,sys_admin';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, activeOrganization, branding, token, refreshSession } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  const brandingKey = `${activeOrganization?.id ?? ''}-${branding?.appName ?? ''}-${branding?.logoUrl ?? ''}-${branding?.logoProfile ?? ''}`;

  async function onChangePassword(e) {
    e.preventDefault();
    if (!token) return;
    if (newPassword !== confirmPassword) {
      notify.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      notify.error('New password must be at least 6 characters long');
      return;
    }
    setSavingPassword(true);
    try {
      await enterpriseApi.changePassword(token, { oldPassword, newPassword });
      notify.success('Password updated successfully');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      notify.apiError(err, 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  }

  // Release / Go For Live state
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [loadingReady, setLoadingReady] = useState(false);
  const [readyData, setReadyData] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [publishing, setPublishing] = useState(false);
  const [reverting, setReverting] = useState(false);

  const rawRole = String(activeOrganization?.roleCode || activeOrganization?.roleLabel || user?.roleCode || user?.role || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
  const canGoLive = rawRole === 'org_admin' || rawRole === 'organization_admin' || rawRole === 'admin' || rawRole === 'super_admin' || rawRole === 'sys_admin' || roleMatchesCsv(activeOrganization?.roleCode, 'org_admin,organization_admin,admin,sys_admin,super_admin');
  const canEditBranding = rawRole === 'org_admin' || rawRole === 'organization_admin' || rawRole === 'super_admin' || rawRole === 'sys_admin' || roleMatchesCsv(activeOrganization?.roleCode, BRANDING_EDITORS);

  useEffect(() => {
    if (!token || !canGoLive) return;
    enterpriseApi.getReadyForReleaseItems(token)
      .then((res) => {
        setReadyData(res.data);
        if (res.data?.allItems) {
          setSelectedItems(res.data.allItems.map((item) => `${item.type}:${item.id}`));
        }
      })
      .catch(() => {});
  }, [token, canGoLive]);

  async function openReleaseModal() {
    if (!token) return;
    setLoadingReady(true);
    setShowReleaseModal(true);
    try {
      const res = await enterpriseApi.getReadyForReleaseItems(token);
      setReadyData(res.data);
      if (res.data?.allItems) {
        setSelectedItems(res.data.allItems.map((item) => `${item.type}:${item.id}`));
      }
    } catch (err) {
      notify.apiError(err, 'Failed to fetch release items');
    } finally {
      setLoadingReady(false);
    }
  }

  function toggleSelectItem(key) {
    setSelectedItems((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  function toggleSelectAll() {
    if (!readyData?.allItems) return;
    if (selectedItems.length === readyData.allItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(readyData.allItems.map((item) => `${item.type}:${item.id}`));
    }
  }

  async function onExecuteGoLive() {
    if (!token) return;
    setPublishing(true);
    try {
      const res = await enterpriseApi.goLiveRelease(token, selectedItems);
      notify.success(`Successfully published ${res.data?.syncedCount ?? 0} items live! Backup snapshot created.`);
      setShowReleaseModal(false);
      setReadyData(null);
    } catch (err) {
      notify.apiError(err, 'Go to Live is failed');
    } finally {
      setPublishing(false);
    }
  }

  async function onRevertLastRelease() {
    if (!token) return;
    if (!window.confirm('Are you sure you want to revert the last website release? This will restore previous published states.')) {
      return;
    }
    setReverting(true);
    try {
      const res = await enterpriseApi.rollbackRelease(token);
      notify.success(res.message || 'Successfully reverted last release');
    } catch (err) {
      notify.apiError(err, 'Failed to revert release');
    } finally {
      setReverting(false);
    }
  }

  return (
    <div className="cp-stack">
      <PageBreadcrumb current="Profile" />
      <h1 className="cp-page-title">Profile</h1>
      <p className="cp-page-lead">Your account and company appearance (where permitted).</p>

      <section className="cp-card cp-card-pad">
        <div className="cp-profile-row">
          <div className="cp-profile-row__name">
            <div className="cp-card-kicker">Full name</div>
            <div className="cp-profile-value">{user?.displayName ?? '—'}</div>
          </div>
          <div className="cp-profile-row__email">
            <div className="cp-card-kicker">Email</div>
            <div className="cp-profile-value">{user?.email ?? '—'}</div>
          </div>
          <div className="cp-profile-row__role">
            <div className="cp-card-kicker">Your role</div>
            <div className="cp-profile-value">
              {formatRoleName(activeOrganization?.roleCode, activeOrganization?.roleName)}
            </div>
          </div>
        </div>
      </section>

      {canGoLive ? (
        <section className="cp-card cp-card-pad" style={{ marginTop: '24px', borderLeft: '4px solid #16a34a' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 className="cp-section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <SidebarNavIcon name="Rocket" />
                  <span>Production Website Release ("Go For Live")</span>
                </h2>
                <span className={`cp-tag ${(readyData?.allItems?.length || 0) > 0 ? 'cp-tag-warning' : 'cp-tag-success'}`} style={{ fontWeight: '700', fontSize: '11px' }}>
                  {(readyData?.allItems?.length || 0) > 0 ? `${readyData.allItems.length} Ready To Live` : 'All Content Live'}
                </span>
              </div>
              <p className="cp-page-lead" style={{ margin: '6px 0 0 0', fontSize: '13px' }}>
                Publish approved products, categories, blogs, catalogs, and content from <code>taiton_cpanel</code> to the live website (<code>web_schema</code>) with automated undo logs and instant rollback.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="cp-btn cp-btn-secondary"
                onClick={() => navigate('/app/release')}
                style={{ fontWeight: '600' }}
              >
                📊 Release Dashboard & Manifest
              </button>
              <button
                type="button"
                className="cp-btn"
                style={{ border: '1px solid var(--cp-border)', color: 'var(--cp-text-muted)' }}
                onClick={onRevertLastRelease}
                disabled={reverting}
              >
                {reverting ? 'Reverting…' : '⏪ Revert Last Release'}
              </button>
              <button
                type="button"
                className="cp-btn cp-btn-primary"
                onClick={openReleaseModal}
                style={{ backgroundColor: '#0f172a', fontWeight: '600' }}
              >
                <SidebarNavIcon name="Rocket" style={{ width: 16, height: 16, marginRight: 6 }} />
                Go For Live {(readyData?.allItems?.length || 0) > 0 ? `(${readyData.allItems.length})` : ''}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className="cp-card cp-card-pad" style={{ marginTop: '24px' }}>
        <h2 className="cp-section-title">Change Password</h2>
        <p className="cp-page-lead" style={{ marginBottom: '20px' }}>Update your account password.</p>

        <form onSubmit={onChangePassword} className="cp-branding-form" style={{ width: '100%', maxWidth: 'none' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <label className="cp-field" style={{ flex: '1 1 200px' }}>
              <span>Old Password</span>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                placeholder="Enter current password"
              />
            </label>
            <label className="cp-field" style={{ flex: '1 1 200px' }}>
              <span>New Password</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </label>
            <label className="cp-field" style={{ flex: '1 1 200px' }}>
              <span>Confirm New Password</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm new password"
              />
            </label>
            <div style={{ flex: '0 0 auto' }}>
              <button
                type="submit"
                className="cp-btn cp-btn-primary"
                style={{ margin: 0, height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                disabled={savingPassword}
              >
                {savingPassword ? 'Updating…' : 'Update Password'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {canEditBranding ? (
        <ProfileBrandingEditor
          key={brandingKey}
          branding={branding}
          activeOrganization={activeOrganization}
          token={token}
          refreshSession={refreshSession}
        />
      ) : null}

      {/* Go For Live Release Modal */}
      {showReleaseModal ? (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="cp-card" style={{
            width: '100%',
            maxWidth: '680px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px',
            background: 'var(--cp-surface-elevated, #ffffff)',
            borderRadius: 'var(--cp-radius-md, 8px)',
            border: '1px solid var(--cp-border)',
            boxShadow: 'var(--cp-shadow)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--cp-border)', paddingBottom: '14px' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cp-primary-muted)' }}>
                <SidebarNavIcon name="Rocket" />
                <span>Go For Live - Release Manager</span>
              </h2>
              <button
                onClick={() => setShowReleaseModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--cp-text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                aria-label="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <p style={{ color: 'var(--cp-text-muted)', fontSize: '0.875rem', marginBottom: '16px', lineHeight: 1.5 }}>
              Select the approved items you want to sync to the live website. The system will automatically generate a database snapshot before publishing.
            </p>

            {loadingReady ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--cp-text-muted)' }}>Loading items ready for release…</div>
            ) : readyData?.allItems?.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', background: 'var(--cp-surface)', borderRadius: 'var(--cp-radius-sm)', border: '1px dashed var(--cp-border)' }}>
                <p style={{ fontWeight: 600, color: 'var(--cp-primary-muted)', margin: '0 0 4px 0' }}>No Items Ready to Go Live</p>
                <span style={{ fontSize: '0.85rem', color: 'var(--cp-text-muted)' }}>Ensure items are approved by checkers (status set to <code>ready_to_live</code>).</span>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', background: 'var(--cp-surface)', padding: '10px 14px', borderRadius: 'var(--cp-radius-sm)', border: '1px solid var(--cp-border)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', color: 'var(--cp-primary-muted)' }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.length === (readyData?.allItems?.length || 0)}
                      onChange={toggleSelectAll}
                    />
                    Select All ({selectedItems.length} / {readyData?.allItems?.length || 0} selected)
                  </label>
                  <span style={{ fontSize: '0.8rem', color: 'var(--cp-text-muted)' }}>{readyData?.total || 0} Total Ready Items</span>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--cp-border)', borderRadius: 'var(--cp-radius-sm)', padding: '8px 12px', marginBottom: '16px' }}>
                  {readyData?.allItems?.map((item) => {
                    const itemKey = `${item.type}:${item.id}`;
                    const isChecked = selectedItems.includes(itemKey);
                    return (
                      <div key={itemKey} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 8px', borderBottom: '1px solid var(--cp-border)' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectItem(itemKey)}
                          />
                          <div>
                            <span style={{ fontWeight: 600, color: 'var(--cp-primary-muted)', fontSize: '0.9rem' }}>{item.name}</span>
                            <div style={{ fontSize: '0.78rem', color: 'var(--cp-text-muted)' }}>{item.summary || item.type}</div>
                          </div>
                        </label>
                        <span style={{
                          textTransform: 'uppercase',
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          letterSpacing: '0.04em',
                          background: 'var(--cp-surface)',
                          color: 'var(--cp-text-muted)',
                          border: '1px solid var(--cp-border)'
                        }}>
                          {item.type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '14px', borderTop: '1px solid var(--cp-border)' }}>
              <button
                type="button"
                className="cp-btn"
                style={{ border: '1px solid var(--cp-border)' }}
                onClick={() => setShowReleaseModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="cp-btn cp-btn-primary"
                onClick={onExecuteGoLive}
                disabled={publishing || selectedItems.length === 0}
              >
                {publishing ? 'Publishing Live…' : `Publish Selected (${selectedItems.length})`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

