// ==============================================================================
// Admin Auth API: TOTP MFA Verification Handler
// Endpoint: POST /api/admin/auth/verify-mfa
// Verifies 6-digit TOTP code and grants admin session
// ==============================================================================

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const accessToken = cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ success: false, error: 'सत्र समाप्त हो गया है। कृपया पुनः लॉगिन करें।' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabaseUrl =
    runtimeEnv?.SUPABASE_URL ||
    runtimeEnv?.PUBLIC_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL ||
    '';

  const supabaseAnonKey =
    runtimeEnv?.SUPABASE_ANON_KEY ||
    runtimeEnv?.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    '';

  try {
    const body = await request.json();
    const code = (body.code || '').trim().replace(/\s+/g, '');
    let factorId = body.factorId || '';

    if (!code || code.length !== 6) {
      return new Response(
        JSON.stringify({ success: false, error: 'कृपया 6 अंकों का मान्य 2FA कोड दर्ज करें।' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Client authenticated with the user's access token
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // If factorId not provided, list factors and pick the verified or latest factor
    if (!factorId) {
      const { data: factors, error: factorsError } = await client.auth.mfa.listFactors();
      if (factorsError || !factors.totp || factors.totp.length === 0) {
        return new Response(
          JSON.stringify({
            success: false,
            needsSetup: true,
            error: 'कोई 2FA फैक्टर कॉन्फ़िगर नहीं है। कृपया पहले 2FA सेटअप करें।',
          }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Prefer verified factor; fallback to the most recent unverified factor
      const verified = factors.totp.find((f) => f.status === 'verified');
      factorId = verified ? verified.id : factors.totp[factors.totp.length - 1].id;
    }

    // Challenge and verify code
    const { error: verifyError } = await client.auth.mfa.challengeAndVerify({
      factorId,
      code,
    });

    if (verifyError) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'गलत 2FA कोड। कृपया पुनः प्रयास करें।',
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Set MFA verified cookie
    cookies.set('admin-mfa-verified', 'true', {
      path: '/',
      httpOnly: true,
      secure: import.meta.env.PROD,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8, // 8 hours
    });

    return new Response(
      JSON.stringify({
        success: true,
        redirect: '/admin',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'आंतरिक सर्वर त्रुटि';
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
