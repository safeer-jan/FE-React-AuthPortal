import { NavLink, Outlet } from 'react-router-dom';
import { clsx } from 'clsx';
import { LayoutDashboard, Users, ShieldCheck, UserCircle, Moon, Sun, LogOut } from 'lucide-react';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/profile', label: 'My profile', icon: UserCircle },
  { to: '/admin/users', label: 'Users', icon: Users, permission: 'users:read' },
  { to: '/admin/roles', label: 'Roles & permissions', icon: ShieldCheck, permission: 'roles:read' },
];

export function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { hasPermission } = usePermissions();

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-60 flex-col border-r border-border bg-bg-surface">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <ShieldCheck size={18} className="text-accent" />
          <span className="text-sm font-semibold text-text">Identity Console</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {navItems
            .filter((item) => !item.permission || hasPermission(item.permission))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-accent/15 text-accent' : 'text-text-muted hover:bg-border/50 hover:text-text',
                  )
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div />
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="rounded-md p-2 text-text-muted hover:bg-border/50 hover:text-text"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <span className="text-sm text-text-muted">{user?.email}</span>
            <button
              onClick={() => logout.mutate()}
              aria-label="Log out"
              className="rounded-md p-2 text-text-muted hover:bg-danger/15 hover:text-danger"
            >
              <LogOut size={16} />
            </button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
