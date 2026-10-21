// ==============================================================================
// Admin Article Detail & Mutation API
// Endpoint: GET, PUT/PATCH, DELETE /api/admin/articles/[id]
// ==============================================================================

import type { APIRoute } from 'astro';
import { verifyAdminSession } from '@/lib/auth/session';
import { getServiceSupabase } from '@/lib/supabase/server';
import type { Database, Article, ArticleStatus } from '@/types/database';

export const prerender = false;

// GET single article
export const GET: APIRoute = async ({ params, cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const session = await verifyAdminSession(cookies, runtimeEnv);

  if (!session.isAuthenticated || !session.isAdmin || !session.isMfaVerified) {
    return new Response(JSON.stringify({ success: false, error: 'अनधिकृत अनुरोध' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'आईडी आवश्यक है' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = getServiceSupabase(runtimeEnv);
  const { data, error } = await supabase.from('articles').select('*').eq('id', id).maybeSingle();

  if (error || !data) {
    return new Response(JSON.stringify({ success: false, error: 'लेख नहीं मिला' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, article: data }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

// UPDATE article
export const PUT: APIRoute = async ({ params, request, cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const session = await verifyAdminSession(cookies, runtimeEnv);

  if (!session.isAuthenticated || !session.isAdmin || !session.isMfaVerified) {
    return new Response(JSON.stringify({ success: false, error: 'अनधिकृत अनुरोध' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'आईडी आवश्यक है' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await request.json();
    const supabase = getServiceSupabase(runtimeEnv);

    // Get current record
    const { data: currentRecord } = await supabase
      .from('articles')
      .select('published_at, status')
      .eq('id', id)
      .maybeSingle();

    if (!currentRecord) {
      return new Response(JSON.stringify({ success: false, error: 'लेख नहीं मिला' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const currentArticle = currentRecord as Partial<Article>;
    const updates: Database['public']['Tables']['articles']['Update'] = {};

    if (body.title !== undefined) updates.title = String(body.title).trim();
    if (body.slug !== undefined) updates.slug = String(body.slug).trim().toLowerCase().replace(/[\s/]+/g, '-');
    if (body.category !== undefined) updates.category = String(body.category).trim();
    if (body.district !== undefined) updates.district = String(body.district).trim();
    if (body.summary !== undefined || body.excerpt !== undefined) {
      updates.summary = String(body.summary || body.excerpt).trim();
    }
    if (body.body_html !== undefined || body.content !== undefined) {
      updates.body_html = String(body.body_html || body.content).trim();
    }
    if (body.thumbnail_url !== undefined || body.featured_image !== undefined) {
      updates.thumbnail_url = String(body.thumbnail_url || body.featured_image).trim();
    }
    if (body.image_alt !== undefined || body.image_caption !== undefined) {
      updates.image_alt = String(body.image_alt || body.image_caption).trim();
    }
    if (body.seo_title !== undefined) updates.seo_title = String(body.seo_title).trim();
    if (body.seo_description !== undefined || body.meta_description !== undefined) {
      updates.seo_description = String(body.seo_description || body.meta_description).trim();
    }
    if (body.tags !== undefined) {
      updates.tags = Array.isArray(body.tags)
        ? body.tags.map((t: unknown) => String(t).trim())
        : typeof body.tags === 'string'
        ? (body.tags as string).split(',').map((t: string) => t.trim())
        : [];
    } else if (body.keywords !== undefined) {
      updates.tags = String(body.keywords).split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    if (body.status !== undefined) {
      const rawStatus = body.status === 'published' ? 'published' : body.status === 'unpublished' ? 'unpublished' : 'draft';
      updates.status = rawStatus as ArticleStatus;
      if (rawStatus === 'published' && !currentArticle.published_at) {
        updates.published_at = new Date().toISOString();
      }
    }

    const { data, error } = await (supabase as any)
      .from('articles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: 'लेख सफलतापूर्वक अपडेट किया गया।', article: data }),
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

// DELETE article
export const DELETE: APIRoute = async ({ params, cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const session = await verifyAdminSession(cookies, runtimeEnv);

  if (!session.isAuthenticated || !session.isAdmin || !session.isMfaVerified) {
    return new Response(JSON.stringify({ success: false, error: 'अनधिकृत अनुरोध' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const id = params.id;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'आईडी आवश्यक है' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabase = getServiceSupabase(runtimeEnv);
    const { error } = await supabase.from('articles').delete().eq('id', id);

    if (error) throw error;

    return new Response(
      JSON.stringify({ success: true, message: 'लेख सफलतापूर्वक हटा दिया गया।' }),
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
