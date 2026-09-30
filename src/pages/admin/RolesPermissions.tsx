import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import { createRoleSchema, type CreateRoleFormValues } from '@/schemas/auth';
import { api } from '@/api/client';
import { Card, Modal } from '@/components/ui/primitives';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Permission, Role } from '@/types';

export function RolesPermissionsPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: async () => (await api.get<Role[]>('/roles')).data,
  });

  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: async () => (await api.get<Permission[]>('/roles/permissions/all')).data,
  });

  const createRole = useMutation({
    mutationFn: (values: CreateRoleFormValues) => api.post('/roles', values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role created');
      setCreateOpen(false);
    },
    onError: () => toast.error('Could not create role — name may already be taken'),
  });

  const deleteRole = useMutation({
    mutationFn: (roleId: string) => api.delete(`/roles/${roleId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast.success('Role deleted');
    },
  });

  const setPermissions = useMutation({
    mutationFn: ({ roleId, permissions }: { roleId: string; permissions: string[] }) =>
      api.put(`/roles/${roleId}/permissions`, { permissions }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
    onError: () => toast.error('Could not update permissions'),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateRoleFormValues>({ resolver: zodResolver(createRoleSchema) });

  const toggleCell = (role: Role, permissionName: string) => {
    const current = role.permissions.map((p) => p.name);
    const next = current.includes(permissionName)
      ? current.filter((p) => p !== permissionName)
      : [...current, permissionName];
    setPermissions.mutate({ roleId: role.id, permissions: next });
  };

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text">Roles & permissions</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus size={14} /> New role
        </Button>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-text-muted">
            <tr>
              <th className="sticky left-0 bg-bg-surface px-4 py-3 font-medium">Permission</th>
              {roles.map((role) => (
                <th key={role.id} className="min-w-[110px] px-3 py-3 text-center font-mono font-medium">
                  <div className="flex items-center justify-center gap-1.5">
                    {role.name}
                    <button
                      onClick={() => {
                        if (confirm(`Delete role "${role.name}"?`)) deleteRole.mutate(role.id);
                      }}
                      aria-label={`Delete role ${role.name}`}
                      className="text-text-muted hover:text-danger"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission) => (
              <tr key={permission.id} className="border-b border-border last:border-0">
                <td className="sticky left-0 bg-bg-surface px-4 py-2.5 font-mono text-xs text-text">
                  {permission.name}
                </td>
                {roles.map((role) => {
                  const checked = role.permissions.some((p) => p.name === permission.name);
                  return (
                    <td key={role.id} className="px-3 py-2.5 text-center">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCell(role, permission.name)}
                        aria-label={`${permission.name} for ${role.name}`}
                        className="h-4 w-4 accent-accent"
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            {permissions.length === 0 && (
              <tr>
                <td colSpan={roles.length + 1} className="px-4 py-8 text-center text-text-muted">
                  No permissions defined yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create role">
        <form
          onSubmit={handleSubmit((values) => {
            createRole.mutate(values);
            reset();
          })}
          className="flex flex-col gap-4"
        >
          <Input label="Name" placeholder="e.g. editor" error={errors.name?.message} {...register('name')} />
          <Input label="Description (optional)" error={errors.description?.message} {...register('description')} />
          <Button type="submit" isLoading={createRole.isPending} className="w-full">
            Create role
          </Button>
        </form>
      </Modal>
    </div>
  );
}
