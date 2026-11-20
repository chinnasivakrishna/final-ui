/** Match backend contentType → approval rule resource key. */
export function contentTypeToResource(contentType) {
  const map = {
    product: '/app/products',
    category: '/app/products',
    subcategory: '/app/products',
    variant: '/app/products',
    seo: '/app/seo',
    ui_element: '/app/ui-elements',
    ui_layout: '/app/ui-layouts',
    blog: '/app/blog',
    career: '/app/careers',
    space: '/app/explore-spaces',
    spaces: '/app/explore-spaces',
    explore_space: '/app/explore-spaces',
    tb_web_spaces: '/app/explore-spaces',
    user: '/app/org/users',
    tb_board_users: '/app/org/users',
  };
  const val = String(contentType ?? '').trim();
  return map[val] ?? val;
}

function normalizeRole(r) {
  const s = String(r || '').toLowerCase().trim().replace(/[\s-]+/g, '_');
  if (s === 'org_admin' || s === 'organization_admin') return 'organization_admin';
  if (s === 'super_admin' || s === 'sys_admin' || s === 'system_admin') return 'super_admin';
  if (s === 'super_employee' || s === 'superemployee') return 'super_employee';
  if (s === 'employee' || s === 'employee_2' || s === 'employee2') return 'employee';
  return s;
}

/** Show approve/reject when user is allowed or assigned as checker for that item. */
export function canApprovePendingItem({ rules, resource, type, tableName, createdByRole, roleCode }) {
  const checker = normalizeRole(roleCode);
  const rawRole = String(roleCode || '').toLowerCase().trim().replace(/[\s-]+/g, '_');

  // Platform super_admin and sys_admin can view and approve all pending items
  if (checker === 'super_admin' || checker === 'sys_admin') {
    return true;
  }

  // If no approval rules array provided, default to displaying backend delivered items
  if (!rules || rules.length === 0) {
    return true;
  }

  const res = String(resource ?? '').trim().toLowerCase();
  const itemType = String(type || tableName || '').trim().toLowerCase();

  // Find active rule matching resource or type
  const rule = rules.find((r) => {
    if (r.isActive === false || r.isActive === 0 || r.status === 'inactive') return false;
    const ruleRes = String(r.resource || r.route_path || r.route_name || '').trim().toLowerCase();
    return (
      ruleRes === res ||
      ruleRes.includes(res.replace('/app/', '')) ||
      res.includes(ruleRes.replace('/app/', '')) ||
      (itemType && (ruleRes.includes(itemType) || itemType.includes(ruleRes.replace('/app/', '')))) ||
      (itemType.includes('pdt') && (ruleRes.includes('product') || ruleRes.includes('products'))) ||
      (itemType.includes('user') && (ruleRes.includes('user') || ruleRes.includes('account') || ruleRes.includes('member'))) ||
      (itemType.includes('career') && (ruleRes.includes('career') || ruleRes.includes('job')))
    );
  });

  if (!rule) {
    return true;
  }

  let checkerList = [];
  try {
    if (Array.isArray(rule.check_role_ids)) {
      checkerList = rule.check_role_ids;
    } else if (typeof rule.check_role_ids === 'string') {
      checkerList = JSON.parse(rule.check_role_ids);
    } else if (Array.isArray(rule.checkerRole)) {
      checkerList = rule.checkerRole;
    } else if (typeof rule.checkerRole === 'string') {
      checkerList = rule.checkerRole.split(',').map((s) => s.trim());
    }
  } catch (e) {
    checkerList = [];
  }

  const normCheckers = checkerList.map(normalizeRole);
  const rawCheckers = checkerList.map((s) => String(s || '').toLowerCase().trim().replace(/[\s-]+/g, '_'));

  if (normCheckers.includes('*') || normCheckers.includes('all')) return true;

  return (
    normCheckers.includes(checker) ||
    rawCheckers.includes(rawRole) ||
    normCheckers.includes(rawRole) ||
    rawCheckers.includes(checker)
  );
}
