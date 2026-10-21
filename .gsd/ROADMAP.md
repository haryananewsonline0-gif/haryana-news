---
milestone: "Haryana News Platform V1"
version: "1.0.0"
updated: "2026-10-21T13:43:00+05:30"
---

# Roadmap — Haryana News (haryananews.online)

> **Current Phase:** Phase 5 - Deployment, Cron Configuration & Launch
> **Status:** ✅ Complete — All Milestones Accomplished

---

## Must-Haves (from SPEC)
- [x] Astro SSR on Cloudflare Pages with Tailwind & Noto Sans Devanagari
- [x] Supabase Database Schema with 7 tables, strict RLS & performance indexes
- [x] Seed data for 15 IST publishing slots, news categories & fallback schema
- [x] Public News Portal (Home, Article Page, Categories, Districts, AdSense-ready pages)
- [x] Auto-Publishing Edge Function with Gemini AI, Pollinations/ImageKit & Green API WhatsApp
- [x] Secure Admin Panel (/admin) with Supabase Auth, TOTP MFA & Turnstile rate limiting
- [x] External cron-job.org timetable configuration and production deployment guides

---

## Phases

### Phase 1: Foundation, Database Architecture & Scaffolding
**Status:** ✅ Complete
**Objective:** Deliver working Astro SSR base with Cloudflare adapter, Tailwind design system, isolated environment setup, Supabase SQL migrations (schema, RLS, seeds), and TypeScript database client.
**Requirements:** SPEC Section 1, 2, 4
**Tasks:**
- [x] Task 1.1: Initialize Astro Project with SSR and Cloudflare Adapter
- [x] Task 1.2: Environment Variable Specification & Security Boundaries
- [x] Task 1.3: Supabase Migration — Database Schema Creation
- [x] Task 1.4: Supabase Migration — Row Level Security (RLS) & Policies
- [x] Task 1.5: Supabase Migration — Seed Data (Slots Timetable & Initial Settings)
- [x] Task 1.6: TypeScript Database Types & Supabase Client Layer
- [x] Task 1.7: Design System Foundation & Haryana Theme Setup

---

### Phase 2: Public Portal, Core Pages & SEO Engine
**Status:** ✅ Complete
**Objective:** Build high-speed public news portal with mobile-first Haryana layout, Breaking News ticker, Grid sections, District filters, Article page with social share & AI image badge, AdSense legal pages, and NewsArticle JSON-LD / Sitemaps.
**Depends on:** Phase 1
**Tasks:**
- [x] Task 2.1: Homepage Layout, Breaking News & Section Grids
- [x] Task 2.2: Article Detail Page with Social Share, Breadcrumbs & AI Badge
- [x] Task 2.3: Category & District Routing
- [x] Task 2.4: Search Engine & News Archive
- [x] Task 2.5: AdSense-Ready Hindi Legal & Information Pages
- [x] Task 2.6: SEO Engine — Dynamic Sitemaps, RSS & Robots.txt

---

### Phase 3: Auto-Publishing Pipeline & Edge Functions
**Status:** ✅ Complete
**Objective:** Build `generate-article` Supabase Edge Function with CRON_SECRET authentication, real-data collectors (Weather, Mandi, Cricket, Fuel, Panchang, News RSS), Gemini generation, Pollinations + ImageKit upload with branded card fallback, duplicate hash check, safety filters, and Green API WhatsApp group broadcasting.
**Depends on:** Phase 1
**Tasks:**
- [x] Task 3.1: External Data Fetchers (Real Numbers First)
- [x] Task 3.2: Google Gemini AI Narrative Generation Engine
- [x] Task 3.3: Content Hashing, Duplicate Detection & Sensitive Safety Filter
- [x] Task 3.4: Thumbnail Engine (Pollinations.ai -> ImageKit & Branded Card Fallback)
- [x] Task 3.5: Green API WhatsApp Broadcasting & Owner Alerting
- [x] Task 3.6: Main Edge Function Orchestrator (`generate-article/index.ts`)

---

### Phase 4: Secure Admin Panel & Editorial Dashboard
**Status:** ✅ Complete
**Objective:** Build `/admin` panel with email allowlist, Supabase Auth + TOTP 2FA, Cloudflare Turnstile, Article management (publish/unpublish/edit), manual rates entry, slot trigger buttons, kill switch, logs viewer, and Hinglish AI editorial assistant.
**Depends on:** Phase 1, Phase 2, Phase 3
**Tasks:**
- [x] Task 4.1: Security Middleware, HTTP Headers & Admin Auth Guard
- [x] Task 4.2: Admin Login with Cloudflare Turnstile & Rate Limiter
- [x] Task 4.3: TOTP 2FA (MFA) Setup & Challenge Verification
- [x] Task 4.4: Admin Layout, Dashboard, Kill Switch & Slot "Regenerate Now" Triggers
- [x] Task 4.5: Article Management (CRUD, Edit, Unpublish, Delete & Manual Creation)
- [x] Task 4.6: Manual Data Entry Form & Generation Logs Viewer
- [x] Task 4.7: Hinglish AI Editor Chat

---

### Phase 5: Deployment, Cron Configuration & Verification
**Status:** ✅ Complete
**Objective:** Cloudflare Pages deployment configuration, custom domain setup (`haryananews.online`), cron-job.org timetable setup table, security audit, and end-to-end testing checklist.
**Depends on:** Phase 4
**Tasks:**
- [x] Task 5.1: Cloudflare Pages Deployment Configuration (`wrangler.toml` & `ads.txt`)
- [x] Task 5.2: Cron-Job.org 15-Slot Automation Timetable & Config Guide (`CRON_SCHEDULE.md`)
- [x] Task 5.3: Domain Connection & Cloudflare DNS Guide (`DOMAIN_SETUP.md`)
- [x] Task 5.4: Production Secrets & Supabase CLI Commands (`SECRETS.md`)
- [x] Task 5.5: Complete Documentation & Operations Manual (`README.md`)

---

## Progress Summary

| Phase | Status | Tasks | Complete |
|---|---|---|---|
| 1. Foundation & Database | ✅ Complete | 7 | 7/7 |
| 2. Public Portal & SEO | ✅ Complete | 6 | 6/6 |
| 3. Auto-Publishing Pipeline | ✅ Complete | 6 | 6/6 |
| 4. Admin Panel & MFA | ✅ Complete | 7 | 7/7 |
| 5. Deployment & Launch | ✅ Complete | 5 | 5/5 |
| **Total** | **✅ 100% Complete** | **31** | **31/31** |
