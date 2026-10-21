// ==============================================================================
// Admin Trigger Slot API
// Endpoint: POST /api/admin/trigger-slot
// Manually triggers the generate-article Edge Function for a specific slot
// ==============================================================================

import type { APIRoute } from 'astro';
import { verifyAdminSession } from '@/lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const session = await verifyAdminSession(cookies, runtimeEnv);

  if (!session.isAuthenticated || !session.isAdmin || !session.isMfaVerified) {
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

  const cronSecret =
    runtimeEnv?.CRON_SECRET ||
    import.meta.env.CRON_SECRET ||
    '';

  try {
    const body = await request.json();
    const slotId = body.slot_id;

    if (!slotId) {
      return new Response(JSON.stringify({ success: false, error: 'स्लॉट आईडी आवश्यक है।' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Call Edge Function
    const functionUrl = `${supabaseUrl}/functions/v1/generate-article`;
    const edgeRes = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-cron-secret': cronSecret,
      },
      body: JSON.stringify({
        slot_id: slotId,
        manual_trigger: true,
      }),
    });

    const edgeData = await edgeRes.json();

    if (!edgeRes.ok) {
      return new Response(
        JSON.stringify({
          success: false,
          error: edgeData.error || 'एज फंक्शन निष्पादन विफल रहा।',
          details: edgeData,
        }),
        { status: edgeRes.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'लेख सफलतापूर्वक जनरेट व संसाधित किया गया।',
        data: edgeData,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'आंतरिक त्रुटि';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
