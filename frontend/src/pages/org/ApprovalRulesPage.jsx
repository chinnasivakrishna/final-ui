import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { PermissionRoute } from '../../routes/PermissionRoute.jsx';
import { PERMISSIONS } from '../../constants/permissions.js';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { AddIconButton } from '../../components/AddIconButton.jsx';
import { OnboardingEmptyState } from '../../components/OnboardingEmptyState.jsx';
import { notify } from '../../utils/notify.js';
import { FieldLabel } from '../../components/FieldLabel.jsx';
import { formatRoleName, formatRolesList } from '../../utils/displayLabels.js';
import { ConfirmDeleteCard } from '../../components/ConfirmDeleteCard.jsx';
import { validateAll } from '../../utils/validation.js';
import { SearchableSelect } from '../../components/SearchableSelect.jsx';

const EMPTY_FORM = {
  id: null,
  resource: '',
  makerRole: [],
  checkerRole: [],
  isActive: true,
};

const DEFAULT_NAV_ITEMS = [
  { route: '/app/org/users', label: 'Add Users' },
  { route: '/app/products', label: 'Products & Catalog' },
  { route: '/app/seo', label: 'SEO Management' },
  { route: '/app/blog', label: 'Blog Management' },
  { route: '/app/careers', label: 'Careers & Jobs' },
  { route: '/app/catalogs', label: 'Catalogs' },
  { route: '/app/events', label: 'Events & Achievements' },
  { route: '/app/web-responses', label: 'Web Responses' },
  { route: '/app/accounts', label: 'Accounts / Organization Users' },
  { route: '/app/customer-requests', label: 'Customer Requests' },
];

const DEFAULT_ROLES = [
  { code: 'organization_admin', name: 'Organization Admin' },
  { code: 'super_admin', name: 'Super Admin' },
  { code: 'sys_admin', name: 'System Admin' },
  { code: 'manager', name: 'Manager' },
  { code: 'super_employee', name: 'Super Employee' },
  { code: 'employee', name: 'Employee' },
  { code: 'viewer', name: 'Viewer' },
];

export function ApprovalRulesPage() {
  return (
    <PermissionRoute permission={PERMISSIONS.ORG_APPROVAL_RULES}>
      <ApprovalRulesPageInner />
    </PermissionRoute>
  );
}

function ApprovalRulesPageInner() {
  const { token, user } = useAuth();
  const [rules, setRules] = useState([]);
  const [roles, setRoles] = useState([]);
  const [navItems, setNavItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [pendingDelete, setPendingDelete] = useState(null);

  const activeNavItems = useMemo(() => {
    if (Array.isArray(navItems) && navItems.length > 0) {
      return navItems.map((item) => ({
        route: item.route || item.path,
        label: item.label || item.title || item.name || item.route,
      }));
    }
    return DEFAULT_NAV_ITEMS;
  }, [navItems]);

  const availableRoles = useMemo(() => {
    return Array.isArray(roles) ? roles : [];
  }, [roles]);

  const getResourceLabel = useCallback((value) => {
    const found = activeNavItems.find((item) => item.route === value);
    return found ? found.label : value;
  }, [activeNavItems]);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      console.log('[ApprovalRules] Fetching rules & roles for org_code:', user?.org_code || user?.orgCode || 'current user org');
      const [rulesRes, rolesRes, navRes] = await Promise.all([
        enterpriseApi.orgApprovalRules(token),
        enterpriseApi.orgRoles(token),
        enterpriseApi.orgNavigation(token).catch(() => ({ items: [] })),
      ]);
      const fetchedNav = (navRes.items ?? []).filter((item) => {
        const r = String(item.route ?? '').trim().toLowerCase();
        if (r.includes('dashboard') || r.includes('profile')) return false;
        if (r.startsWith('/app/onboarding') || r.startsWith('/app/platform')) return false;
        return true;
      });
      console.log('[ApprovalRules] Loaded roles from DB:', rolesRes.roles ?? rolesRes.data ?? []);
      setNavItems(fetchedNav);
      setRules(rulesRes.rules ?? []);
      setRoles(rolesRes.roles ?? rolesRes.data ?? []);
    } catch (e) {
      notify.apiError(e, 'Failed to load approval rules');
    }
  }, [token, user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (activeNavItems.length && !form.resource) {
      setForm((f) => ({ ...f, resource: activeNavItems[0].route }));
    }
  }, [activeNavItems, form.resource]);

  const selectedMakers = useMemo(() => {
    return Array.isArray(form.makerRole)
      ? form.makerRole
      : String(form.makerRole || '').split(',').map((s) => s.trim()).filter(Boolean);
  }, [form.makerRole]);

  const selectedCheckers = useMemo(() => {
    return Array.isArray(form.checkerRole)
      ? form.checkerRole
      : String(form.checkerRole || '').split(',').map((s) => s.trim()).filter(Boolean);
  }, [form.checkerRole]);

  const submitterRoleOptions = useMemo(() => {
    return availableRoles.map((r) => {
      const isDisabled = selectedCheckers.includes(r.code);
      return {
        value: r.code,
        label: formatRoleName(r.code, r.name),
        disabled: isDisabled,
        subLabel: isDisabled ? '(Selected as Approver)' : undefined,
      };
    });
  }, [availableRoles, selectedCheckers]);

  const approverRoleOptions = useMemo(() => {
    return availableRoles.map((r) => {
      const isDisabled = selectedMakers.includes(r.code);
      return {
        value: r.code,
        label: formatRoleName(r.code, r.name),
        disabled: isDisabled,
        subLabel: isDisabled ? '(Selected as Submitter)' : undefined,
      };
    });
  }, [availableRoles, selectedMakers]);

  function resetForm() {
    setEditingId(null);
    setForm({
      ...EMPTY_FORM,
      resource: activeNavItems[0]?.route || '/app/org/users',
    });
  }

  function startEdit(rule) {
    setEditingId(rule.id);
    setForm({
      id: rule.id,
      resource: rule.resource,
      makerRole: Array.isArray(rule.makerRole) ? rule.makerRole : String(rule.makerRole || '').split(',').map((s) => s.trim()).filter(Boolean),
      checkerRole: Array.isArray(rule.checkerRole) ? rule.checkerRole : String(rule.checkerRole || '').split(',').map((s) => s.trim()).filter(Boolean),
      isActive: rule.isActive !== false && rule.isActive !== 0,
    });
  }

  function cancelEdit() {
    resetForm();
  }

  async function onSave(e) {
    e.preventDefault();
    if (!token) return;

    if (!selectedMakers.length || !selectedCheckers.length) {
      notify.formWarning('Please select at least one Submitted by role and one Approved by role.');
      return;
    }

    const overlap = selectedMakers.filter((r) => selectedCheckers.includes(r));
    if (overlap.length > 0) {
      const overlapNames = overlap.map((r) => formatRoleName(r)).join(', ');
      notify.warning('Invalid Rule Pair', `Submitted by and Approved by cannot contain the same roles (${overlapNames}).`);
      return;
    }

    setBusy(true);
    try {
      await enterpriseApi.orgUpsertApprovalRule(token, {
        id: form.id ?? undefined,
        resource: form.resource,
        makerRole: selectedMakers,
        checkerRole: selectedCheckers,
        isActive: form.isActive,
      });
      notify.success(editingId ? 'Rule updated' : 'Rule added', getResourceLabel(form.resource));
      resetForm();
      await load();
    } catch (err) {
      notify.apiError(err, 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    const rule = pendingDelete;
    if (!token || !rule) return;
    setBusy(true);
    try {
      await enterpriseApi.orgDeleteApprovalRule(token, rule.id);
      notify.success('Rule deleted', getResourceLabel(rule.resource));
      if (editingId === rule.id) cancelEdit();
      setPendingDelete(null);
      await load();
    } catch (err) {
      notify.apiError(err, 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-stack">
      <PageBreadcrumb current="Onboarding Rules to Roles" />
      <div className="cp-page-head">
        <div>
          <h1 className="cp-page-title">Onboarding Rules to Roles</h1>
          <p className="cp-page-lead">Maker and checker role pairs for this organization.</p>
        </div>
        <button
          type="button"
          className="cp-btn cp-btn-secondary"
          onClick={() => {
            load();
            notify.info('Refreshed', 'List updated.');
          }}
          disabled={busy}
        >
          Refresh
        </button>
      </div>
      <section className="cp-card cp-card-pad">
        <h2 className="cp-section-title">{editingId ? 'Edit Rule' : 'Add Rule'}</h2>
        <form onSubmit={onSave}>
          <div className={editingId ? 'cp-grid cp-grid-2' : 'cp-grid-rules-inline'}>
            <label className="cp-field">
              <FieldLabel required>Content type</FieldLabel>
              <SearchableSelect
                options={activeNavItems.map((item) => ({ value: item.route, label: item.label }))}
                value={form.resource}
                onChange={(val) => setForm((f) => ({ ...f, resource: val }))}
                placeholder="-- Search Content Type --"
                disabled={false}
              />
            </label>
            <label className="cp-field">
              <FieldLabel required>Submitted by</FieldLabel>
              <SearchableSelect
                isMulti={true}
                options={submitterRoleOptions}
                value={form.makerRole}
                onChange={(val) => setForm((f) => ({ ...f, makerRole: val }))}
                placeholder="-- Search Submitter Roles --"
                disabled={false}
              />
            </label>
            <label className="cp-field">
              <FieldLabel required>Approved by</FieldLabel>
              <SearchableSelect
                isMulti={true}
                options={approverRoleOptions}
                value={form.checkerRole}
                onChange={(val) => setForm((f) => ({ ...f, checkerRole: val }))}
                placeholder="-- Search Approver Roles --"
                disabled={false}
              />
            </label>
            {editingId ? (
              <label className="cp-field cp-field--checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                />
                <span>Active</span>
              </label>
            ) : (
              <div className="cp-field cp-field--action">
                <span className="cp-field-label-gutter" aria-hidden="true">
                  &nbsp;
                </span>
                <AddIconButton
                  label="Add Rule"
                  busyLabel="Adding…"
                  busy={busy}
                  disabled={false}
                />
              </div>
            )}
          </div>
          {editingId ? (
            <div className="cp-row" style={{ marginTop: 12 }}>
              <button type="submit" className="cp-btn cp-btn-primary" disabled={busy}>
                Save changes
              </button>
              <button type="button" className="cp-btn cp-btn-secondary" onClick={cancelEdit} disabled={busy}>
                Cancel
              </button>
            </div>
          ) : null}
        </form>

        <h2 className="cp-section-title cp-section-title--divider">Current Rules</h2>
        {rules.length === 0 ? (
          <OnboardingEmptyState
            title="No Rules Yet"
            description="Add a rule above to link content types with submitter and approver roles."
          />
        ) : (
          <ul className="cp-notify-list">
            {rules.map((r) => (
              <li key={r.id} className="cp-notify-item">
                <div>
                  <div className="cp-notify-title">{getResourceLabel(r.resource)}</div>
                  <div className="cp-muted">
                    {formatRolesList(r.makerRole, availableRoles)} → {formatRolesList(r.checkerRole, availableRoles)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', alignItems: 'center' }}>
                  <span className={`cp-tag cp-tag-${r.isActive ? 'success' : 'info'}`}>
                    {r.isActive ? 'active' : 'off'}
                  </span>
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    disabled={busy}
                    onClick={() => startEdit(r)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="cp-btn cp-btn-danger"
                    disabled={busy}
                    onClick={() => setPendingDelete(r)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pendingDelete ? (
        <ConfirmDeleteCard
          title="Delete this rule?"
          message={`Approval rule for "${getResourceLabel(pendingDelete.resource)}" will be removed.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
}
