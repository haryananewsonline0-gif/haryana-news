# Task List — Haryana News (haryananews.online)

> **Project Goal:** Build a complete, production-ready, high-speed Hindi news portal called **"Haryana News"** (`haryananews.online`) with automated AI-assisted publishing, real-time localized data fetching (mandi bhav, weather, panchang, cricket, fuel/gold), WhatsApp distribution, AdSense-ready SEO, and a strictly secured Admin Panel with MFA and Turnstile.
>
> **Methodology:** GSD (Get Shit Done) & Ralph Loop workflow. Each task is atomic, strictly typed, and verified with empirical proof.

---

## 1. Project Specification & System Architecture

### 1.1 Technology Stack
| Layer | Technology | Key Details |
|---|---|---|
| **Frontend & SSR** | [Astro](https://astro.build) (SSR mode) | Cloudflare Pages adapter (`@astrojs/cloudflare`), SSR/static for SEO |
| **Styling & Design** | Tailwind CSS | Haryana theme: Saffron (`#FF9933`), Deep Green (`#138808`), White, Dark text |
| **Typography** | Noto Sans Devanagari | Display swap, optimized for Devanagari Hindi reading |
| **Database & Auth** | Supabase (PostgreSQL) | Auth + MFA (TOTP), Row Level Security (RLS), supabase-js |
| **Automation** | Supabase Edge Functions | Deno runtime, invoked by external cron (`cron-job.org`) with `CRON_SECRET` header |
| **AI Text Engine** | Google Gemini API | Model via `GEMINI_MODEL` (default: `gemini-2.5-flash` or configurable), structured JSON output |
| **AI Images** | Pollinations.ai + ImageKit | Pollinations (1200x630) -> uploaded to ImageKit `/haryana-news/`; SVG/Canvas fallback card |
| **Distribution** | Green API (WhatsApp) | Broadcasts to WhatsApp Group + admin alerts for flagged drafts |
| **External APIs** | Open-Meteo, data.gov.in, CricAPI | Real data fetched first; AI writes narrative; never hallucinate numbers |

### 1.2 Security & Isolation Principles
- **Zero Secret Leakage:** Never hardcode secrets. Never log secrets. Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code.
- **Client Boundary:** Frontend receives ONLY: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `TURNSTILE_SITE_KEY`.
- **Server/Edge Boundary:** All other keys live exclusively in Supabase Edge Function Secrets and Cloudflare server-side environment.
- **Admin Access:** Supabase Auth + TOTP 2FA + Cloudflare Turnstile + server-side session checks + RLS second layer.

---

## 2. Project Milestones Roadmap

- [x] **Milestone 1: Project Scaffolding, Environment Config & Database Foundation** *(Completed)*
- [x] **Milestone 2: Public Portal, Core Pages, Design System & SEO Engine** *(Completed)*
- [x] **Milestone 3: Auto-Publishing Pipeline, Edge Functions & External API Integrations** *(Completed)*
- [ ] **Milestone 4: Secure Admin Panel, MFA, Turnstile & AI Editorial Chat** *(Next Phase)*
- [ ] **Milestone 5: Deployment, Cron Job Configuration, End-to-End Testing & Security Audit**

---

## 3. Milestone 1: Detailed Atomic Tasks

### Phase Objective
Establish a clean Astro SSR repository with Tailwind CSS, Cloudflare Pages adapter, strict environment isolation, complete Supabase schema migrations with Row Level Security (RLS), timetable seeding, and TypeScript database types.

---

### [x] Task 1.1: Initialize Astro Project with SSR and Cloudflare Adapter
- **Objective:** Scaffold the Astro project inside repository root using SSR mode and `@astrojs/cloudflare`.
- **Target Files:**
  - `package.json`
  - `astro.config.mjs`
  - `tsconfig.json`
- **Actions:**
  1. Initialize `package.json` with required dependencies: `astro`, `@astrojs/cloudflare`, `@astrojs/tailwind`, `tailwindcss`, `@supabase/supabase-js`, `zod`, `clsx`, `tailwind-merge`.
  2. Configure `astro.config.mjs`:
     - `output: 'server'`
     - `adapter: cloudflare({ imageService: 'passthrough' })`
     - Integrate Tailwind.
  3. Configure `tsconfig.json` with strict TypeScript settings and path alias `@/*` -> `./src/*`.
- **Verification:**
  - Run `npm install` and check exit code 0.
  - Run `npx astro --version` to ensure Astro runtime is configured.
- **Success Criteria:**
  - `package.json` contains modern Astro with `@astrojs/cloudflare`.
  - `astro.config.mjs` builds without syntax errors.

---

### [x] Task 1.2: Environment Variable Specification & Security Boundaries
- **Objective:** Create comprehensive `.env.example` and lock down `.gitignore` so secrets are never leaked.
- **Target Files:**
  - `.env.example`
  - `.gitignore`
  - `supabase/secrets.example.sh`
- **Actions:**
  1. Create `.env.example` listing all required variables with empty values:
     - `SUPABASE_URL=`
     - `SUPABASE_ANON_KEY=`
     - `SUPABASE_SERVICE_ROLE_KEY=`
     - `GEMINI_API_KEY=`
     - `GEMINI_MODEL=gemini-2.5-flash`
     - `IMAGEKIT_PUBLIC_KEY=`
     - `IMAGEKIT_PRIVATE_KEY=`
     - `IMAGEKIT_URL_ENDPOINT=`
     - `GREEN_API_INSTANCE_ID=`
     - `GREEN_API_TOKEN=`
     - `GREEN_API_BASE_URL=`
     - `WHATSAPP_GROUP_CHAT_ID=`
     - `OWNER_CHAT_ID=`
     - `CRICAPI_KEY=`
     - `DATA_GOV_API_KEY=`
     - `DATA_GOV_RESOURCE_ID=`
     - `CRON_SECRET=`
     - `ADMIN_EMAIL=`
     - `SITE_URL=https://haryananews.online`
     - `TURNSTILE_SECRET_KEY=`
     - `TURNSTILE_SITE_KEY=`
  2. Update `.gitignore` to ensure `.env`, `.env.local`, `.env.*.local`, `.astro/`, `dist/`, and credentials are never tracked.
  3. Create `supabase/secrets.example.sh` with the exact `supabase secrets set` command format for setting backend secrets in Supabase Edge Functions.
- **Verification:**
  - Run `git status` to verify `.env` is ignored when created.
  - Inspect `.env.example` to confirm no real secrets are present.
- **Success Criteria:**
  - All 21 environment variable keys specified in the prompt are defined in `.env.example`.
  - `.env` files are strictly gitignored.

---

### [x] Task 1.3: Supabase Migration — Database Schema Creation
- **Objective:** Author production-ready PostgreSQL migration containing all tables specified in Section 4 of the prompt.
- **Target Files:**
  - `supabase/migrations/20261021000000_initial_schema.sql`
- **Actions:**
  1. Create `categories` table:
     - `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`
     - `slug text UNIQUE NOT NULL`
     - `name text NOT NULL`
     - `description text`
     - `order_index integer DEFAULT 0`
     - `is_active boolean DEFAULT true`
     - `created_at timestamptz DEFAULT now()`
  2. Create `articles` table:
     - `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`
     - `slug text UNIQUE NOT NULL`
     - `title text NOT NULL`
     - `summary text NOT NULL`
     - `body_html text NOT NULL`
     - `category text NOT NULL REFERENCES categories(slug)`
     - `tags text[] DEFAULT '{}'`
     - `district text`
     - `thumbnail_url text NOT NULL`
     - `image_alt text NOT NULL`
     - `source_name text NOT NULL`
     - `source_url text`
     - `status text NOT NULL CHECK (status IN ('published', 'draft', 'unpublished')) DEFAULT 'draft'`
     - `slot_key text NOT NULL`
     - `published_at timestamptz`
     - `created_at timestamptz DEFAULT now()`
     - `views integer DEFAULT 0`
     - `seo_title text NOT NULL`
     - `seo_description text NOT NULL`
     - `content_hash text NOT NULL`
  3. Create `slots` table:
     - `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`
     - `slot_key text UNIQUE NOT NULL`
     - `name text NOT NULL`
     - `schedule_ist text NOT NULL`
     - `description text`
     - `is_active boolean DEFAULT true`
     - `last_run_at timestamptz`
     - `created_at timestamptz DEFAULT now()`
  4. Create `generation_logs` table:
     - `id uuid DEFAULT gen_random_uuid() PRIMARY KEY`
     - `slot text NOT NULL`
     - `status text NOT NULL CHECK (status IN ('success', 'failure', 'skipped', 'draft_safety'))`
     - `error text`
     - `duration_ms integer`
     - `created_at timestamptz DEFAULT now()`
  5. Create `settings` table:
     - `id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1)`
     - `kill_switch boolean DEFAULT false NOT NULL`
     - `whatsapp_enabled boolean DEFAULT true NOT NULL`
     - `updated_at timestamptz DEFAULT now()`
  6. Create `manual_data` table:
     - `key text PRIMARY KEY`
     - `value jsonb NOT NULL`
     - `updated_at timestamptz DEFAULT now()`
  7. Create `admins` allowlist table:
     - `id uuid PRIMARY KEY DEFAULT gen_random_uuid()`
     - `email text UNIQUE NOT NULL`
     - `role text DEFAULT 'admin' NOT NULL`
     - `created_at timestamptz DEFAULT now()`
  8. Create optimized performance indexes:
     - `CREATE INDEX idx_articles_slug ON articles(slug);`
     - `CREATE INDEX idx_articles_published_at ON articles(published_at DESC) WHERE status = 'published';`
     - `CREATE INDEX idx_articles_category ON articles(category, published_at DESC);`
     - `CREATE INDEX idx_articles_content_hash ON articles(content_hash);`
     - `CREATE INDEX idx_articles_district ON articles(district);`
- **Verification:**
  - SQL syntax validation (no syntax errors, proper foreign keys and constraints).
- **Success Criteria:**
  - All 7 tables created with requested columns, types, defaults, and constraints.
  - Indexes added for `slug`, `published_at`, `category`, and `content_hash`.

---

### [x] Task 1.4: Supabase Migration — Row Level Security (RLS) & Policies
- **Objective:** Implement zero-trust security policies via PostgreSQL Row Level Security (RLS).
- **Target Files:**
  - `supabase/migrations/20261021000001_rls_policies.sql`
- **Actions:**
  1. Enable RLS on every table:
     - `ALTER TABLE articles ENABLE ROW LEVEL SECURITY;`
     - `ALTER TABLE categories ENABLE ROW LEVEL SECURITY;`
     - `ALTER TABLE slots ENABLE ROW LEVEL SECURITY;`
     - `ALTER TABLE generation_logs ENABLE ROW LEVEL SECURITY;`
     - `ALTER TABLE settings ENABLE ROW LEVEL SECURITY;`
     - `ALTER TABLE manual_data ENABLE ROW LEVEL SECURITY;`
     - `ALTER TABLE admins ENABLE ROW LEVEL SECURITY;`
  2. Implement `articles` policies:
     - **Public SELECT:** Only when `status = 'published'` (`auth.role() = 'anon' OR auth.role() = 'authenticated'`).
     - **Admin ALL:** Full CRUD allowed for authenticated users whose email matches an entry in the `admins` table.
     - **Service Role:** Has full bypass access via Edge Functions.
  3. Implement `categories` policies:
     - Public SELECT for active categories. Admin full CRUD.
  4. Implement `slots`, `generation_logs`, `settings`, `manual_data`, `admins` policies:
     - Public SELECT: DENIED completely.
     - Admin access: Only authenticated users whose `auth.jwt() ->> 'email'` is in `admins`.
- **Verification:**
  - Validate SQL syntax and policy definitions against PostgreSQL / Supabase standards.
- **Success Criteria:**
  - Public users cannot read drafts, unpublished articles, logs, settings, or admin allowlists.
  - Public users cannot insert/update/delete any records.
  - Service role and verified admin have required permissions.

---

### [x] Task 1.5: Supabase Migration — Seed Data (Slots Timetable & Initial Settings)
- **Objective:** Seed the 15 IST slots timetable, initial news categories, default settings, and manual fallback rate schemas.
- **Target Files:**
  - `supabase/migrations/20261021000002_seed_data.sql`
- **Actions:**
  1. Seed default `settings`: `(id=1, kill_switch=false, whatsapp_enabled=true)`.
  2. Seed core `categories`:
     - `haryana` (हरियाणा)
     - `mandi-bhav` (मंडी भाव)
     - `weather` (मौसम)
     - `panchang` (पंचांग व राशिफल)
     - `govt-schemes` (सरकारी योजनाएं)
     - `jobs` (सरकारी नौकरियां व रिजल्ट)
     - `sports` (खेल व क्रिकेट)
     - `business` (बिजनेस व शेयर बाजार)
     - `crime` (क्राइम व कानून)
     - `regional` (क्षेत्रीय खबरें)
  3. Seed exact 15 Slots from Timetable specification:
     - `05:00` - `rashifal` (दैनिक राशिफल - सभी 12 राशियां)
     - `05:20` - `panchang_choghadiya` (आज का पंचांग, चौघड़िया व राहुकाल)
     - `05:40` - `weather_districtwise` (हरियाणा जिलावार मौसम - Open-Meteo)
     - `06:00` - `today_in_history` (आज का इतिहास - मुख्य ऐतिहासिक घटनाएं)
     - `06:20` - `gold_silver` (सोना-चांदी के ताजा भाव)
     - `06:40` - `petrol_diesel_lpg` (पेट्रोल, डीजल व एलपीजी सिलेंडर के दाम)
     - `07:00` - `share_market` (शेयर बाजार ओपनिंग व मुख्य संकेत)
     - `10:00` - `govt_schemes` (हरियाणा व केंद्र की नई सरकारी योजनाएं)
     - `12:00` - `govt_jobs` (HSSC, पुलिस भर्ती, एडमिट कार्ड व परीक्षा परिणाम)
     - `15:00` - `train_bus_tech` (रेलवे/रोडवेज अपडेट व टेक न्यूज)
     - `17:00` - `mandi_bhav` (सिरसा, आदमपुर, ऐलनाबाद, नोहर, फतेहाबाद मंडी भाव)
     - `18:30` - `cricket_sports` (क्रिकेट व अन्य खेल अपडेट)
     - `21:00` - `top10_news` (आज की 10 बड़ी खबरें)
     - `hourly` - `google_trends_india` (ट्रेंडिंग टॉपिक्स व वायरल न्यूज)
     - `every_2_hours` - `regional_coverage` (सिरसा, आदमपुर, ऐलनाबाद, नोहर, भादरा, फतेहाबाद, हिसार)
  4. Seed placeholder entries in `manual_data` for `gold_silver`, `fuel_rates`, `share_market`, and `mandi_fallback`.
- **Verification:**
  - Verify all 15 slots match prompt requirements with exact slot keys.
- **Success Criteria:**
  - Complete timetable configured in `slots` table.
  - Default categories and fallback schema populated.

---

### [x] Task 1.6: TypeScript Database Types & Supabase Client Layer
- **Objective:** Generate strict TypeScript definitions for database models and create isomorphic Supabase client helpers.
- **Target Files:**
  - `src/types/database.ts`
  - `src/lib/supabase/client.ts`
  - `src/lib/supabase/server.ts`
- **Actions:**
  1. Author `src/types/database.ts` mapping all tables: `Article`, `Category`, `Slot`, `GenerationLog`, `Settings`, `ManualData`, `AdminUser`.
  2. Define literal types: `ArticleStatus = 'published' | 'draft' | 'unpublished'`, `SlotKey`, `DistrictKey`.
  3. Create `src/lib/supabase/client.ts` for browser-safe operations (using `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_ANON_KEY`).
  4. Create `src/lib/supabase/server.ts` for server-side SSR operations, admin verification, and safe query helpers.
- **Verification:**
  - Run TypeScript compiler check `npx astro check` or `npx tsc --noEmit`.
- **Success Criteria:**
  - 100% type coverage for Supabase queries with no `any` leaks.
  - Safe boundary between client-safe anon client and server-side utilities.

---

### [x] Task 1.7: Design System Foundation & Haryana Theme Setup
- **Objective:** Set up Tailwind design tokens, Noto Sans Devanagari typography, and foundational layout shell.
- **Target Files:**
  - `tailwind.config.mjs`
  - `src/styles/global.css`
  - `src/constants/districts.ts`
  - `src/layouts/BaseLayout.astro`
- **Actions:**
  1. Configure `tailwind.config.mjs` theme colors:
     - `saffron`: `#FF9933` (primary brand color)
     - `deepgreen`: `#138808` (secondary brand color)
     - `ashoka`: `#000080` (accent navy)
     - Font family: `hindi: ['Noto Sans Devanagari', 'sans-serif']`.
  2. In `src/styles/global.css`, include Google Font import or local `@font-face` for `Noto Sans Devanagari` with `font-display: swap`.
  3. Create `src/constants/districts.ts` defining Haryana districts and target regions:
     - `Sirsa`, `Fatehabad`, `Hisar`, `Adampur`, `Ellenabad`, `Nohar`, `Bhadra`, `Jind`, `Rohtak`, `Bhiwani`, `Ambala`, `Karnal`, `Panipat`, `Sonipat`, `Gurugram`, `Faridabad`, etc.
  4. Create `src/layouts/BaseLayout.astro` featuring:
     - HTML `lang="hi"` and `dir="ltr"`
     - Mobile-first responsive viewport meta tags
     - Favicon and manifest placeholders
     - OpenGraph / Twitter Cards meta skeleton
     - Saffron / green top decorative accent bar
- **Verification:**
  - Create minimal `src/pages/index.astro` importing `BaseLayout.astro`.
  - Run `npx astro build` to confirm build succeeds without errors.
- **Success Criteria:**
  - Hindi font loads with swap display.
  - Saffron `#FF9933` and Deep Green `#138808` theme tokens are available.
  - District constants and BaseLayout ready for Milestone 2.

---

## 4. Phase 1 Verification & Exit Criteria

Milestone 1 completed and verified:
1. Compilation Check: `npx astro build` completed in 2.50s (0 errors).
2. Type Safety Check: `npx astro check` passed with 0 errors, 0 warnings.
3. Environment Security Check: `.env` is uncommitted and completely ignored by git.
4. SQL Migrations Check: 3 SQL migration files in `supabase/migrations/` covering 7 tables, RLS policies, indexes, and seed data.
5. Git Commit: `cc65514` and `59d361a`.

---

## 5. Milestone 2: Detailed Atomic Tasks (Public Portal, Core Pages & SEO Engine)

### Phase Objective
Deliver a production-ready, ultra-fast Hindi news portal frontend with mobile-first responsive layout, Breaking News ticker, Homepage sections, Article detail pages with social sharing & AI image disclaimers, Category & District routing, AdSense-ready policy pages, NewsArticle JSON-LD, and dynamic XML/Google News sitemaps.

---

### [x] Task 2.1: Homepage Layout, Breaking News & Section Grids
- **Objective:** Build a rich, vibrant homepage with Breaking News ticker, Hero featured article, Latest grid, and Category showcases with ImageKit URL transformations.
- **Target Files:**
  - `src/pages/index.astro`
  - `src/components/BreakingTicker.astro`
  - `src/components/ArticleCard.astro`
  - `src/utils/imagekit.ts`
- **Actions:**
  1. Create ImageKit helper (`src/utils/imagekit.ts`) to apply transformations: `tr=w-800,f-webp,q-85` for desktop and `tr=w-400,f-webp,q-80` for cards.
  2. Create `src/components/ArticleCard.astro` supporting compact, horizontal, and featured grid variants with category tag, IST date, and hover animation.
  3. Create `src/components/BreakingTicker.astro` displaying latest breaking headlines with pulse indicator.
  4. Build `src/pages/index.astro` sections: Hero Top Story, Trending Row, Mandi/Weather quick widget, and Category grids (Haryana, Regional, Jobs, Sports).
- **Verification:** Run `npx astro check` and verify component rendering.
- **Success Criteria:** Home page renders full structured layout, breaking ticker, and handles empty state gracefully.

---

### [x] Task 2.2: Article Detail Page with Social Share, Breadcrumbs & AI Badge
- **Objective:** Create `/news/[slug]` dynamic SSR page featuring complete article layout, social sharing buttons, and Google News compliant metadata.
- **Target Files:**
  - `src/pages/news/[slug].astro`
  - `src/components/ShareButtons.astro`
  - `src/components/Breadcrumbs.astro`
- **Actions:**
  1. Author `src/pages/news/[slug].astro`:
     - Fetch published article by slug. Return 404 if not found.
     - Headline (H1), summary lead, byline ("हरियाणा न्यूज़ ब्यूरो"), date in IST Hindi formatting.
     - Main thumbnail with caption `"प्रतीकात्मक तस्वीर (AI)"` as specified in prompt.
     - Body HTML rendering with sanitized markup.
     - Source attribution badge with external link if present.
     - Related articles section (matching category or district).
  2. Create `src/components/Breadcrumbs.astro` (`होम > [कैटेगरी] > [शीर्षक]`).
  3. Create `src/components/ShareButtons.astro` with WhatsApp (`api.whatsapp.com/send`), Telegram, Facebook, X (Twitter), and Copy Link with copy feedback toast.
  4. Include complete `NewsArticle` JSON-LD schema (headline, image, datePublished, author, publisher).
- **Verification:** Run `npx astro check` and verify type safety.
- **Success Criteria:** Article detail page loads, renders meta tags for WhatsApp previews, and formats IST dates in Hindi.

---

### [x] Task 2.3: Category & District Routing
- **Objective:** Implement dynamic category and district listing pages.
- **Target Files:**
  - `src/pages/category/[category].astro`
  - `src/pages/district/[district].astro`
- **Actions:**
  1. Create `src/pages/category/[category].astro`:
     - Load category details and articles filtered by `category = slug`.
     - Display category title, description, article count, and responsive article grid.
  2. Create `src/pages/district/[district].astro`:
     - Load district info from `HARYANA_DISTRICTS` constant.
     - Filter articles by `district = district_slug`.
     - Highlight regional news for Sirsa, Fatehabad, Hisar, Adampur, Ellenabad, Nohar, Bhadra.
- **Verification:** Run `npx astro check` to verify route typing.
- **Success Criteria:** Both dynamic routes handle valid and invalid slugs gracefully.

---

### [x] Task 2.4: Search Engine & News Archive
- **Objective:** Create search page `/search` allowing readers to search news by keywords and tags.
- **Target Files:**
  - `src/pages/search.astro`
- **Actions:**
  1. Create SSR search page reading query param `?q=...`.
  2. Query published articles via Supabase with `ilike` filter on title, summary, and tags.
  3. Render search input, active query pills, and results grid.
- **Verification:** Run `npx astro check`.
- **Success Criteria:** Search page accepts URL queries and renders matching articles.

---

### [x] Task 2.5: AdSense-Ready Hindi Legal & Information Pages
- **Objective:** Build required static legal/informational pages in clean Hindi for Google AdSense compliance.
- **Target Files:**
  - `src/pages/about.astro`
  - `src/pages/contact.astro`
  - `src/pages/privacy-policy.astro`
  - `src/pages/disclaimer.astro`
  - `src/pages/terms.astro`
- **Actions:**
  1. Author `about.astro`: Mission, editorial principles, Haryana focus, editorial desk.
  2. Author `contact.astro`: Contact email, address (Sirsa/Haryana), editorial feedback, grievance officer.
  3. Author `privacy-policy.astro`: Cookies, GDPR/DPDP Act, analytics, third-party advertising compliance.
  4. Author `disclaimer.astro`: AI image transparency ("प्रतीकात्मक तस्वीर (AI)"), news source credits, copyright fair use.
  5. Author `terms.astro`: Website terms, content usage, user guidelines.
- **Verification:** Run `npx astro check` and check all 5 pages render with BaseLayout.
- **Success Criteria:** All 5 legal pages published in Hindi and AdSense-ready.

---

### [x] Task 2.6: SEO Engine — Dynamic Sitemaps, RSS & Robots.txt
- **Objective:** Implement search engine crawlers and syndication endpoints for Google Search and Google News.
- **Target Files:**
  - `src/pages/robots.txt.ts`
  - `src/pages/sitemap.xml.ts`
  - `src/pages/google-news-sitemap.xml.ts`
  - `src/pages/rss.xml.ts`
- **Actions:**
  1. `robots.txt.ts`: Disallow `/admin` and `/api/`, Allow `/`, specify sitemap URLs.
  2. `sitemap.xml.ts`: Standard XML sitemap containing all published articles, active categories, districts, and legal pages with `<lastmod>`.
  3. `google-news-sitemap.xml.ts`: Google News sitemap containing articles published in the last 48 hours with `<news:news>` namespace tags (`<news:publication>`, `<news:publication_date>`, `<news:title>`).
  4. `rss.xml.ts`: RSS 2.0 feed with Hindi content channel, items with permalinks, `<pubDate>`, and enclosures.
- **Verification:** Run `npx astro check` and `npx astro build`.
- **Success Criteria:** Valid XML responses generated with correct Content-Type `application/xml` or `text/xml`.

---

## 6. Phase 2 Verification & Exit Criteria
1. `npx astro check` passes with 0 errors.
2. `npx astro build` completes successfully in 5.22s.
3. All routes accessible: `/`, `/news/[slug]`, `/category/[category]`, `/district/[district]`, `/search`, `/about`, `/contact`, `/privacy-policy`, `/disclaimer`, `/terms`, `/sitemap.xml`, `/google-news-sitemap.xml`, `/rss.xml`, `/robots.txt`.
4. Git commit: `3c9e986`.

---

## 7. Milestone 3: Detailed Atomic Tasks (Auto-Publishing Pipeline & Edge Functions)

### Phase Objective
Build the Supabase Edge Function `generate-article` (Deno runtime) triggered by cron-job.org with `x-cron-secret` authentication. Deliver real-data collectors (Weather, Mandi, Cricket, Fuel/Gold, Panchang, News RSS), Google Gemini API JSON narrative generation, 48h duplicate hash detection, editorial safety filters, Pollinations.ai + ImageKit upload with branded gradient card fallback, Green API WhatsApp broadcasts, and generation logging.

---

### [x] Task 3.1: External Data Fetchers (Real Numbers First — Zero Hallucination)
- **Objective:** Implement modular data collectors in `supabase/functions/generate-article/data-fetchers/` ensuring numbers are never hallucinated.
- **Target Files:**
  - `supabase/functions/generate-article/data-fetchers/weather.ts`
  - `supabase/functions/generate-article/data-fetchers/mandi.ts`
  - `supabase/functions/generate-article/data-fetchers/cricket.ts`
  - `supabase/functions/generate-article/data-fetchers/rates.ts`
  - `supabase/functions/generate-article/data-fetchers/panchang.ts`
  - `supabase/functions/generate-article/data-fetchers/rss.ts`
- **Actions:**
  1. `weather.ts`: Fetch Open-Meteo per district (Sirsa, Fatehabad, Hisar, Adampur, Ellenabad, Bhadra, Nohar).
  2. `mandi.ts`: Query data.gov.in API with `DATA_GOV_API_KEY` for Haryana markets (Narma, Wheat, Mustard, Guar); fall back to `manual_data` if unreachable.
  3. `cricket.ts`: Fetch CricAPI `currentMatches` with `CRICAPI_KEY`.
  4. `rates.ts`: Fetch live fuel & gold rates with `manual_data` fallback.
  5. `panchang.ts`: Compute Tithi, Nakshatra, Rahukaal, and Choghadiya in IST for Sirsa coordinates (29.53°N, 75.03°E).
  6. `rss.ts`: Fetch public Hindi RSS feeds for government schemes, HSSC jobs, train/tech, and regional news.
- **Verification:** Unit test data fetchers returning structured real payload.
- **Success Criteria:** All fetchers return structured data or graceful fallback; never return fabricated numbers.

---

### [x] Task 3.2: Google Gemini AI Narrative Generation Engine
- **Objective:** Interface with Google Gemini API using `GEMINI_MODEL` (default: `gemini-2.5-flash`), enforcing structured JSON output.
- **Target Files:**
  - `supabase/functions/generate-article/gemini.ts`
- **Actions:**
  1. Author Gemini client sending fetched REAL data + journalistic instructions.
  2. Require structured JSON output: `{ title, summary, body_html, tags, seo_title, seo_description, image_prompt }`.
  3. Enforce Hindi Devanagari, neutral journalistic tone, original wording, and source citations.
  4. Validate model name; if invalid or fails, fail with clear error message.
- **Verification:** Test Gemini JSON prompt format and validation.
- **Success Criteria:** Gemini outputs valid parsed JSON adhering to the required schema.

---

### [x] Task 3.3: Content Hashing, Duplicate Detection & Sensitive Safety Filter
- **Objective:** Prevent duplicate articles within 48h and hold sensitive topics in draft status.
- **Target Files:**
  - `supabase/functions/generate-article/duplicate.ts`
  - `supabase/functions/generate-article/safety.ts`
- **Actions:**
  1. Compute SHA-256 `content_hash` of the generated article.
  2. Query articles in last 48h; if duplicate hash or high title similarity, skip and log.
  3. Safety filter: If topic touches crime naming individuals, religion/caste conflict, deaths, or political accusations, flag `status = 'draft'` and send alert to `OWNER_CHAT_ID` on WhatsApp. All other safe news set `status = 'published'`.
- **Verification:** Test duplicate hash detection and regex/keyword safety rules.
- **Success Criteria:** Duplicates skipped; sensitive drafts held and flagged.

---

### [x] Task 3.4: Thumbnail Engine (Pollinations.ai -> ImageKit & Branded Saffron/Green Card Fallback)
- **Objective:** Fetch realistic 1200x630 thumbnail from Pollinations.ai, upload to ImageKit `/haryana-news/`, and fall back to branded SVG/card if needed.
- **Target Files:**
  - `supabase/functions/generate-article/image.ts`
- **Actions:**
  1. Build realistic generic prompt from article headline (scene only, no real persons, no fake events, no logos).
  2. Fetch 1200x630 image from Pollinations.ai with 10s timeout.
  3. Upload binary buffer to ImageKit API in folder `/haryana-news/` and obtain permanent ImageKit URL.
  4. Fallback: If Pollinations fails or times out, generate branded template card (SVG/Canvas with headline text on saffron/green gradient) and upload that to ImageKit.
- **Verification:** Test ImageKit upload and branded card fallback generator.
- **Success Criteria:** DB receives only ImageKit URL; branded card fallback reliably generated on failure.

---

### [x] Task 3.5: Green API WhatsApp Broadcasting & Owner Alerting
- **Objective:** Broadcast published articles to WhatsApp Group and alert owner on draft flags.
- **Target Files:**
  - `supabase/functions/generate-article/whatsapp.ts`
- **Actions:**
  1. Implement `sendWhatsAppMessage` using Green API `sendMessage` endpoint.
  2. After article is published, broadcast to `WHATSAPP_GROUP_CHAT_ID`: `Title\n\nSummary\n\nRead more: URL`.
  3. Add random delay between 3 and 8 seconds. Enforce max 1 message per article.
  4. If article is held as draft by safety filter, notify `OWNER_CHAT_ID`.
  5. Never fail the article if WhatsApp API fails; log failure in `generation_logs`.
- **Verification:** Test Green API payload format and non-blocking error handling.
- **Success Criteria:** WhatsApp messages sent with random delay; failures non-blocking.

---

### [x] Task 3.6: Main Edge Function Orchestrator (`generate-article/index.ts`)
- **Objective:** Implement the complete Deno Edge Function entry point with `CRON_SECRET` timing-safe check and slot pipeline.
- **Target Files:**
  - `supabase/functions/generate-article/index.ts`
  - `supabase/functions/generate-article/types.ts`
- **Actions:**
  1. Inspect `x-cron-secret` header and compare using timing-safe comparison (`crypto.subtle.timingSafeEqual`). Return 401 if unauthorized.
  2. Read query param `?slot=<slot_key>`.
  3. Check `settings.kill_switch`; if true, exit immediately and log `skipped`.
  4. Execute pipeline: Fetch Data -> Gemini -> Duplicate Check -> Safety Check -> Thumbnail/ImageKit -> Insert Article -> WhatsApp -> Log in `generation_logs`.
  5. Return JSON response `{ success: true, slot, article_id, status }`.
- **Verification:** Test Edge Function syntax and pipeline orchestration.
- **Success Criteria:** Edge function handles all 15 slots, secures via CRON_SECRET, and logs execution duration.

---

## 8. Phase 3 Verification & Exit Criteria
1. Edge function files in `supabase/functions/generate-article/` compile cleanly with Deno/TypeScript.
2. All 15 slot types supported with real data fetching or fallback.
3. Git commit with `feat(milestone-3): ...`.


