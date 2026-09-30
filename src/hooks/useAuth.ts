import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuthStore } from '@/context/authStore';
import type { AuthTokens, User } from '@/types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload extends LoginPayload {
  firstName?: string;
  lastName?: string;
}

export function useAuth() {
  const store = useAuthStore();
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const { data } = await api.post<AuthTokens>('/auth/login', payload);
      const { data: user } = await api.get<User>('/users/me', {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      return { tokens: data, user };
    },
    onSuccess: ({ tokens, user }) => {
      store.setSession(user, tokens.accessToken, tokens.refreshToken);
    },
  });

  const register = useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const { data } = await api.post('/auth/register', payload);
      return data;
    },
  });

  const logout = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout', { refreshToken: store.refreshToken });
    },
    onSettled: () => {
      store.clearSession();
      queryClient.clear();
    },
  });

  const logoutAll = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout-all');
    },
    onSettled: () => {
      store.clearSession();
      queryClient.clear();
    },
  });

  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated(),
    login,
    register,
    logout,
    logoutAll,
  };
}
