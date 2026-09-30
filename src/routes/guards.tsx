import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/context/authStore';
import { usePermissions } from '@/hooks/usePermissions';

/** Redirects to /login when there's no access token. */
export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/** Redirects away from auth pages if already logged in. */
export function RedirectIfAuthed() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}

/** Gates a route behind one or more permissions (must have ALL of them). */
export function RequirePermissions({ permissions }: { permissions: string[] }) {
  const { hasAllPermissions } = usePermissions();
  if (!hasAllPermissions(permissions)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
