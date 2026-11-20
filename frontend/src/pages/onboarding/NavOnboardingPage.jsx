import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/authContext.js';
import { enterpriseApi } from '../../api/enterpriseApi.js';
import { NAV_ICON_OPTIONS } from '../../constants/navIcons.js';
import { PermissionRoute } from '../../routes/PermissionRoute.jsx';
import { RoleMultiSelectDropdown } from '../../components/RoleMultiSelectDropdown.jsx';
import { SearchableOrgSelect } from '../../components/SearchableOrgSelect.jsx';
import { AddIconButton } from '../../components/AddIconButton.jsx';
import { OnboardingEmptyState } from '../../components/OnboardingEmptyState.jsx';
import { PageBreadcrumb } from '../../components/PageBreadcrumb.jsx';
import { IconSelect } from '../../components/IconSelect.jsx';
import { notify } from '../../utils/notify.js';
import { FieldLabel } from '../../components/FieldLabel.jsx';
import { FieldError } from '../../components/FieldError.jsx';
import { formatRolesList, formatRoleName } from '../../utils/displayLabels.js';
import { ConfirmDeleteCard } from '../../components/ConfirmDeleteCard.jsx';
import { validateAll, v } from '../../utils/validation.js';
import { PageSpinner } from '../../components/PageSpinner.jsx';

function parseRolesCsv(csv) {
  if (!csv || !String(csv).trim()) return [];
  return String(csv)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isSysAdminNavRoute(item) {
  const route = String(item?.route || item?.route_path || item?.value || item || '').toLowerCase().trim();
  const page = String(item?.page || item?.label || '').toLowerCase().trim();

  if (route.startsWith('/app/onboarding/') || route.startsWith('/app/platform')) return true;
  if (
    page.includes('onboarding organization') ||
    page.includes('onboarding roles') ||
    page.includes('onboarding admin') ||
    page.includes('onboarding member') ||
    page.includes('onboarding nav') ||
    page.includes('configure navigation')
  ) {
    return true;
  }
  return false;
}

export function NavOnboardingPage() {
  return (
    <PermissionRoute platformOnly>
      <NavOnboardingPageInner />
    </PermissionRoute>
  );
}

function NavOnboardingPageInner() {
  const { token, refreshNavigation } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [organizations, setOrganizations] = useState([]);
  const [roles, setRoles] = useState([]);
  const [standardRoutes, setStandardRoutes] = useState([]);
  const [orgId, setOrgId] = useState(searchParams.get('orgId') ?? '');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [icons, setIcons] = useState(NAV_ICON_OPTIONS);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    id: null,
    label: '',
    icon: 'Circle',
    route: '',
    roleCodes: [],
    position: 'top',
    isActive: true,
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  async function moveItem(index, direction) {
    if (!token || !orgId) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    const reordered = newItems.map((it, i) => ({
      ...it,
      sortOrder: i + 1,
      sort_order: i + 1,
    }));

    setItems(reordered);
    setBusy(true);
    try {
      await enterpriseApi.platformReorderNav(token, orgId, reordered);
      notify.success('Navigation Reordered', 'Updated sort order successfully.');
      if (refreshNavigation) await refreshNavigation();
    } catch (err) {
      notify.apiError(err, 'Reorder failed');
      await loadNav();
    } finally {
      setBusy(false);
    }
  }

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => {
      if (!item) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const labelMatch = String(item.label || '').toLowerCase().includes(q);
        const routeMatch = String(item.route || '').toLowerCase().includes(q);
        if (!labelMatch && !routeMatch) return false;
      }
      if (roleFilter) {
        const rolesVal = item.rolesCsv || item.access_matrix || '';
        if (!rolesVal || !rolesVal.trim() || rolesVal === '*' || rolesVal === 'all') return true;
        const parts = rolesVal.split(',').map((p) => p.trim().toLowerCase()).filter(Boolean);
        return parts.includes(roleFilter.toLowerCase());
      }
      return true;
    });
  }, [items, searchQuery, roleFilter]);

  const loadOrgs = useCallback(async () => {
    if (!token) return;
    try {
      const res = await enterpriseApi.platformOrganizations(token);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.organizations)
        ? res.organizations
        : Array.isArray(res)
        ? res
        : [];
      setOrganizations(list);
      if (!orgId && list.length > 0) {
        const firstId = list[0].id || list[0].org_code || list[0].code;
        setOrgId(String(firstId));
      }
    } catch {
      setOrganizations([]);
    }
  }, [token, orgId]);

  const loadRoutes = useCallback(async () => {
    if (!token) return;
    try {
      const res = await enterpriseApi.platformRoutes(token);
      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.routes)
        ? res.routes
        : Array.isArray(res)
        ? res
        : [];
      const tenantRoutes = list.filter((r) => !isSysAdminNavRoute(r));
      setStandardRoutes(
        tenantRoutes.map((r) => ({
          id: r.id,
          page: r.page || r.label,
          route: r.route || r.route_path,
          value: r.route || r.route_path,
          label: r.page || r.label,
        }))
      );
    } catch {
      setStandardRoutes([]);
    }
  }, [token]);

  const loadRoles = useCallback(async () => {
    if (!token || !orgId) {
      setRoles([]);
      return;
    }
    setRoles([]);
    let orgRolesList = [];
    try {
      const res = await enterpriseApi.platformOrgRoles(token, orgId);
      if (res.roles?.length || res.data?.length) {
        orgRolesList = res.roles ?? res.data ?? [];
      }
    } catch {
      /* fall through */
    }
    if (!orgRolesList.length) {
      try {
        const res = await enterpriseApi.platformAssignableRoles(token, orgId);
        orgRolesList = res.roles ?? res.data ?? [];
      } catch {
        orgRolesList = [];
      }
    }
    const combined = [];
    for (const r of orgRolesList) {
      if (r.code !== 'sys_admin' && r.code !== 'super_admin') {
        if (!combined.some((c) => c.code === r.code)) {
          combined.push(r);
        }
      }
    }
    setRoles(combined);
  }, [token, orgId]);

  const loadNav = useCallback(async () => {
    if (!token || !orgId) {
      setItems([]);
      return;
    }
    setItems([]);
    setLoading(true);
    try {
      const res = await enterpriseApi.platformNav(token, orgId);
      setItems(res.items ?? []);
    } catch (e) {
      notify.apiError(e, 'Failed to load nav');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [token, orgId]);

  useEffect(() => {
    loadOrgs();
    loadRoutes();
    if (token) {
      enterpriseApi
        .platformNavIcons(token)
        .then((res) => {
          const list = res.icons || res.data || [];
          if (list.length) setIcons(list);
        })
        .catch(() => {});
    }
  }, [loadOrgs, loadRoutes, token]);

  useEffect(() => {
    resetForm();
    setRoleFilter('');
    if (orgId) {
      setSearchParams({ orgId }, { replace: true });
      loadRoles();
      loadNav();
    } else {
      setRoles([]);
      setItems([]);
    }
  }, [orgId, loadRoles, loadNav, setSearchParams]);

  function resetForm() {
    setEditingId(null);
    setForm({
      id: null,
      label: '',
      icon: 'Circle',
      route: '',
      roleCodes: [],
      position: 'top',
      isActive: true,
    });
    setFieldErrors({});
  }

  function startEdit(item) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      label: item.label,
      icon: item.icon || 'Circle',
      route: item.route,
      roleCodes: parseRolesCsv(item.rolesCsv || item.access_matrix),
      position: item.position === 'bottom' ? 'bottom' : 'top',
      isActive: item.isActive !== false && item.isActive !== 0,
    });
  }

  async function onSaveItem(e) {
    e.preventDefault();
    if (!token || !orgId) return;
    const next = {
      label: v.name(form.label, 'Label', 80),
      route: v.route(form.route),
    };
    setFieldErrors(next);
    const err = validateAll([() => next.label, () => next.route]);
    if (err) {
      notify.formWarning(err);
      return;
    }
    const isDuplicate = items.some(
      (item) =>
        item.id !== form.id &&
        String(item.label).trim().toLowerCase() === String(form.label).trim().toLowerCase()
    );
    if (isDuplicate) {
      notify.warning('Duplicate Label', 'A nav item with this menu label already exists.');
      return;
    }

    // Auto-assign next sort order rank in background if creating new item
    const existingItem = items.find((i) => i.id === form.id);
    const sortOrder = existingItem
      ? (existingItem.sortOrder ?? existingItem.sort_order ?? 1)
      : items.length + 1;

    setBusy(true);
    try {
      const rolesCsv = form.roleCodes.length ? form.roleCodes.join(',') : null;
      await enterpriseApi.platformUpsertNav(token, orgId, {
        id: form.id ?? undefined,
        label: form.label,
        icon: form.icon,
        route: form.route,
        sortOrder,
        sort_order: sortOrder,
        rolesCsv,
        position: form.position,
        isActive: form.isActive,
      });
      notify.success(editingId ? 'Nav Updated' : 'Nav Added', form.label);
      resetForm();
      await loadNav();
      if (refreshNavigation) await refreshNavigation();
    } catch (err) {
      notify.apiError(err, 'Save failed');
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelete() {
    const item = pendingDelete;
    if (!token || !orgId || !item) return;
    setBusy(true);
    try {
      await enterpriseApi.platformDeleteNav(token, orgId, item.id);
      notify.success('Nav Deleted', item.label);
      if (editingId === item.id) resetForm();
      setPendingDelete(null);
      await loadNav();
    } catch (err) {
      notify.apiError(err, 'Delete failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cp-stack cp-stack--fill">
      <PageBreadcrumb current="Onboarding Nav Items" />
      <div className="cp-page-head">
        <div>
          <h1 className="cp-page-title">Onboarding Nav Items</h1>
          <p className="cp-page-lead">Pick an organization and assign menu links to roles.</p>
        </div>
        <div>
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={() => {
              loadOrgs();
              if (orgId) {
                loadRoles();
                loadNav();
              }
              notify.info('Refreshed', 'List updated.');
            }}
          >
            Refresh
          </button>
        </div>
      </div>

      <section className="cp-card cp-card-pad cp-card--overflow-visible">
        <SearchableOrgSelect organizations={organizations} value={orgId} onChange={setOrgId} label="Organization" />

        {!orgId && (
          <OnboardingEmptyState
            fill
            title="Select An Organization"
            description="Choose an organization from the dropdown above to manage navigation."
          />
        )}

        {orgId && loading && (
          <div style={{ marginTop: '20px' }}>
            <PageSpinner />
          </div>
        )}
      </section>

      {orgId && !loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start', marginTop: '24px' }}>
          {/* Left Card: Add / Edit Nav Item Form */}
          <section className="cp-card cp-card-pad">
            <form onSubmit={onSaveItem} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 className="cp-section-title cp-section-title--in-card" style={{ margin: 0 }}>
                {editingId ? 'Edit Nav Item' : 'Add Nav Item'}
              </h2>
              <label className="cp-field">
                <FieldLabel required>Menu Label</FieldLabel>
                <input
                  className="cp-input"
                  value={form.label}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, label: e.target.value }));
                    if (fieldErrors.label) setFieldErrors((x) => ({ ...x, label: null }));
                  }}
                  maxLength={80}
                  placeholder="Enter menu label"
                />
                <FieldError message={fieldErrors.label} />
              </label>

              <label className="cp-field">
                <FieldLabel required>Page Link</FieldLabel>
                <select
                  className="cp-input"
                  value={form.route}
                  onChange={(e) => {
                    const selectedVal = e.target.value;
                    const found = standardRoutes.find((r) => String(r.id) === String(selectedVal) || r.route === selectedVal);
                    setForm((f) => ({
                      ...f,
                      route: found ? found.route : selectedVal,
                      route_id: found ? found.id : null,
                    }));
                    if (fieldErrors.route) setFieldErrors((x) => ({ ...x, route: null }));
                  }}
                >
                  <option value="">-- Select Page Link --</option>
                  {standardRoutes.map((r) => (
                    <option key={r.id || r.value} value={r.value}>
                      {r.page || r.label}
                    </option>
                  ))}
                  {form.route && !isSysAdminNavRoute(form.route) && !standardRoutes.some((r) => r.value === form.route) && (
                    <option value={form.route}>{form.route}</option>
                  )}
                </select>
                <FieldError message={fieldErrors.route} />
              </label>

              <IconSelect icons={icons} value={form.icon} onChange={(icon) => setForm((f) => ({ ...f, icon }))} />

              <label className="cp-field">
                <FieldLabel required>Position</FieldLabel>
                <select
                  className="cp-input"
                  value={form.position}
                  onChange={(e) => setForm((f) => ({ ...f, position: e.target.value }))}
                >
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                </select>
              </label>

              <div>
                <RoleMultiSelectDropdown
                  roles={roles}
                  selectedCodes={form.roleCodes}
                  onChange={(roleCodes) => setForm((f) => ({ ...f, roleCodes }))}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                {editingId && (
                  <button
                    type="button"
                    className="cp-btn cp-btn-secondary"
                    style={{ height: 42, padding: '0 20px' }}
                    onClick={resetForm}
                  >
                    Cancel
                  </button>
                )}
                {editingId ? (
                  <button
                    type="submit"
                    className="cp-btn cp-btn-primary"
                    style={{ height: 42, padding: '0 20px' }}
                    disabled={busy}
                  >
                    {busy ? 'Saving…' : 'Save Nav Item'}
                  </button>
                ) : (
                  <AddIconButton
                    label="Add Nav Item"
                    busyLabel="Saving…"
                    busy={busy}
                  />
                )}
              </div>
            </form>
          </section>

          {/* Right Card: Current Nav Items Table */}
          <section className="cp-card cp-card-pad">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h2 className="cp-section-title cp-section-title--in-card" style={{ margin: 0 }}>Current Nav Items</h2>
              {items.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    className="cp-input"
                    placeholder="Search menu label..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: '180px', height: '36px', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="cp-field-label" style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: 'var(--cp-text-muted)' }}>Filter:</span>
                    <select
                      className="cp-input"
                      style={{ width: '140px', height: '36px', fontSize: '13px' }}
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="">All Roles</option>
                      {roles.map((r) => (
                        <option key={r.code} value={r.code}>
                          {formatRoleName(r.code, r.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {items.length === 0 ? (
              <p className="cp-muted">No nav items configured for this organization.</p>
            ) : (
              <div className="cp-accounts-table-wrap">
                <table className="cp-accounts-table">
                  <thead>
                    <tr>
                      <th style={{ width: '70px', textAlign: 'center' }}>Order</th>
                      <th>Menu Label</th>
                      <th>Position</th>
                      <th>Page Link</th>
                      <th>Roles Visibility</th>
                      <th style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'var(--cp-text-muted)' }}>
                          No nav items matching filter or search.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item) => {
                        const realIndex = items.findIndex((i) => i.id === item.id);
                        return (
                          <tr key={item.id}>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '2px' }}>
                                <button
                                  type="button"
                                  className="cp-btn-icon"
                                  onClick={() => moveItem(realIndex, 'up')}
                                  disabled={realIndex <= 0 || busy}
                                  title="Move Up"
                                  style={{ opacity: realIndex <= 0 ? 0.3 : 1, padding: '2px 5px', fontSize: '12px' }}
                                >
                                  ▲
                                </button>
                                <button
                                  type="button"
                                  className="cp-btn-icon"
                                  onClick={() => moveItem(realIndex, 'down')}
                                  disabled={realIndex >= items.length - 1 || busy}
                                  title="Move Down"
                                  style={{ opacity: realIndex >= items.length - 1 ? 0.3 : 1, padding: '2px 5px', fontSize: '12px' }}
                                >
                                  ▼
                                </button>
                              </div>
                            </td>
                            <td style={{ fontWeight: 600 }}>{item.label}</td>
                            <td>{item.position === 'bottom' ? 'Bottom' : 'Top'}</td>
                            <td><code>{item.route}</code></td>
                            <td>
                              {(() => {
                                const rolesStr = item.rolesCsv || item.access_matrix;
                                if (!rolesStr || !rolesStr.trim()) return 'All roles';
                                const cleanCsv = rolesStr
                                  .split(',')
                                  .map((r) => r.trim())
                                  .filter((r) => r !== 'sys_admin' && r !== 'super_admin')
                                  .join(',');
                                return formatRolesList(cleanCsv, roles);
                              })()}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                                <button
                                  type="button"
                                  className="cp-btn-icon"
                                  onClick={() => startEdit(item)}
                                  aria-label={`Edit ${item.label}`}
                                  title="Edit nav item"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
                                    <path
                                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </button>
                                <button
                                  type="button"
                                  className="cp-btn-icon cp-btn-icon--danger"
                                  onClick={() => setPendingDelete(item)}
                                  aria-label={`Delete ${item.label}`}
                                  title="Delete nav item"
                                >
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {pendingDelete ? (
        <ConfirmDeleteCard
          title="Delete this nav item?"
          message={`"${pendingDelete.label}" will be removed.`}
          busy={busy}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      ) : null}
    </div>
  );
}

export default NavOnboardingPage;
