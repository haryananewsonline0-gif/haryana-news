---
phase: 4
plan: "Secure Admin Panel, MFA, Turnstile & AI Editorial Chat"
wave: 4
gap_closure: false
---

# Plan 4: Secure Admin Panel, MFA, Turnstile & AI Editorial Chat

## Objective
Build the hardened single-admin management portal at `/admin` (`noindex, nofollow`). Implement security middleware with mandatory security headers, Supabase Auth + Cloudflare Turnstile + login rate limiting (5 attempts/15 min), and TOTP 2FA (MFA). Deliver an admin dashboard with metrics, kill switch, WhatsApp toggle, slot "Regenerate Now" trigger, article CRUD, fallback rates editor, generation logs viewer, and a Hinglish AI editorial chat assistant running through a server-side Gemini proxy.

## Context
- `PRD.md` — Section 9 (Milestone 4 Tasks)
- `.gsd/SPEC.md` — Section 5 (Admin Panel & Security)
- `src/types/database.ts` — Data models

---

## Tasks

<task type="auto">
  <name>Task 4.1: Security Middleware, HTTP Headers & Admin Auth Guard</name>
  <files>
    src/middleware.ts
    src/lib/auth/session.ts
  </files>
  <action>
    1. Implement src/lib/auth/session.ts to verify Supabase JWT token and extract email and MFA status.
    2. Implement src/middleware.ts applying CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy, and X-Robots-Tag: noindex, nofollow, noarchive.
    3. Protect all /admin/* routes (excluding /admin/login and /admin/mfa): if not authenticated or not ADMIN_EMAIL, redirect to /admin/login. If MFA pending, redirect to /admin/mfa.
  </action>
  <verify>npx astro check</verify>
  <done>Middleware guards /admin and adds security headers</done>
</task>

<task type="auto">
  <name>Task 4.2: Admin Login with Cloudflare Turnstile & Rate Limiter</name>
  <files>
    src/lib/auth/rate-limiter.ts
    src/pages/api/admin/auth/login.ts
    src/pages/admin/login.astro
  </files>
  <action>
    1. Implement in-memory IP rate limiter (max 5 attempts per 15 min).
    2. Build login API verifying Turnstile token, checking rate limits, validating ADMIN_EMAIL, and checking Supabase MFA factors.
    3. Build login.astro UI with Turnstile widget and Hindi error notices.
  </action>
  <verify>npx astro check</verify>
  <done>Login route handles Turnstile, rate limits, and credentials</done>
</task>

<task type="auto">
  <name>Task 4.3: TOTP 2FA (MFA) Setup & Challenge Verification</name>
  <files>
    src/pages/api/admin/auth/verify-mfa.ts
    src/pages/api/admin/auth/setup-mfa.ts
    src/pages/admin/mfa.astro
    src/pages/admin/mfa-setup.astro
  </files>
  <action>
    1. Build setup-mfa.ts and mfa-setup.astro for enrolling TOTP with QR code.
    2. Build verify-mfa.ts and mfa.astro for 6-digit TOTP challenge verification.
  </action>
  <verify>npx astro check</verify>
  <done>MFA enrollment and verification workflow operational</done>
</task>

<task type="auto">
  <name>Task 4.4: Admin Layout, Dashboard, Kill Switch & Slot Triggers</name>
  <files>
    src/layouts/AdminLayout.astro
    src/pages/admin/index.astro
    src/pages/api/admin/settings.ts
    src/pages/api/admin/trigger-slot.ts
  </files>
  <action>
    1. Create AdminLayout.astro with responsive navigation and logout.
    2. Build admin/index.astro with summary metrics (today's articles, views, failures).
    3. Implement kill switch and WhatsApp toggles via api/admin/settings.ts.
    4. Build slot cards with "Regenerate Now" buttons triggering Edge Function securely via api/admin/trigger-slot.ts.
  </action>
  <verify>npx astro check</verify>
  <done>Dashboard renders metrics and manages system controls</done>
</task>

<task type="auto">
  <name>Task 4.5: Article Management (CRUD)</name>
  <files>
    src/pages/admin/articles/index.astro
    src/pages/admin/articles/new.astro
    src/pages/admin/articles/edit/[id].astro
    src/pages/api/admin/articles/index.ts
  </files>
  <action>
    1. Build articles/index.astro listing all articles with status badges and filters.
    2. Build articles/new.astro and edit/[id].astro forms with Zod validation.
    3. Implement api/admin/articles/index.ts handling create, update, unpublish, and delete.
  </action>
  <verify>npx astro check</verify>
  <done>Full article CRUD operations functional</done>
</task>

<task type="auto">
  <name>Task 4.6: Manual Data Entry Form & Generation Logs Viewer</name>
  <files>
    src/pages/admin/manual-data.astro
    src/pages/admin/logs.astro
    src/pages/api/admin/manual-data.ts
  </files>
  <action>
    1. Build manual-data.astro with input forms for Gold, Silver, Petrol, Diesel, LPG, and Market rates.
    2. Build logs.astro rendering recent generation runs with duration and errors.
    3. Implement api/admin/manual-data.ts updating database.
  </action>
  <verify>npx astro check</verify>
  <done>Manual rates editable and automated logs viewable</done>
</task>

<task type="auto">
  <name>Task 4.7: Hinglish AI Editor Chat</name>
  <files>
    src/pages/api/admin/ai-chat.ts
    src/pages/admin/ai-editor.astro
  </files>
  <action>
    1. Implement api/admin/ai-chat.ts proxying prompts to Gemini with a dedicated Hinglish editorial persona.
    2. Build ai-editor.astro with chat message stream, quick actions, and copy-to-editor shortcuts.
  </action>
  <verify>npx astro check</verify>
  <done>Hinglish AI editor chat functioning securely on the server</done>
</task>
