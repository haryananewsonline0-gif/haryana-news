---
milestone: "Haryana News Platform V1"
version: "1.0.0"
updated: "2026-10-21T12:45:00+05:30"
---

# Roadmap — Haryana News (haryananews.online)

> **Current Phase:** Phase 1 - Foundation, Database Architecture & Scaffolding
> **Status:** 🔄 Executing

---

## Must-Haves (from SPEC)
- [ ] Astro SSR on Cloudflare Pages with Tailwind & Noto Sans Devanagari
- [ ] Supabase Database Schema with 7 tables, strict RLS & performance indexes
- [ ] Seed data for 15 IST publishing slots, news categories & fallback schema
- [ ] Public News Portal (Home, Article Page, Categories, Districts, AdSense-ready pages)
- [ ] Auto-Publishing Edge Function with Gemini AI, Pollinations/ImageKit & Green API WhatsApp
- [ ] Secure Admin Panel (/admin) with Supabase Auth, TOTP MFA & Turnstile rate limiting
- [ ] External cron-job.org timetable configuration and production deployment guides

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
**Status:** ⬜ Not Started
**Objective:** Build high-speed public news portal with mobile-first Haryana layout, Breaking News ticker, Grid sections, District filters, Article page with social share & AI image badge, AdSense legal pages, and NewsArticle JSON-LD / Sitemaps.
**Depends on:** Phase 1

---

### Phase 3: Auto-Publishing Pipeline & Edge Functions
**Status:** ⬜ Not Started
**Objective:** Build `generate-article` Supabase Edge Function with CRON_SECRET authentication, real-data collectors (Weather, Mandi, Cricket, Fuel, Panchang, News RSS), Gemini generation, Pollinations + ImageKit upload with branded card fallback, duplicate hash check, safety filters, and Green API WhatsApp group broadcasting.
**Depends on:** Phase 1

---

### Phase 4: Secure Admin Panel & Editorial Dashboard
**Status:** ⬜ Not Started
**Objective:** Build `/admin` panel with email allowlist, Supabase Auth + TOTP 2FA, Cloudflare Turnstile, Article management (publish/unpublish/edit), manual rates entry, slot trigger buttons, kill switch, logs viewer, and Hinglish AI editorial assistant.
**Depends on:** Phase 1, Phase 2, Phase 3

---

### Phase 5: Deployment, Cron Configuration & Verification
**Status:** ⬜ Not Started
**Objective:** Cloudflare Pages deployment configuration, custom domain setup (`haryananews.online`), cron-job.org timetable setup table, security audit, and end-to-end testing checklist.
**Depends on:** Phase 4

---

## Progress Summary

| Phase | Status | Tasks | Complete |
|---|---|---|---|
| 1. Foundation & Database | ✅ Complete | 7 | 7/7 |
| 2. Public Portal & SEO | ⬜ Not Started | 6 | 0/6 |
| 3. Auto-Publishing Pipeline | ⬜ Not Started | 6 | 0/6 |
| 4. Admin Panel & MFA | ⬜ Not Started | 6 | 0/6 |
| 5. Deployment & Launch | ⬜ Not Started | 5 | 0/5 |
