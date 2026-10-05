import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:3000/api/v1';

export const handlers = [
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'admin@example.com' && body.password === 'ChangeMe123!') {
      return HttpResponse.json({ accessToken: 'fake-access', refreshToken: 'fake-refresh', expiresIn: 900 });
    }
    return HttpResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }),

  http.get(`${BASE}/users/me`, () =>
    HttpResponse.json({
      id: 'u1',
      email: 'admin@example.com',
      firstName: 'Admin',
      lastName: 'User',
      isEmailVerified: true,
      isActive: true,
      roles: [
        {
          id: 'r1',
          name: 'admin',
          permissions: [{ id: 'p1', name: 'users:read' }, { id: 'p2', name: 'roles:read' }],
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  ),

  http.get(`${BASE}/users`, () => HttpResponse.json([])),
];
