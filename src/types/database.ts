// ==============================================================================
// Database Type Definitions — Haryana News
// ==============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ArticleStatus = 'published' | 'draft' | 'unpublished';

export type LogStatus = 'success' | 'failure' | 'skipped' | 'draft_safety';

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

export interface Category {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body_html: string;
  category: string;
  tags: string[];
  district: string | null;
  thumbnail_url: string;
  image_alt: string;
  source_name: string;
  source_url: string | null;
  status: ArticleStatus;
  slot_key: string;
  published_at: string | null;
  created_at: string;
  views: number;
  seo_title: string;
  seo_description: string;
  content_hash: string;
}

export interface Slot {
  id: string;
  slot_key: string;
  name: string;
  schedule_ist: string;
  description: string | null;
  is_active: boolean;
  last_run_at: string | null;
  created_at: string;
}

export interface GenerationLog {
  id: string;
  slot: string;
  status: LogStatus;
  error: string | null;
  duration_ms: number | null;
  created_at: string;
}

export interface Settings {
  id: number;
  kill_switch: boolean;
  whatsapp_enabled: boolean;
  updated_at: string;
}

export interface ManualData {
  key: string;
  value: Json;
  updated_at: string;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Category, 'id' | 'created_at'>>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'views'> & {
          id?: string;
          created_at?: string;
          views?: number;
        };
        Update: Partial<Omit<Article, 'id' | 'created_at'>>;
      };
      slots: {
        Row: Slot;
        Insert: Omit<Slot, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<Slot, 'id' | 'created_at'>>;
      };
      generation_logs: {
        Row: GenerationLog;
        Insert: Omit<GenerationLog, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<GenerationLog, 'id' | 'created_at'>>;
      };
      settings: {
        Row: Settings;
        Insert: Omit<Settings, 'updated_at'> & { updated_at?: string };
        Update: Partial<Omit<Settings, 'id'>>;
      };
      manual_data: {
        Row: ManualData;
        Insert: ManualData;
        Update: Partial<ManualData>;
      };
      admins: {
        Row: AdminUser;
        Insert: Omit<AdminUser, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<AdminUser, 'id' | 'created_at'>>;
      };
    };
  };
}
