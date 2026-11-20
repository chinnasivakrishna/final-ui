/**
 * Single module: API base URL, route paths, HTTP helper, and domain calls.
 * Keeps fetch logic centralized so routes and components stay thin.
 */

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) ||
  '';

/** Logical paths (relative to API_BASE) formatted as /cpanel-api/ */
export const API_PATHS = {
  health: '/cpanel-api/health',
  public: {
    branding: '/cpanel-api/public/branding',
  },
  auth: {
    login: '/cpanel-api/auth/login',
    me: '/cpanel-api/auth/me',
    session: '/cpanel-api/auth/session',
    logout: '/cpanel-api/auth/logout',
    sessionExpired: '/cpanel-api/auth/session-expired',
  },
  dashboard: {
    summary: '/cpanel-api/dashboard/summary',
  },
  notifications: {
    list: '/cpanel-api/notifications',
    read: (id) => `/cpanel-api/notifications/${id}/read`,
    readAll: '/cpanel-api/notifications/read-all',
  },
  navigation: {
    list: '/cpanel-api/navigation',
  },
  org: {
    branding: '/cpanel-api/org/branding',
    brandingLogo: '/cpanel-api/org/branding/logo',
    config: '/cpanel-api/org/config',
    configKey: (key) => `/cpanel-api/org/config/${key}`,
    approvalRules: '/cpanel-api/org/approval-rules',
  },
  admin: {
    roles: '/cpanel-api/admin/roles',
    actors: '/cpanel-api/admin/actors',
    actorsExport: '/cpanel-api/admin/actors/export',
  },
  platform: {
    base: '/cpanel-api/platform',
    orgNav: (orgId) => `/cpanel-api/platform/organizations/${orgId}/nav`,
    orgAdmin: (orgId) => `/cpanel-api/platform/organizations/${orgId}/org-admin`,
    orgAdmins: (orgId) => `/cpanel-api/platform/organizations/${orgId}/org-admins`,
    orgAdminUser: (orgId, userId) => `/cpanel-api/platform/organizations/${orgId}/org-admins/${userId}`,
  },
  customerRequests: '/cpanel-api/customer-requests',
  content: (type) => `/cpanel-api/content/${type}`,
  contentApprove: (type, id) => `/cpanel-api/content/${type}/${id}/approve`,
  permissions: {
    me: '/cpanel-api/permissions/me',
    audit: '/cpanel-api/permissions/audit',
  },
  support: {
    tickets: '/cpanel-api/support/tickets',
    ticket: (id) => `/cpanel-api/support/tickets/${id}`,
    ticketStatus: (id) => `/cpanel-api/support/tickets/${id}/status`,
    attachment: (ticketId, attachmentId) =>
      `/cpanel-api/support/tickets/${ticketId}/attachments/${attachmentId}`,
  },
};

async function request(path, { method = 'GET', token, body, search } = {}) {
  const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
  const url = new URL(path, base);
  if (search && typeof search === 'object') {
    Object.entries(search).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }
  const headers = { Accept: 'application/json' };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url.toString(), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const parsed = (() => {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return { error: text || 'Invalid response' };
    }
  })();
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized', { detail: parsed }));
    }
    const err = new Error(parsed?.error || parsed?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = parsed;
    throw err;
  }
  return parsed;
}

function resolveApiUrl(path) {
  const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
  return new URL(path, base).toString();
}

async function fetchAuthorizedText(path, { token, search } = {}) {
  const base = API_BASE || (typeof window !== 'undefined' ? window.location.origin : '');
  const url = new URL(path, base);
  if (search && typeof search === 'object') {
    Object.entries(search).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v));
      }
    });
  }
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = new Error(res.statusText || 'Fetch failed');
    err.status = res.status;
    throw err;
  }
  return res.text();
}

async function requestFormData(path, { token, formData, method = 'POST' }) {
  const url = resolveApiUrl(path);
  const headers = { Accept: 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(url, { method, headers, body: formData });
  const text = await res.text();
  const parsed = (() => {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return { error: text || 'Invalid response' };
    }
  })();
  if (!res.ok) {
    const err = new Error(parsed?.error || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = parsed;
    throw err;
  }
  return parsed;
}

async function fetchAuthorizedBlob(path, token) {
  const url = resolveApiUrl(path);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = new Error(res.statusText || 'Download failed');
    err.status = res.status;
    throw err;
  }
  return res.blob();
}

export const enterpriseApi = {
  health: () => request(API_PATHS.health),

  publicBranding: ({ org } = {}) =>
    request(API_PATHS.public.branding, { method: 'GET', search: { org } }),

  login: (payload) =>
    request(API_PATHS.auth.login, { method: 'POST', body: payload }),

  forgotPassword: (payload) =>
    request('/cpanel-api/auth/forgot-password', { method: 'POST', body: payload }),

  resetPassword: (payload) =>
    request('/cpanel-api/auth/reset-password', { method: 'POST', body: payload }),

  changePassword: (token, payload) =>
    request('/cpanel-api/auth/change-password', { method: 'POST', token, body: payload }),

  session: (token) =>
    request(API_PATHS.auth.session, { method: 'GET', token }),

  logout: (token) =>
    request(API_PATHS.auth.logout, { method: 'POST', token }),

  sessionExpired: (token) =>
    request(API_PATHS.auth.sessionExpired, { method: 'POST', token }),

  dashboardSummary: (token) =>
    request(API_PATHS.dashboard.summary, { method: 'GET', token }),

  hostingMetrics: (token) =>
    request('/cpanel-api/dashboard/hosting-metrics', { method: 'GET', token }),

  notifications: (token, { limit, offset } = {}) =>
    request(API_PATHS.notifications.list, {
      method: 'GET',
      token,
      search: { limit, offset },
    }),

  markNotificationRead: (token, id) =>
    request(API_PATHS.notifications.read(id), { method: 'PATCH', token }),

  markAllNotificationsRead: (token) =>
    request(API_PATHS.notifications.readAll, { method: 'POST', token }),

  navigation: (token) =>
    request(API_PATHS.navigation.list, { method: 'GET', token }),

  orgBranding: (token) =>
    request(API_PATHS.org.branding, { method: 'GET', token }),

  patchOrgBranding: (token, body) =>
    request(API_PATHS.org.branding, { method: 'PATCH', token, body }),

  uploadOrgBrandingLogo: (token, file, slot) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('slot', slot === 'collapsed' ? 'collapsed' : 'wide');
    return requestFormData(API_PATHS.org.brandingLogo, { token, formData: fd, method: 'POST' });
  },

  adminRoles: (token) =>
    request(API_PATHS.admin.roles, { method: 'GET', token }),

  adminRegisterActor: (token, body) =>
    request(API_PATHS.admin.actors, { method: 'POST', token, body }),

  adminDeleteActor: (token, userId) =>
    request(`${API_PATHS.admin.actors}/${userId}`, { method: 'DELETE', token }),

  adminActorsList: (token, { limit = 10, offset = 0, q } = {}) =>
    request(API_PATHS.admin.actors, {
      method: 'GET',
      token,
      search: {
        limit: String(limit),
        offset: String(offset),
        ...(q ? { q: String(q) } : {}),
      },
    }),

  adminActorsExportCsv: (token, { q } = {}) =>
    fetchAuthorizedText(API_PATHS.admin.actorsExport, {
      token,
      search: q ? { q: String(q) } : {},
    }),

  supportTickets: (token, { scope = 'mine', limit } = {}) =>
    request(API_PATHS.support.tickets, {
      method: 'GET',
      token,
      search: { scope, limit },
    }),

  supportTicket: (token, id) =>
    request(API_PATHS.support.ticket(id), { method: 'GET', token }),

  supportCreateTicket: (token, body) => {
    if (body instanceof FormData) {
      return requestFormData(API_PATHS.support.tickets, { token, formData: body });
    }
    return request(API_PATHS.support.tickets, { method: 'POST', token, body });
  },

  supportUpdateTicketStatus: (token, ticketId, status, changedBy = 'Developer Support', notes = null) =>
    request(API_PATHS.support.ticketStatus(ticketId), {
      method: 'PATCH',
      token,
      body: { status, changedBy, notes },
    }),

  supportAddComment: (token, ticketId, body) =>
    request(`${API_PATHS.support.ticket(ticketId)}/comments`, { method: 'POST', token, body }),

  supportDownloadAttachment: (token, ticketId, attachmentId) =>
    fetchAuthorizedBlob(API_PATHS.support.attachment(ticketId, attachmentId), token),

  myPermissions: (token) =>
    request(API_PATHS.permissions.me, { method: 'GET', token }),

  auditLog: (token, { limit, offset } = {}) =>
    request(API_PATHS.permissions.audit, { method: 'GET', token, search: { limit, offset } }),

  platformOrganizations: (token) =>
    request(`${API_PATHS.platform.base}/organizations`, { method: 'GET', token }),

  platformCreateOrganization: (token, body) =>
    request(`${API_PATHS.platform.base}/organizations`, { method: 'POST', token, body }),

  platformRoles: (token) =>
    request(`${API_PATHS.platform.base}/roles`, { method: 'GET', token }),

  platformCreateOrgAdmin: (token, orgId, body) =>
    request(API_PATHS.platform.orgAdmin(orgId), { method: 'POST', token, body }),

  platformOrgAdmins: (token, orgId) =>
    request(API_PATHS.platform.orgAdmins(orgId), { method: 'GET', token }),

  platformUpdateOrgAdmin: (token, orgId, userId, body) =>
    request(API_PATHS.platform.orgAdminUser(orgId, userId), { method: 'PATCH', token, body }),

  platformDeleteOrgAdmin: (token, orgId, userId) =>
    request(API_PATHS.platform.orgAdminUser(orgId, userId), { method: 'DELETE', token }),

  platformNav: (token, orgId) =>
    request(API_PATHS.platform.orgNav(orgId), { method: 'GET', token }),

  platformUpsertNav: (token, orgId, body) =>
    request(API_PATHS.platform.orgNav(orgId), { method: 'POST', token, body }),

  platformUpsertRole: (token, body) =>
    request(`${API_PATHS.platform.base}/roles`, { method: 'POST', token, body }),

  platformPriorityOneRoles: (token, orgId) =>
    request(`${API_PATHS.platform.base}/organizations/${orgId}/roles/priority-one`, {
      method: 'GET',
      token,
    }),

  platformCreateMember: (token, orgId, body) =>
    request(`${API_PATHS.platform.base}/organizations/${orgId}/members`, {
      method: 'POST',
      token,
      body,
    }),

  platformAssignableRoles: (token, orgId) =>
    request(`${API_PATHS.platform.base}/organizations/${orgId}/assignable-roles`, {
      method: 'GET',
      token,
    }),

  platformOrgRoles: (token, orgId) =>
    request(`${API_PATHS.platform.base}/organizations/${orgId}/roles`, { method: 'GET', token }),

  platformCreateOrgRole: (token, orgId, body) =>
    request(`${API_PATHS.platform.base}/organizations/${orgId}/roles`, {
      method: 'POST',
      token,
      body,
    }),

  platformDeleteOrgRole: (token, orgId, roleCode) =>
    request(`${API_PATHS.platform.base}/organizations/${orgId}/roles/${encodeURIComponent(roleCode)}`, {
      method: 'DELETE',
      token,
    }),

  platformNavIcons: (token) =>
    request(`${API_PATHS.platform.base}/nav-icons`, { method: 'GET', token }),

  platformRoutes: (token) =>
    request(`${API_PATHS.platform.base}/routes`, { method: 'GET', token }),

  orgUpdateTheme: (token, theme) =>
    request('/cpanel-api/org/theme', { method: 'PATCH', token, body: { theme } }),

  resetOrgAppearance: (token) =>
    request('/cpanel-api/org/appearance/reset', { method: 'POST', token }),

  platformDeleteNav: (token, orgId, navId) =>
    request(`${API_PATHS.platform.base}/organizations/${orgId}/nav/${navId}`, {
      method: 'DELETE',
      token,
    }),

  platformReorderNav: (token, orgId, items) =>
    request(`${API_PATHS.platform.base}/organizations/${orgId}/nav/reorder`, {
      method: 'POST',
      token,
      body: { items },
    }),

  orgRoles: (token) => request('/cpanel-api/org/roles', { method: 'GET', token }),

  orgConfig: (token) => request(API_PATHS.org.config, { method: 'GET', token }),

  orgPutConfig: (token, key, value) =>
    request(API_PATHS.org.configKey(key), { method: 'PUT', token, body: { value } }),

  orgApprovalRules: (token) =>
    request(API_PATHS.org.approvalRules, { method: 'GET', token }),

  orgUpsertApprovalRule: (token, body) =>
    request(API_PATHS.org.approvalRules, { method: 'POST', token, body }),

  orgDeleteApprovalRule: (token, ruleId) =>
    request(`${API_PATHS.org.approvalRules}/${ruleId}`, { method: 'DELETE', token }),

  customerRequestsList: (token, params = {}) =>
    request(API_PATHS.customerRequests, { method: 'GET', token, search: params }),

  customerRequestCreate: (token, body) =>
    request(API_PATHS.customerRequests, { method: 'POST', token, body }),

  customerRequestUpdate: (token, id, body) =>
    request(`${API_PATHS.customerRequests}/${id}`, { method: 'PATCH', token, body }),

  contentList: (token, contentType, params = {}) =>
    request(API_PATHS.content(contentType), { method: 'GET', token, search: params }),

  contentDetail: (token, contentType, id) =>
    request(`${API_PATHS.content(contentType)}/${id}`, { method: 'GET', token }),

  contentCreate: (token, contentType, body) =>
    request(API_PATHS.content(contentType), { method: 'POST', token, body }),

  contentUpdate: (token, contentType, id, body) =>
    request(`${API_PATHS.content(contentType)}/${id}`, { method: 'PATCH', token, body }),

  contentApprove: (token, contentType, id, body) =>
    request(API_PATHS.contentApprove(contentType, id), { method: 'POST', token, body }),

  spacesList: (token, params = {}) =>
    request('/cpanel-api/spaces', { method: 'GET', token, search: params }),

  spaceDetail: (token, id) =>
    request(`/cpanel-api/spaces/${id}`, { method: 'GET', token }),

  spaceCreate: (token, body) =>
    request('/cpanel-api/spaces', { method: 'POST', token, body }),

  spaceUpdate: (token, id, body) =>
    request(`/cpanel-api/spaces/${id}`, { method: 'PUT', token, body }),

  spaceDelete: (token, id) =>
    request(`/cpanel-api/spaces/${id}`, { method: 'DELETE', token }),

  spaceToggleView: (token, id, view) =>
    request(`/cpanel-api/spaces/${id}/view`, { method: 'PATCH', token, body: { view } }),

  publicSpaces: (params = {}) =>
    request('/cpanel-api/public/spaces', { method: 'GET', search: params }),

  orgNavigation: (token) =>
    request('/cpanel-api/org/navigation', { method: 'GET', token }),

  pendingApprovals: (token) =>
    request('/cpanel-api/content/pending', { method: 'GET', token }),

  approveItem: (token, id, body) =>
    request(`/cpanel-api/content/approve/${id}`, { method: 'POST', token, body }),

  bulkUploadProducts: (token, excelFile, images) => {
    const fd = new FormData();
    fd.append('excelFile', excelFile);
    images.forEach((img) => fd.append('images', img));
    return requestFormData('/cpanel-api/content/products/bulk-upload', { token, formData: fd, method: 'POST' });
  },

  bulkUploadSeo: (token, excelFile, images) => {
    const fd = new FormData();
    fd.append('excelFile', excelFile);
    images.forEach((img) => fd.append('images', img));
    return requestFormData('/cpanel-api/content/seo/bulk-upload', { token, formData: fd, method: 'POST' });
  },

  bulkUploadBlogs: (token, excelFile, images) => {
    const fd = new FormData();
    fd.append('excelFile', excelFile);
    images.forEach((img) => fd.append('images', img));
    return requestFormData('/cpanel-api/content/blogs/bulk-upload', { token, formData: fd, method: 'POST' });
  },

  uploadImage: (token, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return requestFormData('/cpanel-api/content/upload-image', { token, formData: fd, method: 'POST' });
  },

  // Commons APIs (Colors & Kits)
  getCommonsColors: (token) => request('/cpanel-api/commons/colors', { method: 'GET', token }),
  createCommonsColor: (token, body) => request('/cpanel-api/commons/colors', { method: 'POST', token, body }),
  updateCommonsColor: (token, id, body) => request(`/cpanel-api/commons/colors/${id}`, { method: 'PUT', token, body }),
  deleteCommonsColor: (token, id) => request(`/cpanel-api/commons/colors/${id}`, { method: 'DELETE', token }),

  getCommonsKits: (token) => request('/cpanel-api/commons/kits', { method: 'GET', token }),
  createCommonsKit: (token, body) => request('/cpanel-api/commons/kits', { method: 'POST', token, body }),
  updateCommonsKit: (token, id, body) => request(`/cpanel-api/commons/kits/${id}`, { method: 'PUT', token, body }),
  deleteCommonsKit: (token, id) => request(`/cpanel-api/commons/kits/${id}`, { method: 'DELETE', token }),

  getCommonsBrands: (token) => request('/cpanel-api/commons/brands', { method: 'GET', token }),
  createCommonsBrand: (token, body) => request('/cpanel-api/commons/brands', { method: 'POST', token, body }),
  updateCommonsBrand: (token, id, body) => request(`/cpanel-api/commons/brands/${id}`, { method: 'PUT', token, body }),
  deleteCommonsBrand: (token, id) => request(`/cpanel-api/commons/brands/${id}`, { method: 'DELETE', token }),

  downloadProductsTemplateUrl: (token) => resolveApiUrl('/cpanel-api/content/products/export-template') + (token ? `?token=${token}` : ''),
  downloadSeoTemplateUrl: (token) => resolveApiUrl('/cpanel-api/content/seo/export-template') + (token ? `?token=${token}` : ''),
  downloadBlogsTemplateUrl: (token) => resolveApiUrl('/cpanel-api/content/blogs/export-template') + (token ? `?token=${token}` : ''),

  getAuditLogs: (token, params = {}) =>
    request('/cpanel-api/audit-logs', { method: 'GET', token, search: params }),

  auditLogs: (token, tableName, recordId) =>
    request('/cpanel-api/audit-logs', {
      method: 'GET',
      token,
      search: { table_name: tableName, record_id: recordId },
    }),

  getReadyForReleaseItems: (token) =>
    request('/cpanel-api/release/ready-items', { method: 'GET', token }),

  goLiveRelease: (token, payload = {}) => {
    const body = Array.isArray(payload) ? { selected_items: payload } : payload;
    return request('/cpanel-api/release/go-live', { method: 'POST', token, body });
  },

  rollbackRelease: (token, batch_id = null) =>
    request('/cpanel-api/release/rollback', { method: 'POST', token, body: { batch_id } }),

  getReleaseHistory: (token) =>
    request('/cpanel-api/release/history', { method: 'GET', token }),

  getReleaseStatus: (token) =>
    request('/cpanel-api/release/status', { method: 'GET', token }),

  // UI Layout Management APIs
  getUiLayoutPages: (token) =>
    request('/cpanel-api/ui-layouts/pages', { method: 'GET', token }),

  getUiLayoutComponents: (token, pageId) =>
    request(`/cpanel-api/ui-layouts/pages/${pageId}/components`, { method: 'GET', token }),

  getUiLayoutComponentLayouts: (token, componentId) =>
    request(`/cpanel-api/ui-layouts/components/${componentId}/layouts`, { method: 'GET', token }),

  getUiLayoutComponentConfig: (token, pageId, componentId) =>
    request(`/cpanel-api/ui-layouts/pages/${pageId}/components/${componentId}/config`, { method: 'GET', token }),

  saveUiLayoutComponentDraft: (token, pageId, componentId, body) =>
    request(`/cpanel-api/ui-layouts/pages/${pageId}/components/${componentId}/config`, { method: 'POST', token, body }),

  publishUiLayoutComponent: (token, pageId, componentId, body) =>
    request(`/cpanel-api/ui-layouts/pages/${pageId}/components/${componentId}/publish`, { method: 'POST', token, body }),
};
