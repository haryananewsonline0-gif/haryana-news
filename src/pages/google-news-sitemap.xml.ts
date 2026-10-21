import type { APIRoute } from 'astro';
import { getServerSupabase } from '@/lib/supabase/server';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const siteUrl = import.meta.env.SITE_URL || `${url.protocol}//${url.host}`;
  const runtimeEnv = locals?.runtime?.env;

  const client = getServerSupabase(runtimeEnv);

  // Compute timestamp 48 hours ago
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Fetch published articles in last 48 hours
  const { data } = await client
    .from('articles')
    .select('slug, title, published_at, created_at')
    .eq('status', 'published')
    .gte('published_at', fortyEightHoursAgo)
    .order('published_at', { ascending: false })
    .limit(250);

  const recentArticles = data as Array<{
    slug: string;
    title: string;
    published_at: string | null;
    created_at: string;
  }> | null;

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">`;

  if (recentArticles && recentArticles.length > 0) {
    for (const art of recentArticles) {
      const pubDate = new Date(art.published_at || art.created_at).toISOString();
      const escapedTitle = art.title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

      xml += `
  <url>
    <loc>${siteUrl}/news/${art.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>हरियाणा न्यूज़</news:name>
        <news:language>hi</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapedTitle}</news:title>
    </news:news>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600', // Cache 10 min for Google News bot
    },
  });
};
