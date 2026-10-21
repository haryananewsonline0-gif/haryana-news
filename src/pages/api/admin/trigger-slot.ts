// ==============================================================================
// Admin Trigger Slot API
// Endpoint: POST /api/admin/trigger-slot
// Manually triggers the generate-article Edge Function for a specific slot
// ==============================================================================

import type { APIRoute } from 'astro';
import { verifyAdminSession } from '@/lib/auth/session';
import { generateArticleLocally } from '@/lib/automation/direct-generator';

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

    // 1. Try remote Edge Function if available
    let edgeSuccess = false;
    let edgeData: unknown = null;

    if (supabaseUrl && cronSecret) {
      try {
        const functionUrl = `${supabaseUrl}/functions/v1/generate-article`;
        const edgeRes = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-cron-secret': cronSecret,
          },
          body: JSON.stringify({
            slot: slotId,
            manual_trigger: true,
          }),
        });

        if (edgeRes.ok) {
          edgeData = await edgeRes.json();
          edgeSuccess = true;
        }
      } catch {
        // Fall back to direct generator
      }
    }

    if (edgeSuccess) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'लेख सफलतापूर्वक जनरेट व संसाधित किया गया।',
          data: edgeData,
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Direct Generator Engine (Gemini Flash + Supabase DB)
    const localResult = await generateArticleLocally(slotId, runtimeEnv);

    if (!localResult.success) {
      return new Response(
        JSON.stringify({
          success: false,
          error: localResult.error || 'लेख जनरेट करने में त्रुटि',
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `लेख "${localResult.title}" सफलतापूर्वक प्रकाशित हुआ!`,
        article_id: localResult.articleId,
        slug: localResult.slug,
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
