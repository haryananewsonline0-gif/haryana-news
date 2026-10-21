// ==============================================================================
// Admin Settings API
// Endpoint: GET /api/admin/settings, POST /api/admin/settings
// Manages system kill_switch and whatsapp_enabled flags
// ==============================================================================

import type { APIRoute } from 'astro';
import { verifyAdminSession } from '@/lib/auth/session';
import { getServiceSupabase } from '@/lib/supabase/server';
import type { Settings } from '@/types/database';

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
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    const settings = (data as Settings | null) || {
      id: 1,
      kill_switch: false,
      whatsapp_enabled: true,
      updated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({ success: true, settings }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'त्रुटि';
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
    const supabase = getServiceSupabase(runtimeEnv);

    const updates: Partial<Settings> = {
      updated_at: new Date().toISOString(),
    };

    if (typeof body.kill_switch === 'boolean') {
      updates.kill_switch = body.kill_switch;
    }

    if (typeof body.whatsapp_enabled === 'boolean') {
      updates.whatsapp_enabled = body.whatsapp_enabled;
    }

    const { error } = await (supabase as any)
      .from('settings')
      .update(updates)
      .eq('id', 1);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify({ success: true, message: 'सेटिंग्स सफलतापूर्वक अपडेट की गईं।' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'त्रुटि';
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
