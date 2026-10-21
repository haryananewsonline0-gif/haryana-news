// ==============================================================================
// Server-side Supabase Client & Data Access Helpers (Astro SSR)
// ==============================================================================

import { createClient } from '@supabase/supabase-js';
import type { Database, Article, Category } from '@/types/database';

/**
 * Returns a server-side Supabase client.
 * In SSR mode, environment variables can be retrieved from import.meta.env
 * or Cloudflare Pages runtime environment.
 */
export function getServerSupabase(runtimeEnv?: Record<string, string | undefined>) {
  const url =
    runtimeEnv?.SUPABASE_URL ||
    runtimeEnv?.PUBLIC_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL ||
    '';

  const anonKey =
    runtimeEnv?.SUPABASE_ANON_KEY ||
    runtimeEnv?.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Returns an admin/service-role Supabase client for server-side trusted operations.
 */
export function getServiceSupabase(runtimeEnv?: Record<string, string | undefined>) {
  const url =
    runtimeEnv?.SUPABASE_URL ||
    runtimeEnv?.PUBLIC_SUPABASE_URL ||
    import.meta.env.SUPABASE_URL ||
    import.meta.env.PUBLIC_SUPABASE_URL ||
    '';

  const serviceKey =
    runtimeEnv?.SUPABASE_SERVICE_ROLE_KEY ||
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY ||
    runtimeEnv?.SUPABASE_ANON_KEY ||
    runtimeEnv?.PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.SUPABASE_ANON_KEY ||
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY ||
    '';

  return createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}


/**
 * Fetch published articles for homepage or category listing
 */
export async function getPublishedArticles(options: {
  limit?: number;
  offset?: number;
  category?: string;
  district?: string;
  runtimeEnv?: Record<string, string | undefined>;
}): Promise<Article[]> {
  const { limit = 10, offset = 0, category, district, runtimeEnv } = options;
  const client = getServerSupabase(runtimeEnv);

  let query = client
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category', category);
  }

  if (district) {
    query = query.eq('district', district);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching published articles:', error.message);
    return [];
  }

  return (data as Article[]) || [];
}

/**
 * Fetch a single published article by its unique slug
 */
export async function getArticleBySlug(
  slug: string,
  runtimeEnv?: Record<string, string | undefined>
): Promise<Article | null> {
  const client = getServerSupabase(runtimeEnv);

  const { data, error } = await client
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();

  if (error || !data) {
    if (error) console.error(`Error fetching article [${slug}]:`, error.message);
    return null;
  }

  return data as Article;
}

/**
 * Fetch all active categories
 */
export async function getActiveCategories(
  runtimeEnv?: Record<string, string | undefined>
): Promise<Category[]> {
  const client = getServerSupabase(runtimeEnv);

  const { data, error } = await client
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error.message);
    return [];
  }

  return (data as Category[]) || [];
}

/**
 * Fetch manual fallback data by key (e.g., gold_silver, fuel_rates)
 */
export async function getManualDataByKey<T = unknown>(
  key: string,
  runtimeEnv?: Record<string, string | undefined>
): Promise<T | null> {
  const client = getServerSupabase(runtimeEnv);

  const { data, error } = await client
    .from('manual_data')
    .select('value')
    .eq('key', key)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const record = data as unknown as { value: unknown };
  return record.value as T;
}

