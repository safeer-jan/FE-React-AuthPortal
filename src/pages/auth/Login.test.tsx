import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './Login';
import { queryClient } from '@/lib/queryClient';
import { useAuthStore } from '@/context/authStore';

function renderLogin() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('LoginPage', () => {
  it('shows validation errors for empty submit', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
  });

  it('logs in successfully with correct credentials', async () => {
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'ChangeMe123!');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated()).toBe(true));
    expect(useAuthStore.getState().user?.email).toBe('admin@example.com');
  });
});
