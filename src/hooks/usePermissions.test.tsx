import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePermissions } from './usePermissions';
import { useAuthStore } from '@/context/authStore';
import type { User } from '@/types';

const mockUser: User = {
  id: 'u1',
  email: 'a@b.com',
  isEmailVerified: true,
  isActive: true,
  createdAt: '',
  updatedAt: '',
  roles: [
    { id: 'r1', name: 'admin', permissions: [{ id: 'p1', name: 'users:read' }, { id: 'p2', name: 'roles:manage' }] },
  ],
};

describe('usePermissions', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: mockUser, accessToken: 'x', refreshToken: 'y' });
  });

  it('returns true for a granted permission', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission('users:read')).toBe(true);
  });

  it('returns false for a permission not granted', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasPermission('roles:read')).toBe(false);
  });

  it('hasAllPermissions requires every permission to be present', () => {
    const { result } = renderHook(() => usePermissions());
    expect(result.current.hasAllPermissions(['users:read', 'roles:manage'])).toBe(true);
    expect(result.current.hasAllPermissions(['users:read', 'roles:read'])).toBe(false);
  });
});
