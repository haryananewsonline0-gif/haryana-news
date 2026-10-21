---
phase: 1
plan: "Foundation, Database Architecture & Scaffolding"
wave: 1
gap_closure: false
---

# Plan 1: Foundation, Database Architecture & Scaffolding

## Objective
Establish a clean Astro SSR repository with `@astrojs/cloudflare` adapter, Tailwind CSS with Haryana theme tokens, zero-leakage environment configuration, comprehensive Supabase database migrations (schema, RLS policies, seeds for 15 IST slots and categories), strict TypeScript database types, and browser/server Supabase clients.

## Context
- `PRD.md` — Task List and acceptance criteria
- `.gsd/SPEC.md` — Finalized architectural spec
- `.gsd/ROADMAP.md` — Phase progression

---

## Tasks

<task type="auto">
  <name>Task 1.1: Initialize Astro Project with SSR and Cloudflare Adapter</name>
  <files>
    package.json
    astro.config.mjs
    tsconfig.json
  </files>
  <action>
    1. Initialize package.json with dependencies: astro, @astrojs/cloudflare, @astrojs/tailwind, tailwindcss, @supabase/supabase-js, zod, clsx, tailwind-merge.
    2. Configure astro.config.mjs with output: 'server', adapter: cloudflare({ imageService: 'passthrough' }), and tailwind integration.
    3. Configure tsconfig.json with strict type checks and path alias @/* -> ./src/*.
    4. Run npm install.
    AVOID: client-only Astro or static output because public dynamic pages and admin require SSR and Cloudflare Pages runtime.
    USE: output: 'server' with @astrojs/cloudflare adapter.
  </action>
  <verify>npx astro --version</verify>
  <done>package.json and astro.config.mjs installed and valid Astro CLI responds</done>
</task>

<task type="auto">
  <name>Task 1.2: Environment Variable Specification & Security Boundaries</name>
  <files>
    .env.example
    .gitignore
    supabase/secrets.example.sh
  </files>
  <action>
    1. Create .env.example with all 21 prompt variables (empty values).
    2. Update .gitignore to enforce .env, .env.local, dist/, .astro/ exclusion.
    3. Create supabase/secrets.example.sh with exact supabase secrets set commands for Edge Functions.
    AVOID: including actual secret values in .env.example or repository files.
    USE: empty placeholders and clear documentation of client vs server variables.
  </action>
  <verify>git status --ignored</verify>
  <done>.env.example has 21 variable keys; .env is gitignored</done>
</task>

<task type="auto">
  <name>Task 1.3: Supabase Migration — Database Schema Creation</name>
  <files>
    supabase/migrations/20261021000000_initial_schema.sql
  </files>
  <action>
    1. Create 7 tables: categories, articles, slots, generation_logs, settings, manual_data, admins.
    2. Configure primary keys, foreign keys, constraints, and check constraints (e.g. status in ('published', 'draft', 'unpublished')).
    3. Add performance indexes for slug, published_at, category, district, and content_hash.
    AVOID: missing indexes on high-frequency query columns.
    USE: PostgreSQL 15+ native uuid functions and timestamptz.
  </action>
  <verify>Test SQL file syntax</verify>
  <done>Clean SQL migration file created with all 7 tables and indexes</done>
</task>

<task type="auto">
  <name>Task 1.4: Supabase Migration — Row Level Security (RLS) & Policies</name>
  <files>
    supabase/migrations/20261021000001_rls_policies.sql
  </files>
  <action>
    1. Enable RLS on all 7 tables.
    2. Write public SELECT policy for articles where status = 'published'.
    3. Write admin write policy checking auth.jwt() ->> 'email' IN (SELECT email FROM admins).
    4. Write strict deny/admin-only policies for slots, settings, logs, and manual_data.
    AVOID: open write access or public exposure of drafts and logs.
    USE: PostgreSQL auth.jwt() and service_role bypass.
  </action>
  <verify>Validate RLS policy syntax</verify>
  <done>RLS policies enforce zero-trust security on all tables</done>
</task>

<task type="auto">
  <name>Task 1.5: Supabase Migration — Seed Data (Slots Timetable & Initial Settings)</name>
  <files>
    supabase/migrations/20261021000002_seed_data.sql
  </files>
  <action>
    1. Seed 10 initial Hindi news categories.
    2. Seed all 15 IST slots from prompt timetable (05:00 to 21:00, hourly, every 2h).
    3. Seed default settings row (kill_switch = false, whatsapp_enabled = true).
    4. Seed manual_data fallback records for rates and mandi.
    AVOID: missing slot keys that Edge Functions rely on.
    USE: exact slot keys matching prompt specification.
  </action>
  <verify>Count seeded slots in SQL file</verify>
  <done>All 15 slots and base categories seeded</done>
</task>

<task type="auto">
  <name>Task 1.6: TypeScript Database Types & Supabase Client Layer</name>
  <files>
    src/types/database.ts
    src/lib/supabase/client.ts
    src/lib/supabase/server.ts
  </files>
  <action>
    1. Create src/types/database.ts defining full TypeScript interfaces for all tables and Enums.
    2. Create src/lib/supabase/client.ts for safe browser anon client.
    3. Create src/lib/supabase/server.ts for server-side queries and admin session validation.
    AVOID: importing service role key into client.ts.
    USE: strict type safety and separated client/server modules.
  </action>
  <verify>npx astro check or tsc check</verify>
  <done>TypeScript types compile with zero type errors</done>
</task>

<task type="auto">
  <name>Task 1.7: Design System Foundation & Haryana Theme Setup</name>
  <files>
    tailwind.config.mjs
    src/styles/global.css
    src/constants/districts.ts
    src/layouts/BaseLayout.astro
    src/pages/index.astro
  </files>
  <action>
    1. Configure Tailwind with saffron (#FF9933), deep green (#138808), Noto Sans Devanagari font.
    2. Set up global CSS with font imports and utility classes.
    3. Create Haryana districts constant.
    4. Create BaseLayout.astro with Hindi HTML lang="hi", SEO meta tags, and header accent bar.
    5. Create minimal index.astro and verify astro build works.
    AVOID: browser default fonts for Hindi.
    USE: Noto Sans Devanagari with font-display: swap.
  </action>
  <verify>npx astro build</verify>
  <done>Astro SSR build completes cleanly with zero errors</done>
</task>

---

## Must-Haves
- [ ] Astro SSR compiling with Cloudflare Pages adapter
- [ ] Complete Supabase migrations (schema, RLS, seeds)
- [ ] TypeScript types covering all tables
- [ ] Zero secrets in repo & clean .env.example
