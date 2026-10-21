-- ==============================================================================
-- Migration: 20261021000001_rls_policies.sql
-- Project: Haryana News (haryananews.online)
-- Description: Zero-trust Row Level Security (RLS) policies
-- ==============================================================================

-- 1. ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Helper function to check if the current user is an authenticated admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.admins
        WHERE email = auth.jwt() ->> 'email'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- 2. CATEGORIES TABLE POLICIES
-- ==============================================================================

-- Anyone (public anon & authenticated) can view active categories
CREATE POLICY "Public read active categories"
ON public.categories
FOR SELECT
USING (is_active = true);

-- Only authenticated admins can insert, update, or delete categories
CREATE POLICY "Admin full access categories"
ON public.categories
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 3. ARTICLES TABLE POLICIES
-- ==============================================================================

-- Public can SELECT only published articles
CREATE POLICY "Public read published articles"
ON public.articles
FOR SELECT
USING (status = 'published');

-- Authenticated admins can view ALL articles (including draft and unpublished)
CREATE POLICY "Admin select all articles"
ON public.articles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Authenticated admins can insert new articles
CREATE POLICY "Admin insert articles"
ON public.articles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());

-- Authenticated admins can update articles
CREATE POLICY "Admin update articles"
ON public.articles
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Authenticated admins can delete articles
CREATE POLICY "Admin delete articles"
ON public.articles
FOR DELETE
TO authenticated
USING (public.is_admin());

-- ==============================================================================
-- 4. SLOTS TABLE POLICIES (Timetable configuration)
-- ==============================================================================

-- Admin-only access to slots table
CREATE POLICY "Admin full access slots"
ON public.slots
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 5. GENERATION LOGS TABLE POLICIES
-- ==============================================================================

-- Admin-only access to generation logs
CREATE POLICY "Admin full access generation logs"
ON public.generation_logs
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 6. SETTINGS TABLE POLICIES
-- ==============================================================================

-- Admin-only access to system settings
CREATE POLICY "Admin full access settings"
ON public.settings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 7. MANUAL DATA TABLE POLICIES (Fallback Rates)
-- ==============================================================================

-- Public can read manual fallback rates (weather/mandi/gold/fuel) for SSR rendering
CREATE POLICY "Public read manual data"
ON public.manual_data
FOR SELECT
USING (true);

-- Only admins can modify manual data rates
CREATE POLICY "Admin full access manual data"
ON public.manual_data
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 8. ADMINS ALLOWLIST POLICIES
-- ==============================================================================

-- Authenticated users can check if their own email exists in admins allowlist
CREATE POLICY "Admin read own allowlist record"
ON public.admins
FOR SELECT
TO authenticated
USING (email = auth.jwt() ->> 'email');
