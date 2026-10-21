---
phase: 3
plan: "Auto-Publishing Pipeline, Edge Functions & External API Integrations"
wave: 3
gap_closure: false
---

# Plan 3: Auto-Publishing Pipeline & Edge Functions

## Objective
Build the Supabase Edge Function `generate-article` (Deno runtime) triggered by cron-job.org with `x-cron-secret` timing-safe check. Ensure real data fetching first (Open-Meteo, data.gov.in, CricAPI, rates, panchang, Hindi RSS) with zero number hallucinations, Google Gemini API structured JSON generation, 48h duplicate hash check, sensitive safety filters, Pollinations.ai -> ImageKit thumbnail upload with branded saffron/green gradient fallback, Green API WhatsApp broadcasts with 3-8s random delay, and execution logging.

## Context
- `PRD.md` — Section 7 (Milestone 3 Tasks)
- `.gsd/SPEC.md` — Core specifications (Sections 6 & 7)
- `supabase/migrations/20261021000000_initial_schema.sql` — DB Schema
- `supabase/migrations/20261021000002_seed_data.sql` — 15 Slots seed

---

## Tasks

<task type="auto">
  <name>Task 3.1: External Data Fetchers (Real Numbers First)</name>
  <files>
    supabase/functions/generate-article/types.ts
    supabase/functions/generate-article/data-fetchers/weather.ts
    supabase/functions/generate-article/data-fetchers/mandi.ts
    supabase/functions/generate-article/data-fetchers/cricket.ts
    supabase/functions/generate-article/data-fetchers/rates.ts
    supabase/functions/generate-article/data-fetchers/panchang.ts
    supabase/functions/generate-article/data-fetchers/rss.ts
  </files>
  <action>
    1. Define SlotPayload and data types in types.ts.
    2. Build weather.ts fetching Open-Meteo for Sirsa, Fatehabad, Hisar, Adampur, Ellenabad, Bhadra, Nohar.
    3. Build mandi.ts querying data.gov.in API with fallback to manual_data.
    4. Build cricket.ts querying CricAPI currentMatches.
    5. Build rates.ts for Gold 24K/22K, Silver, Petrol, Diesel, LPG with manual_data fallback.
    6. Build panchang.ts computing Tithi, Nakshatra, Rahukaal, Choghadiya for Haryana coordinates.
    7. Build rss.ts fetching public Hindi RSS news feeds for Govt schemes, Jobs, Tech, Regional news.
  </action>
  <verify>Syntax and type check</verify>
  <done>All data fetchers return real numbers or structured fallback</done>
</task>

<task type="auto">
  <name>Task 3.2: Google Gemini AI Narrative Generation Engine</name>
  <files>
    supabase/functions/generate-article/gemini.ts
  </files>
  <action>
    1. Implement callGeminiGenerateArticle sending real fetched data to Gemini API.
    2. Read model from GEMINI_MODEL (default: gemini-2.5-flash). Fail with explicit error if model invalid.
    3. Enforce response_format JSON schema: { title, summary, body_html, tags, seo_title, seo_description, image_prompt }.
    4. Enforce Hindi Devanagari, neutral journalistic style, and source attribution.
  </action>
  <verify>Validate Gemini API schema generation</verify>
  <done>Gemini client generates validated structured JSON</done>
</task>

<task type="auto">
  <name>Task 3.3: Content Hashing, Duplicate Detection & Sensitive Safety Filter</name>
  <files>
    supabase/functions/generate-article/duplicate.ts
    supabase/functions/generate-article/safety.ts
  </files>
  <action>
    1. Implement SHA-256 content hashing in duplicate.ts and 48h similarity check against Supabase articles table.
    2. Implement safety filter in safety.ts checking for individual crime accusations, religion/caste conflict, deaths, political scandals.
    3. If sensitive, flag status = 'draft' and notify owner; otherwise status = 'published'.
  </action>
  <verify>Test hashing and safety filters</verify>
  <done>Duplicates skipped; sensitive articles marked draft</done>
</task>

<task type="auto">
  <name>Task 3.4: Thumbnail Engine (Pollinations.ai -> ImageKit & Branded Card Fallback)</name>
  <files>
    supabase/functions/generate-article/image.ts
  </files>
  <action>
    1. Generate safe realistic scene prompt from headline (no real persons, no fake events, no logos).
    2. Fetch 1200x630 image from Pollinations.ai with 10s timeout.
    3. Upload binary buffer to ImageKit API in folder /haryana-news/ using ImageKit authentication keys.
    4. If Pollinations fails/times out, generate branded SVG/PNG card (headline on saffron/green gradient with logo) and upload to ImageKit.
    5. Return ImageKit URL.
  </action>
  <verify>Validate ImageKit upload logic and card generation</verify>
  <done>ImageKit URL stored in DB; reliable gradient card fallback on failure</done>
</task>

<task type="auto">
  <name>Task 3.5: Green API WhatsApp Broadcasting & Owner Alerting</name>
  <files>
    supabase/functions/generate-article/whatsapp.ts
  </files>
  <action>
    1. Implement sendWhatsAppMessage using Green API sendMessage.
    2. Broadcast published article to WHATSAPP_GROUP_CHAT_ID with random 3-8s delay.
    3. If draft flagged by safety filter, send alert message to OWNER_CHAT_ID.
    4. Non-blocking error handling: never fail article if WhatsApp fails.
  </action>
  <verify>Validate Green API payload and delay handling</verify>
  <done>WhatsApp broadcast sends with random delay; failures logged non-blockingly</done>
</task>

<task type="auto">
  <name>Task 3.6: Main Edge Function Orchestrator</name>
  <files>
    supabase/functions/generate-article/index.ts
  </files>
  <action>
    1. Handle POST/GET ?slot=<slot_key>.
    2. Timing-safe comparison of x-cron-secret header with CRON_SECRET. Return 401 if unauthorized.
    3. Check settings.kill_switch.
    4. Route slot to data fetcher -> Gemini narrative -> Duplicate check -> Safety filter -> Thumbnail/ImageKit -> Insert article -> WhatsApp -> Generation log.
    5. Return JSON execution result.
  </action>
  <verify>Test complete Edge Function execution flow</verify>
  <done>Edge function orchestrates complete pipeline for all 15 slots</done>
</task>
