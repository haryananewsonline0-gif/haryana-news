import type { APIRoute } from 'astro';
import { getServerSupabase, getActiveCategories } from '@/lib/supabase/server';
import { HARYANA_DISTRICTS } from '@/constants/districts';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const siteUrl = import.meta.env.SITE_URL || `${url.protocol}//${url.host}`;
  const runtimeEnv = locals?.runtime?.env;

  const client = getServerSupabase(runtimeEnv);

  const { data } = await client
    .from('articles')
    .select('slug, published_at, created_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(1000);

  const articles = data as Array<{ slug: string; published_at: string | null; created_at: string }> | null;

  const categories = await getActiveCategories(runtimeEnv);

  const staticPages = [
    '',
    '/about',
    '/contact',
    '/privacy-policy',
    '/disclaimer',
    '/terms',
    '/search',
  ];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Static pages
  for (const page of staticPages) {
    xml += `
  <url>
    <loc>${siteUrl}${page}</loc>
    <changefreq>${page === '' ? 'hourly' : 'monthly'}</changefreq>
    <priority>${page === '' ? '1.0' : '0.5'}</priority>
  </url>`;
  }

  // Category pages
  for (const cat of categories) {
    xml += `
  <url>
    <loc>${siteUrl}/category/${cat.slug}</loc>
    <changefreq>hourly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  // District pages
  for (const district of HARYANA_DISTRICTS) {
    xml += `
  <url>
    <loc>${siteUrl}/district/${district.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`;
  }

  // Articles
  if (articles) {
    for (const art of articles) {
      const date = art.published_at || art.created_at;
      const lastmod = new Date(date).toISOString();
      xml += `
  <url>
    <loc>${siteUrl}/news/${art.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    }
  }

  xml += `
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
