-- ==============================================================================
-- Migration: 20261021000000_initial_schema.sql
-- Project: Haryana News (haryananews.online)
-- Description: Core database schema definition with performance indexes
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    body_html TEXT NOT NULL,
    category TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
    tags TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    district TEXT,
    thumbnail_url TEXT NOT NULL,
    image_alt TEXT NOT NULL,
    source_name TEXT NOT NULL,
    source_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('published', 'draft', 'unpublished')) DEFAULT 'draft',
    slot_key TEXT NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    views INTEGER DEFAULT 0 NOT NULL,
    seo_title TEXT NOT NULL,
    seo_description TEXT NOT NULL,
    content_hash TEXT NOT NULL
);

-- 3. SLOTS TABLE (Automated Timetable Configuration)
CREATE TABLE IF NOT EXISTS public.slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    schedule_ist TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. GENERATION LOGS TABLE
CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'skipped', 'draft_safety')),
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. SETTINGS TABLE (Singleton)
CREATE TABLE IF NOT EXISTS public.settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    kill_switch BOOLEAN DEFAULT false NOT NULL,
    whatsapp_enabled BOOLEAN DEFAULT true NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 6. MANUAL DATA TABLE (Fallback rates for gold, silver, fuel, share market, mandi)
CREATE TABLE IF NOT EXISTS public.manual_data (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. ADMINS ALLOWLIST TABLE
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ==============================================================================
-- PERFORMANCE INDEXES
-- ==============================================================================

-- Index for fast lookup by article slug
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);

-- Index for homepage & latest news feed (filtered by published status)
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC) WHERE status = 'published';

-- Composite index for category pages
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category, published_at DESC);

-- Index for district-specific news
CREATE INDEX IF NOT EXISTS idx_articles_district ON public.articles(district, published_at DESC);

-- Index for 48h duplicate prevention checks
CREATE INDEX IF NOT EXISTS idx_articles_content_hash ON public.articles(content_hash);

-- Index for slot-specific historical queries
CREATE INDEX IF NOT EXISTS idx_articles_slot_key ON public.articles(slot_key, created_at DESC);

-- Index for generation logs viewing in admin
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON public.generation_logs(created_at DESC);
