import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Camera, Monitor, Trash2 } from 'lucide-react';
import { profileSchema, changePasswordSchema, type ProfileFormValues, type ChangePasswordFormValues } from '@/schemas/auth';
import { api } from '@/api/client';
import { useAuthStore } from '@/context/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/primitives';
import type { Session } from '@/types';

export function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { roles, permissions } = usePermissions();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // --- Profile info ---
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isDirty: profileDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: user?.firstName ?? '', lastName: user?.lastName ?? '' },
  });

  const updateProfile = useMutation({
    mutationFn: (values: ProfileFormValues) => api.patch('/users/me', values),
    onSuccess: (res) => {
      setUser(res.data);
      toast.success('Profile updated');
    },
    onError: () => toast.error('Could not update profile'),
  });

  // --- Avatar upload ---
  const uploadAvatar = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: (res) => {
      setUser(res.data);
      setAvatarPreview(null);
      toast.success('Profile picture updated');
    },
    onError: () => toast.error('Could not upload image'),
  });

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
    uploadAvatar.mutate(file);
  };

  // --- Change password ---
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormValues>({ resolver: zodResolver(changePasswordSchema) });

  const changePassword = useMutation({
    mutationFn: (values: ChangePasswordFormValues) =>
      api.post('/auth/change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      }),
    onSuccess: () => {
      toast.success('Password changed');
      resetPasswordForm();
    },
    onError: () => toast.error('Current password is incorrect'),
  });

  // --- Sessions ---
  const sessionsQuery = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => (await api.get<Session[]>('/auth/sessions')).data,
  });

  const revokeSession = useMutation({
    mutationFn: (sessionId: string) => api.delete(`/auth/sessions/${sessionId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      toast.success('Session revoked');
    },
  });

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-lg font-semibold text-text">My profile</h1>

      {/* Avatar + roles */}
      <Card className="flex items-center gap-4 p-6">
        <div className="relative">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-border text-lg font-semibold text-text">
            {avatarPreview || user?.avatarUrl ? (
              <img src={avatarPreview ?? user?.avatarUrl} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || user?.email[0].toUpperCase()
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            aria-label="Change profile picture"
            className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground"
          >
            <Camera size={12} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />
        </div>
        <div>
          <p className="font-medium text-text">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="text-sm text-text-muted">{user?.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roles.map((role) => (
              <Badge key={role} tone="accent">
                {role}
              </Badge>
            ))}
          </div>
        </div>
      </Card>

      {/* Profile info form */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">Personal information</h2>
        <form onSubmit={handleProfileSubmit((v) => updateProfile.mutate(v))} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" error={profileErrors.firstName?.message} {...registerProfile('firstName')} />
            <Input label="Last name" error={profileErrors.lastName?.message} {...registerProfile('lastName')} />
          </div>
          <div>
            <Button type="submit" size="sm" disabled={!profileDirty} isLoading={updateProfile.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Permissions (read-only) */}
      <Card className="p-6">
        <h2 className="mb-3 text-sm font-semibold text-text">My permissions</h2>
        {permissions.length === 0 ? (
          <p className="text-sm text-text-muted">No permissions assigned.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {permissions.map((p) => (
              <Badge key={p}>{p}</Badge>
            ))}
          </div>
        )}
      </Card>

      {/* Change password */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">Change password</h2>
        <form onSubmit={handlePasswordSubmit((v) => changePassword.mutate(v))} className="flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            error={passwordErrors.currentPassword?.message}
            {...registerPassword('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            error={passwordErrors.newPassword?.message}
            {...registerPassword('newPassword')}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={passwordErrors.confirmPassword?.message}
            {...registerPassword('confirmPassword')}
          />
          <div>
            <Button type="submit" size="sm" isLoading={changePassword.isPending}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      {/* Active sessions */}
      <Card className="p-6">
        <h2 className="mb-4 text-sm font-semibold text-text">Active sessions</h2>
        {sessionsQuery.isLoading ? (
          <p className="text-sm text-text-muted">Loading sessions…</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {sessionsQuery.data?.map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-text-muted" />
                  <div>
                    <p className="text-sm text-text">
                      {session.userAgent ?? 'Unknown device'} {session.current && <Badge tone="accent">This device</Badge>}
                    </p>
                    <p className="text-xs text-text-muted">
                      {session.ipAddress} · signed in {new Date(session.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {!session.current && (
                  <button
                    onClick={() => revokeSession.mutate(session.id)}
                    aria-label="Revoke this session"
                    className="rounded-md p-2 text-text-muted hover:bg-danger/15 hover:text-danger"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
