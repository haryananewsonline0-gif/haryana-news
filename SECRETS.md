# सुरक्षा, पर्यावरण चर व सीक्रेट्स प्रबंधन (Secrets Management Guide)

> **अति महत्वपूर्ण सुरक्षा नियम:**  
> कभी भी किसी API कुंजी, टोकन या पासवर्ड को गिट (Git) रिपॉजिटरी में कमिट न करें। `.env` फ़ाइल हमेशा `.gitignore` में सुरक्षित रहनी चाहिए।

---

## 1. पर्यावरण चर वर्गीकरण (Variables Classification)

### A. पब्लिक क्लाइंट चर (Public Browser Bundle — केवल 3)
ये चर ब्राउज़र में सार्वजनिक रूप से लोड होते हैं और केवल सुरक्षित अनामित (anon) कुंजियां हैं:
1. `PUBLIC_SUPABASE_URL`: Supabase प्रोजेक्ट URL (उदा. `https://xyz.supabase.co`)
2. `PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon पब्लिक कुंजी (RLS द्वारा सुरक्षित)
3. `PUBLIC_TURNSTILE_SITE_KEY`: Cloudflare Turnstile पब्लिक विजेट साइट की

### B. सर्वर व एज फंक्शन सीक्रेट्स (Server & Edge Functions — अति गोपनीय)
ये सीक्रेट केवल सर्वर-साइड (Cloudflare Pages Functions / Supabase Deno Edge Functions) में लोड होते हैं:
- **Supabase Backend:**
  - `SUPABASE_SERVICE_ROLE_KEY`: एडमिन व बैकएंड ऑपरेशंस हेतु
  - `CRON_SECRET`: क्रॉन जॉब्स के लिए ऑथेंटिकेशन सीक्रेट हेडर (`x-cron-secret`)
  - `ADMIN_EMAIL`: एडमिनिस्ट्रेटर ईमेल अनुमति सूची (Allowlist)
- **CAPTCHA & Rate Limiting:**
  - `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile बैकएंड वेरिफिकेशन सीक्रेट
- **Google AI (Gemini):**
  - `GEMINI_API_KEY`: Google AI Studio API कुंजी
  - `GEMINI_MODEL`: डिफ़ॉल्ट `gemini-2.5-flash`
- **ImageKit:**
  - `IMAGEKIT_PUBLIC_KEY`: ImageKit पब्लिक कुंजी
  - `IMAGEKIT_PRIVATE_KEY`: ImageKit प्राइवेट कुंजी
  - `IMAGEKIT_URL_ENDPOINT`: ImageKit एंडपॉइंट URL (उदा. `https://ik.imagekit.io/hnews/`)
- **Green API (WhatsApp):**
  - `GREEN_API_INSTANCE_ID`: Green API इंस्टेंस आईडी
  - `GREEN_API_API_TOKEN`: Green API ऑथेंटिकेशन टोकन
  - `WHATSAPP_GROUP_CHAT_ID`: पब्लिक न्यूज़ ग्रुप चैट आईडी (`...@g.us`)
  - `OWNER_CHAT_ID`: संवेदनशील ड्राफ्ट्स अलर्ट के लिए स्वामी की व्यक्तिगत चैट आईडी (`...@c.us`)
- **External Public Data APIs:**
  - `DATA_GOV_IN_API_KEY`: data.gov.in मंडी भाव API कुंजी (वैकल्पिक, ऑटो-फॉलबैक मौजूद)
  - `CRIC_API_KEY`: cricapi.com क्रिकेट स्कोर API कुंजी (वैकल्पिक)
- **Site URL:**
  - `SITE_URL`: `https://haryananews.online`

---

## 2. Supabase CLI द्वारा एज फंक्शन सीक्रेट्स सेट करना

Supabase CLI का उपयोग करके अपने प्रोडक्शन प्रोजेक्ट पर एक बार में सभी आवश्यक सीक्रेट्स सेट करें:

```bash
# Supabase प्रोजेक्ट लिंक करें (यदि पहले से लिंक नहीं है)
supabase link --project-ref YOUR_PROJECT_REF

# सभी एज फंक्शन सीक्रेट्स सेट करें
supabase secrets set \
  CRON_SECRET="your_very_strong_random_secret_here" \
  GEMINI_API_KEY="AIzaSy..." \
  GEMINI_MODEL="gemini-2.5-flash" \
  IMAGEKIT_PUBLIC_KEY="public_..." \
  IMAGEKIT_PRIVATE_KEY="private_..." \
  IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your_id/" \
  GREEN_API_INSTANCE_ID="1101..." \
  GREEN_API_API_TOKEN="abcdef..." \
  WHATSAPP_GROUP_CHAT_ID="1203630...@g.us" \
  OWNER_CHAT_ID="919876543210@c.us" \
  DATA_GOV_IN_API_KEY="579b..." \
  CRIC_API_KEY="cric_..." \
  SITE_URL="https://haryananews.online"
```

वर्तमान सीक्रेट्स की सूची सत्यापित करने के लिए:
```bash
supabase secrets list
```

---

## 3. Cloudflare Pages पर Environment Variables सेट करना

1. Cloudflare Dashboard > **Compute (Workers & Pages)** > **Pages** > `haryana-news` पर जाएं।
2. **Settings** टैब > **Environment variables** पर क्लिक करें।
3. **Production** एनवायरनमेंट में निम्नलिखित वेरिएबल्स जोड़ें:

| Variable Name | Type | Value / Description |
| :--- | :--- | :--- |
| `PUBLIC_SUPABASE_URL` | Plain text | `https://YOUR-ID.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | Plain text | आपकी Anon Key |
| `PUBLIC_TURNSTILE_SITE_KEY` | Plain text | आपकी Turnstile Site Key |
| `SUPABASE_URL` | Encrypted | `https://YOUR-ID.supabase.co` |
| `SUPABASE_ANON_KEY` | Encrypted | आपकी Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Encrypted (Secret) | आपकी Service Role Key |
| `ADMIN_EMAIL` | Encrypted | `admin@haryananews.online` |
| `TURNSTILE_SECRET_KEY` | Encrypted (Secret) | आपकी Turnstile Secret Key |
| `CRON_SECRET` | Encrypted (Secret) | वही सीक्रेट जो क्रॉन में है |
| `GEMINI_API_KEY` | Encrypted (Secret) | AI एडिटर के लिए Gemini Key |
| `GEMINI_MODEL` | Plain text | `gemini-2.5-flash` |
| `SITE_URL` | Plain text | `https://haryananews.online` |

4. **Save** पर क्लिक करें और डिप्लॉयमेंट को री-बिल्ड करें।
