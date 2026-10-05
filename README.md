# Identity Console — React Admin Portal

A React frontend for the NestJS Auth Service: login/register, self-service profile
management, and an admin console for managing users, roles, and permissions.

## Stack

| Concern | Choice |
|---|---|
| Build tool | Vite |
| Language | TypeScript (strict) |
| Routing | React Router v6, lazy-loaded route chunks |
| Server state | TanStack Query (caching, retries, mutation invalidation) |
| Client/auth state | Zustand (persisted to localStorage) |
| Forms | React Hook Form + Zod schema validation |
| Styling | Tailwind CSS, CSS-variable design tokens, dark/light theme |
| Tables | TanStack Table (sorting, filtering, pagination) |
| Testing | Vitest + React Testing Library + MSW (mocked API) |
| Toasts | sonner |
| Icons | lucide-react |

## Setup

```bash
npm install
cp .env.example .env      # point VITE_API_BASE_URL at your running auth-service
npm run dev
```

Requires the NestJS auth-service running (see its own README) with CORS enabled for
this app's origin.

## Scripts

```bash
npm run dev          # local dev server
npm run build         # type-check + production build
npm test              # run unit tests once
npm run test:watch    # watch mode
npm run lint
```

## Features implemented

**Auth**
- Login, Register, Forgot/Reset password
- Access-token auto-refresh on 401, with request queueing so concurrent requests
  don't each trigger their own refresh call (see `src/api/client.ts`)
- Auto-logout + redirect to `/login` when refresh fails

**Profile (any user)**
- Edit name, upload/change avatar (with local preview before upload completes)
- Change password
- View own roles and effective permissions (read-only)
- List + revoke active sessions

**Admin console** (gated behind permissions, not just a role name)
- Users table: search, sort, pagination
- User detail: activate/deactivate, assign/remove roles
- Roles & Permissions: create/delete roles, permission matrix (checkbox grid) to
  grant/revoke permissions per role

**Cross-cutting**
- Dark/light theme (persisted, respects `prefers-reduced-motion`)
- Route guards: `RequireAuth`, `RedirectIfAuthed`, `RequirePermissions`
- Error boundary (render-error fallback, not a blank screen)
- Skeleton loading states, toast notifications on every mutation
- Accessible: labeled inputs, visible focus rings, `aria-*` on interactive icons/modals

## Backend endpoints this app expects

Most map directly to the auth-service as built. **Two are not yet implemented on the
backend** — the UI is wired for them, but you'll need to add them (or the relevant
screens will error until you do):

| Endpoint | Status |
|---|---|
| `POST /auth/login`, `/register`, `/refresh`, `/logout`, `/logout-all` | ✅ exists |
| `POST /auth/forgot-password`, `/reset-password` | ✅ exists |
| `GET/PATCH /users/me` | ✅ exists |
| `GET /users`, `PATCH /users/:id`, `PATCH /users/:id/roles` | ✅ exists |
| `GET/POST/PUT/DELETE /roles`, `/roles/permissions*` | ✅ exists |
| `POST /users/me/avatar` (multipart upload) | ❌ **add to backend** |
| `POST /auth/change-password` | ❌ **add to backend** |
| `GET /auth/sessions`, `DELETE /auth/sessions/:id` | ❌ **add to backend** — list/revoke individual refresh-token sessions |

## Deliberately out of scope for this pass

To keep this focused, the following weren't built — happy to add any of them next:
- Storybook (component catalog)
- Playwright/Cypress E2E suite
- CI pipeline (GitHub Actions running lint/test/build)
- Virtualized tables (not needed until user lists get into the thousands — swap in
  `@tanstack/react-virtual` on `UsersListPage` if that becomes necessary)
- OpenAPI-generated types (currently hand-written in `src/types`; could be generated
  from the backend's Swagger spec with `openapi-typescript`)

## Project structure

```
src/
  api/client.ts          axios instance + refresh-token interceptor
  context/authStore.ts    Zustand auth state (persisted)
  hooks/                  useAuth, usePermissions, useDebounce
  schemas/                Zod validation schemas per form
  components/ui/          Button, Input, Card, Badge, Modal, Skeleton
  components/layout/      AppShell (sidebar + topbar)
  routes/                 router.tsx, guards.tsx
  theme/                  ThemeProvider (dark/light)
  pages/
    auth/                 Login, Register, ForgotPassword, ResetPassword
    profile/               self-service profile page
    admin/                 UsersList, UserDetail, RolesPermissions
  test/                    MSW handlers + Vitest setup
```
