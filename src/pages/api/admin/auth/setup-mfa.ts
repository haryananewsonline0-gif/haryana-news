// ==============================================================================
// Admin Auth API: TOTP MFA Enrollment Setup
// Endpoint: POST /api/admin/auth/setup-mfa
// Generates TOTP secret and QR code for Google Authenticator / Authy
// ==============================================================================

import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export const prerender = false;

export const POST: APIRoute = async ({ cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const accessToken = cookies.get('sb-access-token')?.value;

  if (!accessToken) {
    return new Response(JSON.stringify({ success: false, error: 'अनधिकृत अनुरोध' }), {
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
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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

    // Set user session with access token
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return new Response(JSON.stringify({ success: false, error: 'अमान्य सत्र' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check existing factors
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
    if (factorsError) {
      console.error('MFA list factors error:', factorsError);
    }

    const verifiedFactor = factors?.totp?.find((f) => f.status === 'verified');
    if (verifiedFactor) {
      return new Response(
        JSON.stringify({
          success: true,
          alreadyEnrolled: true,
          factorId: verifiedFactor.id,
          message: '2FA पहले से कॉन्फ़िगर किया हुआ है।',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Enroll a new TOTP factor
    const { data: enrollData, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      issuer: 'HaryanaNews',
      friendlyName: `Admin-${userData.user.email?.split('@')[0]}`,
    });

    if (enrollError || !enrollData) {
      return new Response(
        JSON.stringify({
          success: false,
          error: enrollError?.message || '2FA सेट करने में त्रुटि',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        factorId: enrollData.id,
        qrCode: enrollData.totp.qr_code,
        secret: enrollData.totp.secret,
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
