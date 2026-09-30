import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/api/client';
import { Card, Badge, Skeleton } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import type { Role, User } from '@/types';

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedRoles, setSelectedRoles] = useState<string[] | null>(null);

  const userQuery = useQuery({
    queryKey: ['users', id],
    queryFn: async () => (await api.get<User>(`/users/${id}`)).data,
  });

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get<Role[]>('/roles')).data,
  });

  const assignRoles = useMutation({
    mutationFn: (roles: string[]) => api.patch(`/users/${id}/roles`, { roles }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Roles updated');
    },
    onError: () => toast.error('Could not update roles'),
  });

  const toggleActive = useMutation({
    mutationFn: (isActive: boolean) => api.patch(`/users/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Account status updated');
    },
  });

  if (userQuery.isLoading || rolesQuery.isLoading) {
    return <Skeleton className="h-64 w-full max-w-2xl" />;
  }

  if (!userQuery.data) {
    return <p className="text-sm text-text-muted">User not found.</p>;
  }

  const user = userQuery.data;
  const currentRoleNames = selectedRoles ?? user.roles.map((r) => r.name);
  const dirty = selectedRoles !== null;

  const toggleRole = (name: string) => {
    const base = selectedRoles ?? user.roles.map((r) => r.name);
    setSelectedRoles(base.includes(name) ? base.filter((r) => r !== name) : [...base, name]);
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <Link to="/admin/users" className="flex w-fit items-center gap-1.5 text-sm text-text-muted hover:text-text">
        <ArrowLeft size={14} /> Back to users
      </Link>

      <Card className="flex items-center justify-between p-6">
        <div>
          <p className="font-medium text-text">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-sm text-text-muted">{user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge tone={user.isActive ? 'accent' : 'danger'}>{user.isActive ? 'active' : 'disabled'}</Badge>
          <Button
            size="sm"
            variant={user.isActive ? 'danger' : 'secondary'}
            isLoading={toggleActive.isPending}
            onClick={() => toggleActive.mutate(!user.isActive)}
          >
            {user.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">Roles</h2>
        <div className="flex flex-wrap gap-2">
          {rolesQuery.data?.map((role) => {
            const active = currentRoleNames.includes(role.name);
            return (
              <button
                key={role.id}
                onClick={() => toggleRole(role.name)}
                className={
                  active
                    ? 'rounded-md border border-accent bg-accent/15 px-3 py-1.5 font-mono text-xs text-accent'
                    : 'rounded-md border border-border px-3 py-1.5 font-mono text-xs text-text-muted hover:border-accent/50'
                }
              >
                {role.name}
              </button>
            );
          })}
        </div>
        {dirty && (
          <div className="mt-4 flex gap-2">
            <Button size="sm" isLoading={assignRoles.isPending} onClick={() => assignRoles.mutate(currentRoleNames)}>
              Save role changes
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedRoles(null)}>
              Cancel
            </Button>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <h2 className="mb-3 text-sm font-semibold text-text">Effective permissions</h2>
        <div className="flex flex-wrap gap-1.5">
          {[...new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name)))].map((p) => (
            <Badge key={p}>{p}</Badge>
          ))}
        </div>
      </Card>
    </div>
  );
}
