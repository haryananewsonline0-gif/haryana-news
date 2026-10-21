// ==============================================================================
// Admin Session Verification & Auth Helpers
// ==============================================================================

import type { AstroCookies } from 'astro';
import { getServerSupabase } from '@/lib/supabase/server';

export interface AdminSessionResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMfaVerified: boolean;
  email?: string;
  userId?: string;
}

export async function verifyAdminSession(
  cookies: AstroCookies,
  runtimeEnv?: Record<string, string | undefined>
): Promise<AdminSessionResult> {
  const adminEmail = (runtimeEnv?.ADMIN_EMAIL || import.meta.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const accessToken = cookies.get('sb-access-token')?.value;
  const mfaCookie = cookies.get('admin-mfa-verified')?.value;

  if (!accessToken) {
    return {
      isAuthenticated: false,
      isAdmin: false,
      isMfaVerified: false,
    };
  }

  try {
    const supabase = getServerSupabase(runtimeEnv);
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user || !data.user.email) {
      return {
        isAuthenticated: false,
        isAdmin: false,
        isMfaVerified: false,
      };
    }

    const userEmail = data.user.email.trim().toLowerCase();
    const isAdmin = adminEmail ? userEmail === adminEmail : true;
    const isMfaVerified = mfaCookie === 'true';

    return {
      isAuthenticated: true,
      isAdmin,
      isMfaVerified,
      email: userEmail,
      userId: data.user.id,
    };
  } catch (err) {
    console.error('Session verification error:', err);
    return {
      isAuthenticated: false,
      isAdmin: false,
      isMfaVerified: false,
    };
  }
}
