import type { APIRoute } from 'astro';
import { getServerSupabase } from '@/lib/supabase/server';
import { getOptimizedImageUrl } from '@/utils/imagekit';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const siteUrl = import.meta.env.SITE_URL || `${url.protocol}//${url.host}`;
  const runtimeEnv = locals?.runtime?.env;

  const client = getServerSupabase(runtimeEnv);

  const { data } = await client
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(50);

  const articles = data as import('@/types/database').Article[] | null;

  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>हरियाणा न्यूज़ (Haryana News)</title>
    <link>${siteUrl}</link>
    <description>हरियाणा, सिरसा, फतेहाबाद, हिसार, मंडी भाव, मौसम, सरकारी योजनाएं व खेल की ताज़ा खबरें</description>
    <language>hi-IN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>`;

  if (articles) {
    for (const art of articles) {
      const pubDate = new Date(art.published_at || art.created_at).toUTCString();
      const articleUrl = `${siteUrl}/news/${art.slug}`;
      const escapedTitle = art.title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const escapedSummary = art.summary
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

      const imgUrl = getOptimizedImageUrl(art.thumbnail_url, { width: 1200, height: 630 });

      rss += `
    <item>
      <title>${escapedTitle}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapedSummary}</description>
      <category>${art.category}</category>
      <media:content url="${imgUrl}" medium="image" width="1200" height="630" />
    </item>`;
    }
  }

  rss += `
  </channel>
</rss>`;

  return new Response(rss, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800',
    },
  });
};
