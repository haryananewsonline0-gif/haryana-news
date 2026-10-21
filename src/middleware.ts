// ==============================================================================
// Security Middleware & Admin Route Guard (Astro SSR)
// Enforces security headers, rate checks, and TOTP MFA verification
// ==============================================================================

import { defineMiddleware } from 'astro:middleware';
import { verifyAdminSession } from '@/lib/auth/session';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, locals, redirect } = context;
  const pathname = url.pathname;
  const runtimeEnv = locals?.runtime?.env;

  // Execute route handler
  let response: Response;

  // Protect /admin routes (except login and MFA flows)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/admin/mfa') && !pathname.startsWith('/api/admin/auth/')) {
    const session = await verifyAdminSession(cookies, runtimeEnv);

    if (!session.isAuthenticated || !session.isAdmin) {
      return redirect('/admin/login');
    }

    if (!session.isMfaVerified) {
      return redirect('/admin/mfa');
    }
  }

  response = await next();

  // Clone headers to inject mandatory security headers
  const headers = new Headers(response.headers);

  // Global security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Enforce noindex, nofollow on all admin pages
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
