import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { RequireAuth, RedirectIfAuthed, RequirePermissions } from './guards';
import { Skeleton } from '@/components/ui/primitives';

const LoginPage = lazy(() => import('@/pages/auth/Login').then((m) => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('@/pages/auth/Register').then((m) => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/auth/ForgotPassword').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/auth/ResetPassword').then((m) => ({ default: m.ResetPasswordPage })),
);
const DashboardPage = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.DashboardPage })));
const ProfilePage = lazy(() => import('@/pages/profile/Profile').then((m) => ({ default: m.ProfilePage })));
const UsersListPage = lazy(() => import('@/pages/admin/UsersList').then((m) => ({ default: m.UsersListPage })));
const UserDetailPage = lazy(() => import('@/pages/admin/UserDetail').then((m) => ({ default: m.UserDetailPage })));
const RolesPermissionsPage = lazy(() =>
  import('@/pages/admin/RolesPermissions').then((m) => ({ default: m.RolesPermissionsPage })),
);
const ForbiddenPage = lazy(() => import('@/pages/StatusPages').then((m) => ({ default: m.ForbiddenPage })));
const NotFoundPage = lazy(() => import('@/pages/StatusPages').then((m) => ({ default: m.NotFoundPage })));

function PageFallback() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-40" />
    </div>
  );
}

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

const router = createBrowserRouter([
  {
    element: <RedirectIfAuthed />,
    children: [
      { path: '/login', element: withSuspense(<LoginPage />) },
      { path: '/register', element: withSuspense(<RegisterPage />) },
      { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
      { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: withSuspense(<DashboardPage />) },
          { path: '/profile', element: withSuspense(<ProfilePage />) },
          {
            element: <RequirePermissions permissions={['users:read']} />,
            children: [
              { path: '/admin/users', element: withSuspense(<UsersListPage />) },
              { path: '/admin/users/:id', element: withSuspense(<UserDetailPage />) },
            ],
          },
          {
            element: <RequirePermissions permissions={['roles:read']} />,
            children: [{ path: '/admin/roles', element: withSuspense(<RolesPermissionsPage />) }],
          },
          { path: '/403', element: withSuspense(<ForbiddenPage />) },
          { path: '*', element: withSuspense(<NotFoundPage />) },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
