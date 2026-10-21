// ==============================================================================
// Content Hashing & 48h Duplicate Article Detection
// ==============================================================================

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

/**
 * Computes SHA-256 hash of title and summary in standard hex
 */
export async function computeContentHash(title: string, summary: string): Promise<string> {
  const normalized = `${title.trim().toLowerCase()}|${summary.trim().toLowerCase()}`;
  const data = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Jaccard token similarity for Hindi headlines
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const tokenize = (t: string) =>
    new Set(t.toLowerCase().replace(/[^\u0900-\u097Fa-z0-9\s]/g, '').split(/\s+/).filter(Boolean));

  const words1 = tokenize(title1);
  const words2 = tokenize(title2);

  if (words1.size === 0 || words2.size === 0) return 0;

  let intersection = 0;
  for (const w of words1) {
    if (words2.has(w)) intersection++;
  }

  const union = new Set([...words1, ...words2]).size;
  return intersection / union;
}

/**
 * Checks if the generated article is a duplicate of any article published in the last 48 hours
 */
export async function checkForDuplicateArticle(
  supabase: SupabaseClient,
  title: string,
  contentHash: string
): Promise<{ isDuplicate: boolean; reason?: string }> {
  const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // 1. Check exact content hash
  const { data: exactMatch } = await supabase
    .from('articles')
    .select('id, title, slug')
    .eq('content_hash', contentHash)
    .gte('created_at', fortyEightHoursAgo)
    .maybeSingle();

  if (exactMatch) {
    return {
      isDuplicate: true,
      reason: `Exact content hash matched recent article '${exactMatch.title}' (ID: ${exactMatch.id})`,
    };
  }

  // 2. Check title similarity against recent articles
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('id, title')
    .gte('created_at', fortyEightHoursAgo)
    .order('created_at', { ascending: false })
    .limit(100);

  if (recentArticles) {
    for (const recent of recentArticles) {
      const similarity = calculateTitleSimilarity(title, recent.title);
      if (similarity >= 0.8) {
        return {
          isDuplicate: true,
          reason: `High headline similarity (${Math.round(similarity * 100)}%) with article '${recent.title}'`,
        };
      }
    }
  }

  return { isDuplicate: false };
}
