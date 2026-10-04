import { useQuery } from '@tanstack/react-query';
import { Users, ShieldCheck, KeyRound } from 'lucide-react';
import { api } from '@/api/client';
import { Card, Skeleton } from '@/components/ui/primitives';
import { usePermissions } from '@/hooks/usePermissions';
import type { Role, User } from '@/types';

export function DashboardPage() {
  const { hasPermission } = usePermissions();
  const canReadUsers = hasPermission('users:read');
  const canReadRoles = hasPermission('roles:read');

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: async () => (await api.get<User[]>('/users')).data,
    enabled: canReadUsers,
  });

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get<Role[]>('/roles')).data,
    enabled: canReadRoles,
  });

  const stats = [
    { label: 'Total users', value: usersQuery.data?.length, icon: Users, loading: usersQuery.isLoading, show: canReadUsers },
    {
      label: 'Active users',
      value: usersQuery.data?.filter((u) => u.isActive).length,
      icon: KeyRound,
      loading: usersQuery.isLoading,
      show: canReadUsers,
    },
    { label: 'Roles defined', value: rolesQuery.data?.length, icon: ShieldCheck, loading: rolesQuery.isLoading, show: canReadRoles },
  ].filter((s) => s.show);

  return (
    <div>
      <h1 className="mb-6 text-lg font-semibold text-text">Dashboard</h1>

      {stats.length === 0 ? (
        <p className="text-sm text-text-muted">You don't have permission to view any dashboard metrics yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="p-5">
              <div className="mb-3 flex items-center gap-2 text-text-muted">
                <stat.icon size={16} />
                <span className="text-sm">{stat.label}</span>
              </div>
              {stat.loading ? <Skeleton className="h-8 w-16" /> : <p className="text-2xl font-semibold text-text">{stat.value}</p>}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
