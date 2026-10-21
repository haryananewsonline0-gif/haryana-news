# SPEC.md — Project Specification: Haryana News (haryananews.online)

> **Status**: `FINALIZED`
>
> ⚠️ **Planning Lock**: SPEC is FINALIZED. Planning and execution unlocked.

---

## 1. Vision
Build a complete, production-ready, ultra-fast Hindi news portal called **"Haryana News"** for the domain `haryananews.online`. The portal combines automated AI-assisted slot publishing, real-time localized data fetching (mandi bhav, weather, panchang, cricket, fuel, gold), Green API WhatsApp group broadcasting, AdSense-ready SEO, and a strictly secured Admin Panel with Supabase Auth, TOTP MFA, and Cloudflare Turnstile.

---

## 2. Goals
1. **High Speed & SEO-First Public Web**: Astro SSR deployed on Cloudflare Pages (`@astrojs/cloudflare`), mobile-first Haryana styling (saffron `#FF9933`, deep green `#138808`), Google News / XML sitemaps, NewsArticle JSON-LD, and sub-second TTFB.
2. **Automated Reliable Publishing Engine**: Supabase Edge Function `generate-article` accepting `?slot=<slot_key>` with `CRON_SECRET` authentication, fetching real numbers first (never hallucinated), generating journalistic Hindi articles via Google Gemini (`GEMINI_MODEL`), generating thumbnails via Pollinations.ai uploaded to ImageKit (with branded SVG/gradient fallback), duplicate content hash detection, and editorial safety filters.
3. **Multi-Channel Distribution**: Automated post-publish broadcasts to WhatsApp group via Green API with randomized delay (3-8s) and alert notifications to `OWNER_CHAT_ID` when safety filter catches sensitive drafts.
4. **Hardened Admin Panel**: Protected `/admin` route with Supabase Auth, TOTP MFA enforcement, Cloudflare Turnstile rate limiting (5 attempts/15 min), manual rates entry, slot triggers, logs viewer, and Hinglish AI editorial assistant.
5. **Zero Secret Leakage**: Strict security boundaries; secrets never exposed to client bundles or logged.

---

## 3. Non-Goals (Out of Scope for Initial Milestone)
- Direct PostgreSQL connections from the frontend (strictly prohibited; only via Supabase client with RLS or Edge Functions).
- AI invention of financial, sports, or weather numbers (strictly prohibited; narrative only around real data).
- Public user registration or open commenting without moderation.
- Native mobile apps (PWA / mobile-web responsive first).

---

## 4. Technical Stack & Architecture

| Component | Technology | Constraints / Standards |
|---|---|---|
| **Frontend** | Astro (SSR mode) | `@astrojs/cloudflare` adapter, Tailwind CSS, Noto Sans Devanagari |
| **Backend & DB** | Supabase | PostgreSQL with Row Level Security (RLS), Edge Functions (Deno runtime), Supabase Auth + MFA |
| **Automation** | cron-job.org | External HTTPS triggers with `x-cron-secret` header |
| **AI Text** | Google Gemini API | Model specified by `GEMINI_MODEL` (default: `gemini-2.5-flash`), fail with clear error if invalid |
| **AI Images** | Pollinations.ai + ImageKit | 1200x630 resolution, upload to `/haryana-news/`, fallback to branded card |
| **WhatsApp** | Green API | `sendMessage` API, 3-8s random delay, non-blocking failure handling |
| **External APIs** | Open-Meteo, data.gov.in, CricAPI | Pre-fetch real data before prompting AI |

---

## 5. Security & Isolation Matrix

| Variable / Secret | Permitted In Client | Location |
|---|---|---|
| `SUPABASE_URL` | YES (Public) | Cloudflare Pages env / Astro public env |
| `SUPABASE_ANON_KEY` | YES (Public) | Cloudflare Pages env / Astro public env |
| `TURNSTILE_SITE_KEY` | YES (Public) | Cloudflare Pages env / Astro public env |
| `SUPABASE_SERVICE_ROLE_KEY` | NO (Never) | Supabase Edge Functions Secrets ONLY |
| `GEMINI_API_KEY` | NO (Never) | Supabase Edge Functions Secrets ONLY |
| `IMAGEKIT_PRIVATE_KEY` | NO (Never) | Supabase Edge Functions Secrets ONLY |
| `GREEN_API_TOKEN` | NO (Never) | Supabase Edge Functions Secrets ONLY |
| `CRON_SECRET` | NO (Never) | Supabase Edge Functions Secrets ONLY |
| All other API keys | NO (Never) | Supabase Edge Functions / Server environment ONLY |

---

## 6. Success Criteria
- [ ] Astro SSR application compiling cleanly for Cloudflare Pages.
- [ ] Full Supabase schema with RLS and indexes deployed.
- [ ] 15 IST slots seeded and automated via Edge Function.
- [ ] Automated real-data fetching for weather, mandi, cricket, fuel, and panchang.
- [ ] WhatsApp Green API notifications working with rate limiting and delay.
- [ ] Admin panel protected with email allowlist, TOTP 2FA, and Turnstile.
- [ ] Zero secret leaks verified by build and security scan.

---

*Status: FINALIZED*
