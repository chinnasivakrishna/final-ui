import { usePermissions } from '../hooks/usePermissions.js';
import { AccessDenied } from '../components/AccessDenied.jsx';
import { useAuth } from '../context/authContext.js';
import { PageSpinner } from '../components/PageSpinner.jsx';

/**
 * Route guard: platformAdmin OR permission code (org_admin bypasses non-platform perms in usePermissions).
 */
export function PermissionRoute({ permission, platformOnly, children }) {
  const { can, isPlatformAdmin } = usePermissions();
  const { loading } = useAuth();

  if (loading) {
    return <PageSpinner />;
  }

  if (platformOnly) {
    if (!isPlatformAdmin) {
      return (
        <AccessDenied message="Platform administrator access is required." />
      );
    }
    return children;
  }

  if (permission && !can(permission)) {
    return <AccessDenied />;
  }

  return children;
}
