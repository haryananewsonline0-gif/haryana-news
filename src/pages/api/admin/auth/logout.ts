// ==============================================================================
// Admin Auth API: Logout Handler
// Endpoint: POST/GET /api/admin/auth/logout
// Clears session cookies and redirects to login
// ==============================================================================

import type { APIRoute } from 'astro';

export const prerender = false;

export const ALL: APIRoute = async ({ cookies, redirect }) => {
  cookies.delete('sb-access-token', { path: '/' });
  cookies.delete('sb-refresh-token', { path: '/' });
  cookies.delete('admin-mfa-verified', { path: '/' });

  return redirect('/admin/login');
};
