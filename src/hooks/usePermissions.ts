import { useMemo } from 'react';
import { useAuthStore } from '@/context/authStore';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  const { roleNames, permissionNames } = useMemo(() => {
    const roles = user?.roles ?? [];
    const roleNames = new Set(roles.map((r) => r.name));
    const permissionNames = new Set(roles.flatMap((r) => r.permissions.map((p) => p.name)));
    return { roleNames, permissionNames };
  }, [user]);

  const hasRole = (role: string) => roleNames.has(role);
  const hasPermission = (permission: string) => permissionNames.has(permission);
  const hasAllPermissions = (permissions: string[]) => permissions.every((p) => permissionNames.has(p));

  return {
    roles: [...roleNames],
    permissions: [...permissionNames],
    hasRole,
    hasPermission,
    hasAllPermissions,
  };
}
