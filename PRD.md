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

- [ ] **Milestone 1: Project Scaffolding, Environment Config & Database Foundation** *(Current Active Phase)*
- [ ] **Milestone 2: Public Portal, Core Pages, Design System & SEO Engine**
- [ ] **Milestone 3: Auto-Publishing Pipeline, Edge Functions & External API Integrations**
- [ ] **Milestone 4: Secure Admin Panel, MFA, Turnstile & AI Editorial Chat**
- [ ] **Milestone 5: Deployment, Cron Job Configuration, End-to-End Testing & Security Audit**

---

## 3. Milestone 1: Detailed Atomic Tasks

### Phase Objective
Establish a clean Astro SSR repository with Tailwind CSS, Cloudflare Pages adapter, strict environment isolation, complete Supabase schema migrations with Row Level Security (RLS), timetable seeding, and TypeScript database types.

---

### [ ] Task 1.1: Initialize Astro Project with SSR and Cloudflare Adapter
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

### [ ] Task 1.2: Environment Variable Specification & Security Boundaries
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

### [ ] Task 1.3: Supabase Migration — Database Schema Creation
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

### [ ] Task 1.4: Supabase Migration — Row Level Security (RLS) & Policies
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

### [ ] Task 1.5: Supabase Migration — Seed Data (Slots Timetable & Initial Settings)
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

### [ ] Task 1.6: TypeScript Database Types & Supabase Client Layer
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

### [ ] Task 1.7: Design System Foundation & Haryana Theme Setup
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

Before declaring Milestone 1 complete:
1. **Compilation Check:** `npx astro build` produces zero errors.
2. **Type Safety Check:** `npx astro check` passes with zero type errors.
3. **Environment Security Check:** `.env` is uncommitted and completely ignored by git.
4. **SQL Migrations Check:** All migration files exist under `supabase/migrations/` and cover all required tables, constraints, indexes, RLS policies, and seed data.
5. **Git Commit:** Milestone 1 changes committed cleanly with descriptive commit messages following `type(scope): description`.
