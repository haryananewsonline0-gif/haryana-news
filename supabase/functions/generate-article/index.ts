// ==============================================================================
// Supabase Edge Function: generate-article (Deno Runtime)
// Triggered by external cron-job.org via HTTPS with secret header x-cron-secret
// Full autonomous publishing pipeline for Haryana News (haryananews.online)
// ==============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

import type { SlotKey, FetchedSlotData, GenerationResult } from './types.ts';
import { fetchWeatherData } from './data-fetchers/weather.ts';
import { fetchMandiData } from './data-fetchers/mandi.ts';
import { fetchCricketData } from './data-fetchers/cricket.ts';
import { fetchRatesData } from './data-fetchers/rates.ts';
import { fetchPanchangOrHistoryData } from './data-fetchers/panchang.ts';
import { fetchNewsTopicData } from './data-fetchers/rss.ts';
import { generateArticleWithGemini } from './gemini.ts';
import { computeContentHash, checkForDuplicateArticle } from './duplicate.ts';
import { evaluateEditorialSafety } from './safety.ts';
import { generateAndUploadThumbnail } from './image.ts';
import { broadcastArticleToWhatsAppGroup, alertOwnerOnDraftSafety } from './whatsapp.ts';

/**
 * Constant-time string comparison to prevent timing attacks on CRON_SECRET
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Creates a clean URL-friendly unique slug from Hindi/English title
 */
function generateUniqueSlug(title: string, slotKey: string): string {
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const randSuffix = Math.random().toString(36).substring(2, 7);

  // Transliterate or clean title
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 40);

  const prefix = cleanTitle.length > 5 ? cleanTitle : slotKey.replace(/_/g, '-');
  return `${prefix}-${dateStr}-${randSuffix}`;
}

serve(async (req: Request) => {
  const startTime = Date.now();
  const url = new URL(req.url);

  // Health check endpoint
  if (req.method === 'GET' && url.pathname === '/health') {
    return new Response(JSON.stringify({ status: 'ok', service: 'generate-article' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 1. Verify CRON_SECRET authentication
  const expectedSecret = Deno.env.get('CRON_SECRET');
  const providedSecret = req.headers.get('x-cron-secret');

  if (!expectedSecret || !providedSecret || !constantTimeCompare(providedSecret, expectedSecret)) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or missing x-cron-secret header' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Read slot key from query param ?slot=... or JSON body
  let slotKey = url.searchParams.get('slot') as SlotKey | null;
  if (!slotKey && req.method === 'POST') {
    try {
      const body = await req.json();
      slotKey = body.slot;
    } catch {
      // Body parsing optional
    }
  }

  if (!slotKey) {
    return new Response(JSON.stringify({ error: "Missing required parameter 'slot'" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Initialize Supabase admin client (Service Role Key)
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
  const siteUrl = Deno.env.get('SITE_URL') || 'https://haryananews.online';

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Server misconfigured: missing Supabase credentials' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // 2. Check kill switch and system settings
    const { data: settings } = await supabase
      .from('settings')
      .select('kill_switch, whatsapp_enabled')
      .eq('id', 1)
      .maybeSingle();

    if (settings?.kill_switch) {
      console.warn('Kill switch is ACTIVE. Skipping article generation.');
      const duration = Date.now() - startTime;
      await supabase.from('generation_logs').insert({
        slot: slotKey,
        status: 'skipped',
        error: 'Kill switch is active',
        duration_ms: duration,
      });

      return new Response(
        JSON.stringify({ success: true, slot: slotKey, status: 'skipped', message: 'Kill switch active' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 3. Fetch manual_data fallback if needed
    const { data: manualDataRows } = await supabase.from('manual_data').select('key, value');
    const manualMap: Record<string, Record<string, unknown>> = {};
    if (manualDataRows) {
      for (const row of manualDataRows) {
        manualMap[row.key] = row.value;
      }
    }

    // 4. Fetch real data for the slot
    let slotData: FetchedSlotData;

    switch (slotKey) {
      case 'weather_districtwise':
        slotData = await fetchWeatherData();
        break;

      case 'mandi_bhav':
        slotData = await fetchMandiData(manualMap['mandi_fallback']);
        break;

      case 'cricket_sports':
        slotData = await fetchCricketData();
        break;

      case 'gold_silver':
      case 'petrol_diesel_lpg':
      case 'share_market':
        slotData = fetchRatesData(slotKey, manualMap[slotKey]);
        break;

      case 'panchang_choghadiya':
      case 'rashifal':
      case 'today_in_history':
        slotData = fetchPanchangOrHistoryData(slotKey);
        break;

      default:
        // News RSS and trending slots
        slotData = await fetchNewsTopicData(slotKey);
        break;
    }

    // 5. Send real data to Google Gemini AI
    console.log(`Generating article with Gemini for slot: [${slotKey}]...`);
    const generated = await generateArticleWithGemini(slotData);

    // 6. Duplicate check against last 48 hours
    const contentHash = await computeContentHash(generated.title, generated.summary);
    const dupCheck = await checkForDuplicateArticle(supabase, generated.title, contentHash);

    if (dupCheck.isDuplicate) {
      console.warn(`Duplicate detected: ${dupCheck.reason}. Skipping publication.`);
      const duration = Date.now() - startTime;
      await supabase.from('generation_logs').insert({
        slot: slotKey,
        status: 'skipped',
        error: `Duplicate: ${dupCheck.reason}`,
        duration_ms: duration,
      });

      return new Response(
        JSON.stringify({ success: true, slot: slotKey, status: 'skipped', reason: dupCheck.reason }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 7. Editorial Safety Filter
    const safety = evaluateEditorialSafety(generated.title, generated.summary, generated.body_html);
    const articleStatus = safety.status; // 'published' or 'draft'

    // 8. Generate and upload thumbnail via ImageKit
    const slug = generateUniqueSlug(generated.title, slotKey);
    console.log(`Generating thumbnail for slug: ${slug}...`);
    const thumbnailUrl = await generateAndUploadThumbnail(
      generated.image_prompt,
      generated.title,
      slotData.category,
      slug
    );

    // 9. Insert article into database
    const publishedAt = articleStatus === 'published' ? new Date().toISOString() : null;

    const { data: insertedArticle, error: insertError } = await supabase
      .from('articles')
      .insert({
        slug,
        title: generated.title,
        summary: generated.summary,
        body_html: generated.body_html,
        category: slotData.category,
        tags: generated.tags || [],
        district: slotData.district || null,
        thumbnail_url: thumbnailUrl,
        image_alt: generated.title,
        source_name: slotData.sourceName,
        source_url: slotData.sourceUrl || null,
        status: articleStatus,
        slot_key: slotKey,
        published_at: publishedAt,
        seo_title: generated.seo_title,
        seo_description: generated.seo_description,
        content_hash: contentHash,
      })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Database insert failed: ${insertError.message}`);
    }

    // 10. Update slot last_run_at timestamp
    await supabase
      .from('slots')
      .update({ last_run_at: new Date().toISOString() })
      .eq('slot_key', slotKey);

    const articleUrl = `${siteUrl}/news/${slug}`;

    // 11. WhatsApp Broadcast / Owner Alerting
    if (articleStatus === 'published' && settings?.whatsapp_enabled !== false) {
      // Asynchronous non-blocking broadcast to WhatsApp group
      broadcastArticleToWhatsAppGroup(generated.title, generated.summary, articleUrl).catch((err) =>
        console.error('WhatsApp background broadcast error:', err)
      );
    } else if (articleStatus === 'draft') {
      // Sensitive content held in draft -> alert owner immediately
      alertOwnerOnDraftSafety(generated.title, safety.reason || 'संवेदनशील विषय', insertedArticle.id).catch(
        (err) => console.error('WhatsApp owner alert error:', err)
      );
    }

    // 12. Log execution in generation_logs
    const duration = Date.now() - startTime;
    await supabase.from('generation_logs').insert({
      slot: slotKey,
      status: articleStatus === 'draft' ? 'draft_safety' : 'success',
      duration_ms: duration,
    });

    const result: GenerationResult = {
      success: true,
      slot: slotKey,
      status: articleStatus,
      article_id: insertedArticle.id,
      slug,
      duration_ms: duration,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error(`Edge function error in slot [${slotKey}]:`, err);

    // Record failure in generation_logs
    try {
      await supabase.from('generation_logs').insert({
        slot: slotKey,
        status: 'failure',
        error: String(err),
        duration_ms: duration,
      });
    } catch (logErr) {
      console.error('Failed to write failure log:', logErr);
    }

    return new Response(
      JSON.stringify({
        success: false,
        slot: slotKey,
        status: 'failure',
        error: (err as Error).message,
        duration_ms: duration,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
