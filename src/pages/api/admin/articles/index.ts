// ==============================================================================
// Admin Articles API: Create New Article
// Endpoint: POST /api/admin/articles
// ==============================================================================

import type { APIRoute } from 'astro';
import { verifyAdminSession } from '@/lib/auth/session';
import { getServiceSupabase } from '@/lib/supabase/server';
import type { Database, ArticleStatus } from '@/types/database';

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

  try {
    const body = await request.json();
    const title = (body.title || '').trim();
    const slug = (body.slug || '').trim().toLowerCase().replace(/[\s/]+/g, '-');
    const category = (body.category || '').trim();
    const district = (body.district || 'हरियाणा').trim();
    const summary = (body.summary || body.excerpt || title).trim();
    const body_html = (body.body_html || body.content || '').trim();
    const thumbnail_url = (body.thumbnail_url || body.featured_image || '').trim();
    const image_alt = (body.image_alt || body.image_caption || 'प्रतीकात्मक तस्वीर (हरियाणा न्यूज़)').trim();
    const rawStatus = body.status === 'published' ? 'published' : 'draft';
    const status: ArticleStatus = rawStatus;
    const seo_title = (body.seo_title || title).trim();
    const seo_description = (body.seo_description || body.meta_description || summary).trim();
    const source_name = (body.source_name || 'विशेष संवाददाता').trim();
    const source_url = body.source_url ? String(body.source_url).trim() : null;
    const slot_key = (body.slot_key || 'manual_editorial').trim();

    let tags: string[] = [];
    if (Array.isArray(body.tags)) {
      tags = body.tags.map((t: unknown) => String(t).trim()).filter(Boolean);
    } else if (typeof body.keywords === 'string') {
      tags = body.keywords.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    if (!title || !slug || !category || !body_html) {
      return new Response(
        JSON.stringify({ success: false, error: 'शीर्षक, स्लग, श्रेणी और सामग्री आवश्यक हैं।' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash for duplicate checking
    const encoder = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-256', encoder.encode(title + body_html));
    const content_hash = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const insertPayload: Database['public']['Tables']['articles']['Insert'] = {
      title,
      slug,
      category,
      district,
      summary,
      body_html,
      thumbnail_url,
      image_alt,
      status,
      published_at: status === 'published' ? new Date().toISOString() : null,
      seo_title,
      seo_description,
      tags,
      source_name,
      source_url,
      slot_key,
      content_hash,
      views: 0,
    };

    const supabase = getServiceSupabase(runtimeEnv);
    const { data, error } = await supabase
      .from('articles')
      .insert([insertPayload] as any)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, message: 'लेख सफलतापूर्वक सहेजा गया।', article: data }),
      { status: 201, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'आंतरिक त्रुटि';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
