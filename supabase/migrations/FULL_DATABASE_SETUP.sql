-- ==============================================================================
-- HARYANA NEWS (haryananews.online) — COMPLETE DATABASE MASTER SETUP
-- Run this entire script in Supabase Dashboard > SQL Editor > New query
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CREATE TABLES
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.generation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slot TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'skipped', 'draft_safety')),
    error TEXT,
    duration_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    kill_switch BOOLEAN DEFAULT false NOT NULL,
    whatsapp_enabled BOOLEAN DEFAULT true NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.manual_data (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    role TEXT DEFAULT 'admin' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. INDEXES
CREATE INDEX IF NOT EXISTS idx_articles_slug ON public.articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON public.articles(published_at DESC) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.articles(category, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_district ON public.articles(district, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_content_hash ON public.articles(content_hash);
CREATE INDEX IF NOT EXISTS idx_articles_slot_key ON public.articles(slot_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_created_at ON public.generation_logs(created_at DESC);

-- 4. ROW LEVEL SECURITY (RLS)
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manual_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

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

-- RLS Policies
DROP POLICY IF EXISTS "Public read active categories" ON public.categories;
CREATE POLICY "Public read active categories" ON public.categories FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Admin full access categories" ON public.categories;
CREATE POLICY "Admin full access categories" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read published articles" ON public.articles;
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Admin select all articles" ON public.articles;
CREATE POLICY "Admin select all articles" ON public.articles FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin insert articles" ON public.articles;
CREATE POLICY "Admin insert articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin update articles" ON public.articles;
CREATE POLICY "Admin update articles" ON public.articles FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin delete articles" ON public.articles;
CREATE POLICY "Admin delete articles" ON public.articles FOR DELETE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admin full access slots" ON public.slots;
CREATE POLICY "Admin full access slots" ON public.slots FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access generation logs" ON public.generation_logs;
CREATE POLICY "Admin full access generation logs" ON public.generation_logs FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin full access settings" ON public.settings;
CREATE POLICY "Admin full access settings" ON public.settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Public read manual data" ON public.manual_data;
CREATE POLICY "Public read manual data" ON public.manual_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin full access manual data" ON public.manual_data;
CREATE POLICY "Admin full access manual data" ON public.manual_data FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin read own allowlist record" ON public.admins;
CREATE POLICY "Admin read own allowlist record" ON public.admins FOR SELECT TO authenticated USING (email = auth.jwt() ->> 'email');

-- 5. INITIAL SEED DATA
INSERT INTO public.settings (id, kill_switch, whatsapp_enabled, updated_at)
VALUES (1, false, true, now())
ON CONFLICT (id) DO UPDATE 
SET kill_switch = EXCLUDED.kill_switch,
    whatsapp_enabled = EXCLUDED.whatsapp_enabled;

INSERT INTO public.categories (slug, name, description, order_index, is_active)
VALUES
    ('haryana', 'हरियाणा', 'हरियाणा राज्य की सभी ताज़ा व मुख्य खबरें', 1, true),
    ('regional', 'क्षेत्रीय', 'सिरसा, फतेहाबाद, हिसार, आदमपुर, ऐलनाबाद, नोहर व आसपास की खबरें', 2, true),
    ('mandi-bhav', 'मंडी भाव', 'हरियाणा व सीमावर्ती मंडियों के ताज़ा भाव (नरमा, ग्वार, सरसों, गेहूं)', 3, true),
    ('weather', 'मौसम', 'जिलावार मौसम पूर्वानुमान व बारिश का अलर्ट', 4, true),
    ('panchang', 'पंचांग व राशिफल', 'दैनिक राशिफल, शुभ मुहूर्त, चौघड़िया व राहुकाल', 5, true),
    ('govt-schemes', 'सरकारी योजनाएं', 'हरियाणा व केंद्र सरकार की जन कल्याणकारी योजनाएं', 6, true),
    ('govt-jobs', 'सरकारी नौकरी', 'HSSC, हरियाणा पुलिस, रिजल्ट, एडमिट कार्ड व भर्तियां', 7, true),
    ('sports', 'खेल कूद', 'क्रिकेट स्कोर, हरियाणा के खिलाड़ी व खेल समाचार', 8, true),
    ('business', 'बिजनेस व बाजार', 'सोना-चांदी भाव, पेट्रोल-डीजल रेट व शेयर बाजार अपडेट', 9, true),
    ('history', 'आज का इतिहास', 'इतिहास के पन्नों से आज के दिन की प्रमुख घटनाएं', 10, true),
    ('technology', 'टेक व ऑटो', 'रेलवे, रोडवेज, तकनीक व ऑटोमोबाइल से जुड़ी खबरें', 11, true),
    ('top-news', 'टॉप 10', 'दिनभर की 10 बड़ी और जरूरी खबरें', 12, true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index;

INSERT INTO public.slots (slot_key, name, schedule_ist, description, is_active)
VALUES
    ('rashifal', 'दैनिक राशिफल (सभी 12 राशियां)', '05:00', 'सभी 12 राशियों का दैनिक राशिफल व उपाय', true),
    ('panchang_choghadiya', 'आज का पंचांग व चौघड़िया', '05:20', 'तिथि, नक्षत्र, शुभ मुहूर्त, चौघड़िया व राहुकाल', true),
    ('weather_districtwise', 'हरियाणा जिलावार मौसम', '05:40', 'Open-Meteo आधारित हरियाणा के प्रमुख जिलों का मौसम', true),
    ('today_in_history', 'आज का इतिहास', '06:00', 'आज की तारीख में घटी देश-विदेश की ऐतिहासिक घटनाएं', true),
    ('gold_silver', 'सोना चांदी के भाव', '06:20', 'हरियाणा में 22K व 24K सोने और चांदी के ताज़ा दाम', true),
    ('petrol_diesel_lpg', 'पेट्रोल, डीजल व एलपीजी दाम', '06:40', 'हरियाणा के प्रमुख शहरों में ईंधन व गैस सिलेंडर के रेट', true),
    ('share_market', 'शेयर बाजार ओपनिंग संकेत', '07:00', 'सेंसेक्स, निफ्टी व प्रमुख स्टॉक्स के संकेत', true),
    ('govt_schemes', 'सरकारी योजनाएं', '10:00', 'हरियाणा सरकार व केंद्र की नई योजनाएं, आवेदन प्रक्रिया', true),
    ('govt_jobs', 'सरकारी नौकरी व परिणाम', '12:00', 'HSSC, पुलिस भर्ती, एडमिट कार्ड, परीक्षा तारीखें', true),
    ('train_bus_tech', 'रेलवे, रोडवेज व टेक', '15:00', 'ट्रेनों के समय में बदलाव, हरियाणा रोडवेज व टेक अपडेट', true),
    ('mandi_bhav', 'हरियाणा मंडी भाव', '17:00', 'सिरसा, आदमपुर, ऐलनाबाद, नोहर, फतेहाबाद मंडियों के शाम के भाव', true),
    ('cricket_sports', 'क्रिकेट व खेल समाचार', '18:30', 'लाइव मैच स्कोर, आईपीएल/टीम इंडिया व हरियाणा के खिलाड़ी', true),
    ('top10_news', 'आज की 10 बड़ी खबरें', '21:00', 'दिनभर की सबसे महत्वपूर्ण 10 खबरों का संक्षिप्त बुलेटिन', true),
    ('google_trends_india', 'गूगल ट्रेंड्स वायरल न्यूज', 'hourly', 'भारत व हरियाणा में सबसे ज्यादा सर्च किए जाने वाले ट्रेंडिंग विषय', true),
    ('regional_coverage', 'क्षेत्रीय समाचार कवरेज', 'every_2_hours', 'सिरसा, आदमपुर, ऐलनाबाद, नोहर, भादरा, फतेहाबाद, हिसार लोकल कवरेज', true)
ON CONFLICT (slot_key) DO UPDATE
SET name = EXCLUDED.name,
    schedule_ist = EXCLUDED.schedule_ist,
    description = EXCLUDED.description;

INSERT INTO public.manual_data (key, value, updated_at)
VALUES
    ('gold_silver', '{"gold_24k_10g": 89500, "gold_22k_10g": 82050, "silver_1kg": 101000, "unit": "INR", "city": "Hisar/Haryana"}'::JSONB, now()),
    ('fuel_rates', '{"petrol_per_litre": 95.34, "diesel_per_litre": 88.19, "lpg_cylinder_14kg": 803.00, "city": "Sirsa/Haryana"}'::JSONB, now()),
    ('share_market', '{"nifty_50": 24200.50, "sensex": 79800.25, "market_status": "Neutral", "key_indices": "Bank Nifty 51500"}'::JSONB, now()),
    ('mandi_fallback', '{"sirsa": {"narma": 7200, "wheat": 2450, "mustard": 5600, "guar": 5100}, "adampur": {"narma": 7250, "mustard": 5650, "guar": 5120}}'::JSONB, now())
ON CONFLICT (key) DO NOTHING;

-- 6. DEFAULT ADMIN USER ALLOWLIST ENTRY
INSERT INTO public.admins (email, role)
VALUES ('admin@haryananews.online', 'admin')
ON CONFLICT (email) DO NOTHING;
