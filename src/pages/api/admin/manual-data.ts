// ==============================================================================
// Admin Manual Data API (Fallback Rates & Commodities)
// Endpoint: GET, POST /api/admin/manual-data
// ==============================================================================

import type { APIRoute } from 'astro';
import { verifyAdminSession } from '@/lib/auth/session';
import { getServiceSupabase } from '@/lib/supabase/server';
import type { ManualData, Json } from '@/types/database';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const session = await verifyAdminSession(cookies, runtimeEnv);

  if (!session.isAuthenticated || !session.isAdmin || !session.isMfaVerified) {
    return new Response(JSON.stringify({ success: false, error: 'अनधिकृत अनुरोध' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = getServiceSupabase(runtimeEnv);
    const { data, error } = await supabase.from('manual_data').select('*');

    if (error) throw error;

    const map: Record<string, unknown> = {};
    for (const item of (data as ManualData[]) || []) {
      map[item.key] = item.value;
    }

    return new Response(JSON.stringify({ success: true, data: map }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'आंतरिक त्रुटि';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const session = await verifyAdminSession(cookies, runtimeEnv);

  if (!session.isAuthenticated || !session.isAdmin || !session.isMfaVerified) {
    return new Response(JSON.stringify({ success: false, error: 'अनधिकृत अनुरोध' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof value !== 'object') {
      return new Response(
        JSON.stringify({ success: false, error: 'key और मान्य JSON value आवश्यक हैं।' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const supabase = getServiceSupabase(runtimeEnv);

    const record: ManualData = {
      key: String(key),
      value: value as Json,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('manual_data')
      .upsert(record as any)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: 'दरें सफलतापूर्वक अपडेट की गईं।', data }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'आंतरिक त्रुटि';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
