// ==============================================================================
// Admin Auth API: Login Handler
// Endpoint: POST /api/admin/auth/login
// Enforces: Turnstile verification, Rate limiting, ADMIN_EMAIL check, Supabase Auth
// ==============================================================================

import type { APIRoute } from 'astro';
import { getServerSupabase } from '@/lib/supabase/server';
import { checkLoginRateLimit, recordLoginAttempt, verifyTurnstileToken } from '@/lib/auth/rate-limiter';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const adminEmail = (runtimeEnv?.ADMIN_EMAIL || import.meta.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const turnstileSecret = runtimeEnv?.TURNSTILE_SECRET_KEY || import.meta.env.TURNSTILE_SECRET_KEY || '';

  // Get client IP
  const clientIp =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1';

  // 1. Check Rate Limit (5 attempts per 15 minutes)
  const rateLimit = checkLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({
        success: false,
        error: `अत्यधिक प्रयास। कृपया ${rateLimit.retryAfterSec || 900} सेकंड बाद पुनः प्रयास करें।`,
      }),
      { status: 429, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    let email = '';
    let password = '';
    let turnstileToken = '';

    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await request.json();
      email = (body.email || '').trim().toLowerCase();
      password = body.password || '';
      turnstileToken = body.turnstileToken || body['cf-turnstile-response'] || '';
    } else {
      const formData = await request.formData();
      email = (formData.get('email')?.toString() || '').trim().toLowerCase();
      password = formData.get('password')?.toString() || '';
      turnstileToken =
        formData.get('turnstileToken')?.toString() ||
        formData.get('cf-turnstile-response')?.toString() ||
        '';
    }

    if (!email || !password) {
      return new Response(
        JSON.stringify({ success: false, error: 'ईमेल और पासवर्ड आवश्यक हैं।' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Cloudflare Turnstile Verification
    const isCaptchaValid = await verifyTurnstileToken(turnstileToken, turnstileSecret, clientIp);
    if (!isCaptchaValid) {
      recordLoginAttempt(clientIp, false);
      return new Response(
        JSON.stringify({ success: false, error: 'सुरक्षा कैप्चा सत्यापन विफल रहा।' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Admin Email Allowlist Check
    if (adminEmail && email !== adminEmail) {
      recordLoginAttempt(clientIp, false);
      return new Response(
        JSON.stringify({ success: false, error: 'अमान्य लॉगिन क्रेडेंशियल।' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Supabase Auth Verification
    const supabase = getServerSupabase(runtimeEnv);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      recordLoginAttempt(clientIp, false);
      return new Response(
        JSON.stringify({ success: false, error: error?.message || 'अमान्य लॉगिन क्रेडेंशियल।' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Login successful: reset rate limiter for this IP
    recordLoginAttempt(clientIp, true);

    // Set HTTP-only secure session cookies
    cookies.set('sb-access-token', data.session.access_token, {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    if (data.session.refresh_token) {
      cookies.set('sb-refresh-token', data.session.refresh_token, {
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      });
    }

    // Reset MFA verification state on each fresh login
    cookies.delete('admin-mfa-verified', { path: '/' });

    return new Response(
      JSON.stringify({
        success: true,
        redirect: '/admin/mfa',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'आंतरिक सर्वर त्रुटि';
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
