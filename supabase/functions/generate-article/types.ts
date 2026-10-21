// ==============================================================================
// Types for Supabase Edge Function: generate-article (Deno Runtime)
// ==============================================================================

export type SlotKey =
  | 'rashifal'
  | 'panchang_choghadiya'
  | 'weather_districtwise'
  | 'today_in_history'
  | 'gold_silver'
  | 'petrol_diesel_lpg'
  | 'share_market'
  | 'govt_schemes'
  | 'govt_jobs'
  | 'train_bus_tech'
  | 'mandi_bhav'
  | 'cricket_sports'
  | 'top10_news'
  | 'google_trends_india'
  | 'regional_coverage';

export interface FetchedSlotData {
  slotKey: SlotKey;
  category: string;
  district?: string;
  sourceName: string;
  sourceUrl?: string;
  headlineContext: string;
  rawNumbersOrFacts: unknown;
  instructionsForGemini: string;
}

export interface GeminiArticleOutput {
  title: string;
  summary: string;
  body_html: string;
  tags: string[];
  seo_title: string;
  seo_description: string;
  image_prompt: string;
}

export interface GenerationResult {
  success: boolean;
  slot: string;
  status: 'published' | 'draft' | 'skipped' | 'failure';
  article_id?: string;
  slug?: string;
  error?: string;
  duration_ms: number;
}
