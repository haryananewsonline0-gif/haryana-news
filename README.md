# 🇮🇳 हरियाणा न्यूज़ (Haryana News — haryananews.online)

> **आधुनिक, तीव्र और 100% प्रामाणिक हिंदी समाचार पोर्टल**  
> डोमेन: [haryananews.online](https://haryananews.online) • स्टैक: Astro SSR + Tailwind CSS + Cloudflare Pages + Supabase + Google Gemini

---

## 🌟 मुख्य विशेषताएं (Core Features)

1. **सख्त सत्यता नियम (Strict Zero-Hallucination Policy):**
   - सोना-चांदी भाव, पेट्रोल-डीजल दरें, मंडी भाव, मौसम पूर्वानुमान और क्रिकेट स्कोर AI द्वारा कभी मनगढ़ंत नहीं लिखे जाते।
   - सभी आंकड़े वास्तविक सार्वजनिक API से प्राप्त किए जाते हैं या एडमिन द्वारा सत्यापित `manual_data` से लिए जाते हैं।

2. **स्वचालित 15-स्लॉट प्रकाशन पाइपलाइन (15-Slot Automation Pipeline):**
   - दैनिक 15 विशिष्ट समय स्लॉट्स (सुबह 05:00 से रात 10:30 IST) में स्वचालित रूप से समाचार तैयार और प्रकाशित होते हैं।
   - Supabase Deno Edge Function `generate-article` द्वारा संचालित, जो `cron-job.org` द्वारा `x-cron-secret` टाइमिंग-सेफ प्रमाणीकरण के साथ ट्रिगर होता है।

3. **सुदृढ़ एडमिन सुरक्षा (Hardened Admin Security):**
   - रूट: `/admin` (`noindex, nofollow, noarchive`).
   - सुरक्षा स्तर: Supabase Auth (`ADMIN_EMAIL` अनुमति सूची) + Cloudflare Turnstile CAPTCHA + लॉगिन दर सीमा (15 मिनट में अधिकतम 5 प्रयास) + TOTP 2FA (Google Authenticator / Authy अनिवार्य)।
   - आपातकालीन **किल स्विच (Kill Switch)** और **व्हाट्सएप ब्रॉडकास्ट टॉगल**।
   - स्लॉट प्रबंधन: किसी भी स्लॉट को तुरंत टेस्ट या रीजनरेट करने के लिए "तुरंत चलाएं (Regenerate Now)" नियंत्रण।
   - समाचार प्रबंधन (CRUD): संपादन, ड्राफ्ट्स समीक्षा, प्रकाशन, विलोपन।
   - **हिंग्लिश AI संपादक (Hinglish AI Editor):** Google Gemini समर्थित न्यूज़रूम सहायक जो हेडलाइंस, SEO विवरण और सोशल पोस्ट्स तैयार करता है।

4. **SEO एवं AdSense अनुपालन:**
   - सर्वर-साइड रेंडरिंग (SSR) के साथ 100% सर्च इंजन इंडेक्सिंग।
   - NewsArticle JSON-LD स्कीमा, Open Graph और Twitter Card मेटा टैग।
   - Google News समर्पित साइटमैप (`/google-news-sitemap.xml` - पिछले 48 घंटों के समाचार `<news:news>` टैग के साथ)।
   - मानक XML साइटमैप (`/sitemap.xml`) और RSS फीड (`/rss.xml`)।
   - Google AdSense अनिवार्य पृष्ठ: `/about`, `/contact`, `/privacy-policy`, `/disclaimer`, `/terms` एवं `/ads.txt`।

5. **ब्रांडेड विजुअल्स व व्हाट्सएप ब्रॉडकास्ट:**
   - Pollinations.ai द्वारा प्रासंगिक फोटोग्राफिक दृश्य जनरेशन -> ImageKit पर स्थायी CDN अपलोड।
   - विफलता पर केसरिया-हरे ग्रेडिएंट वाला ब्रांडेड टेम्पलेट कार्ड फॉलबैक।
   - Green API द्वारा प्रकाशित लेखों का व्हाट्सएप चैनल पर 3-8 सेकंड के यादृच्छिक विलंब के साथ प्रसारण।
   - संवेदनशील समाचारों (अपराध, विवाद, मृत्यु) पर स्वचालित **ड्राफ्ट क्वारंटाइन** और मालिक को व्यक्तिगत व्हाट्सएप अलर्ट।

---

## 🛠️ तकनीकी स्टैक (Technology Stack)

| घटक (Component) | प्रयुक्त तकनीक (Technology Used) |
| :--- | :--- |
| **Frontend & SSR** | Astro v5 (SSR mode, Node/Edge server) |
| **Styling** | Tailwind CSS (कस्टम केसरिया `#FF9933`, हरा `#138808`, Noto Sans Devanagari) |
| **Hosting & CDN** | Cloudflare Pages (ग्लोबल एज नेटवर्क, HTTP/3, Brotli, Full Strict SSL) |
| **Database & Auth** | Supabase PostgreSQL + Row Level Security (RLS) + Supabase Auth (TOTP MFA) |
| **Serverless Functions**| Supabase Edge Functions (Deno runtime, timing-safe crypto) |
| **AI Content Engine** | Google Gemini API (`gemini-2.5-flash` / `gemini-3.5-flash-lite`, Structured JSON) |
| **Thumbnail Engine** | Pollinations.ai -> ImageKit CDN + Branded SVG Card Fallback |
| **Messaging** | Green API (WhatsApp Group Broadcasts & Owner Alerts) |
| **External APIs** | Open-Meteo (Weather), data.gov.in (Mandi), CricAPI (Cricket) |

---

## 🚀 स्थानीय विकास व सेटअप (Local Development)

### 1. रिपॉजिटरी क्लोन व निर्भरताएं इंस्टॉल करें:
```bash
git clone https://github.com/your-username/haryana-news.git
cd haryana-news
npm install
```

### 2. पर्यावरण चर कॉन्फ़िगर करें:
`.env.example` की प्रतिलिपि बनाकर `.env` बनाएं:
```bash
cp .env.example .env
```
`.env` में अपनी Supabase, Gemini और Turnstile कुंजियां दर्ज करें।

### 3. विकास सर्वर चलाएं:
```bash
npm run dev
```
ब्राउज़र में `http://localhost:4321` खोलें।

### 4. टाइपचेक और प्रोडक्शन बिल्ड जांचें:
```bash
# पूर्ण टाइपचेकिंग (0 errors आवश्यक)
npx astro check

# प्रोडक्शन बंडल बिल्ड
npm run build
```

---

## 🗄️ डेटाबेस माइग्रेशन (Database Setup)

Supabase प्रोजेक्ट में SQL Editor या CLI द्वारा निम्नलिखित माइग्रेशन निष्पादित करें:
1. `supabase/migrations/20261021000000_initial_schema.sql` (7 मुख्य टेबल्स और इंडेक्स)
2. `supabase/migrations/20261021000001_rls_policies.sql` (शून्य-विश्वास RLS नीतियां)
3. `supabase/migrations/20261021000002_seed_data.sql` (15 स्लॉट्स, श्रेणियां, डिफॉल्ट सेटिंग्स व दरें)

### एडमिन उपयोगकर्ता जोड़ना:
Supabase Auth में ईमेल-पासवर्ड से उपयोगकर्ता बनाएं और `admins` टेबल में ईमेल दर्ज करें:
```sql
INSERT INTO public.admins (email, role)
VALUES ('admin@haryananews.online', 'admin');
```

---

## 🔐 विस्तृत प्रलेखन लिंक (Documentation Links)

- [क्रॉन 15-स्लॉट शेड्यूल गाइड (CRON_SCHEDULE.md)](./CRON_SCHEDULE.md)
- [डोमेन व क्लाउडफ्लेयर DNS सेटअप (DOMAIN_SETUP.md)](./DOMAIN_SETUP.md)
- [सीक्रेट्स एवं पर्यावरण चर गाइड (SECRETS.md)](./SECRETS.md)

---

## 📄 लाइसेंस (License)
कॉपीराइट © 2026 Haryana News (haryananews.online)। सर्वाधिकार सुरक्षित।
