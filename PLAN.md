---
phase: 2
plan: "Public Portal, Core Pages & SEO Engine"
wave: 2
gap_closure: false
---

# Plan 2: Public Portal, Core Pages & SEO Engine

## Objective
Build a rich, high-speed public news portal frontend with mobile-first responsive layout, Breaking News ticker, Homepage sections, Article detail pages with social sharing & AI image disclaimers, Category & District routing, AdSense-ready policy pages, NewsArticle JSON-LD, and dynamic XML/Google News sitemaps.

## Context
- `PRD.md` — Section 5 (Milestone 2 Tasks)
- `.gsd/SPEC.md` — Core specifications
- `.gsd/ROADMAP.md` — Phase progression

---

## Tasks

<task type="auto">
  <name>Task 2.1: Homepage Layout, Breaking News & Section Grids</name>
  <files>
    src/utils/imagekit.ts
    src/components/ArticleCard.astro
    src/components/BreakingTicker.astro
    src/pages/index.astro
  </files>
  <action>
    1. Create ImageKit helper in src/utils/imagekit.ts for responsive WebP transformations.
    2. Create src/components/ArticleCard.astro with hover animation, category badge, and IST formatted date.
    3. Create src/components/BreakingTicker.astro with live red pulse and headline ticker.
    4. Upgrade src/pages/index.astro with Hero story, Trending strip, Quick market rates bar, and Category news grids.
  </action>
  <verify>npx astro check</verify>
  <done>Home page renders rich responsive news portal sections</done>
</task>

<task type="auto">
  <name>Task 2.2: Article Detail Page with Social Share, Breadcrumbs & AI Badge</name>
  <files>
    src/components/Breadcrumbs.astro
    src/components/ShareButtons.astro
    src/pages/news/[slug].astro
  </files>
  <action>
    1. Create Breadcrumbs.astro with schema-friendly structure.
    2. Create ShareButtons.astro with WhatsApp, Telegram, Facebook, X, and native Copy Link toast.
    3. Create src/pages/news/[slug].astro with H1 headline, byline, IST publication timestamp, thumbnail with "प्रतीकात्मक तस्वीर (AI)" caption, body HTML, source credit, related news, and NewsArticle JSON-LD schema.
  </action>
  <verify>npx astro check</verify>
  <done>Article route compiles cleanly with complete SEO schema and share buttons</done>
</task>

<task type="auto">
  <name>Task 2.3: Category & District Routing</name>
  <files>
    src/pages/category/[category].astro
    src/pages/district/[district].astro
  </files>
  <action>
    1. Create category/[category].astro with category header, article grid, and fallback empty state.
    2. Create district/[district].astro with district description, priority regional highlight, and local news feed.
  </action>
  <verify>npx astro check</verify>
  <done>Category and District SSR routes handle requests cleanly</done>
</task>

<task type="auto">
  <name>Task 2.4: Search Engine & News Archive</name>
  <files>
    src/pages/search.astro
  </files>
  <action>
    1. Create search.astro with input box and server-side ilike query filtering published articles.
  </action>
  <verify>npx astro check</verify>
  <done>Search page functions with query parameters</done>
</task>

<task type="auto">
  <name>Task 2.5: AdSense-Ready Hindi Legal & Information Pages</name>
  <files>
    src/pages/about.astro
    src/pages/contact.astro
    src/pages/privacy-policy.astro
    src/pages/disclaimer.astro
    src/pages/terms.astro
  </files>
  <action>
    1. Create About Us (/about) in Hindi.
    2. Create Contact Us (/contact) with contact email and address in Sirsa/Haryana.
    3. Create Privacy Policy (/privacy-policy) for DPDP Act & Google AdSense compliance.
    4. Create Disclaimer (/disclaimer) highlighting AI image symbolic nature and news credits.
    5. Create Terms & Conditions (/terms).
  </action>
  <verify>npx astro check</verify>
  <done>All 5 AdSense-required policy pages created and linked</done>
</task>

<task type="auto">
  <name>Task 2.6: SEO Engine — Dynamic Sitemaps, RSS & Robots.txt</name>
  <files>
    src/pages/robots.txt.ts
    src/pages/sitemap.xml.ts
    src/pages/google-news-sitemap.xml.ts
    src/pages/rss.xml.ts
  </files>
  <action>
    1. Implement robots.txt.ts blocking /admin, allowing /, and pointing to sitemaps.
    2. Implement sitemap.xml.ts with all published articles, categories, and static pages.
    3. Implement google-news-sitemap.xml.ts filtering articles from the last 48 hours with news tags.
    4. Implement rss.xml.ts generating valid RSS 2.0 feed with Hindi metadata.
  </action>
  <verify>npx astro build</verify>
  <done>All SEO syndication endpoints respond with valid XML/text</done>
</task>
