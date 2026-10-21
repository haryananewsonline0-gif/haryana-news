# डोमेन सेटअप व क्लाउडफ्लेयर DNS निर्देशिका (haryananews.online)

यह गाइड `haryananews.online` को Cloudflare Pages, Cloudflare Turnstile CAPTCHA, SSL/TLS, और Google AdSense के साथ पूरी तरह कनेक्ट करने के सटीक चरण प्रदान करती है।

---

## 1. Cloudflare Pages पर कस्टम डोमेन जोड़ना (Custom Domain Connection)

1. **Cloudflare Dashboard** में लॉगिन करें।
2. बायीं ओर मेनू में **"Compute (Workers & Pages)"** > **"Pages"** पर क्लिक करें।
3. अपने प्रोजेक्ट `haryana-news` का चयन करें।
4. **"Custom domains"** टैब पर जाएं और **"Set up a custom domain"** पर क्लिक करें।
5. डोमेन नाम दर्ज करें: `haryananews.online`।
6. Cloudflare DNS रिकॉर्ड्स की पुष्टि करेगा और स्वचालित रूप से SSL प्रमाणपत्र जारी करेगा।
7. दूसरा डोमेन `www.haryananews.online` भी जोड़ें।

---

## 2. DNS रिकॉर्ड्स तालिका (DNS Zone Configuration)

Cloudflare DNS टैब में निम्नलिखित रिकॉर्ड्स सुनिश्चित करें:

| प्रकार (Type) | नाम (Name) | सामग्री / लक्ष्य (Content/Target) | प्रॉक्सी स्थिति (Proxy Status) | TTL |
| :---: | :---: | :--- | :---: | :---: |
| **CNAME** | `@` (Apex) | `haryana-news.pages.dev` | 🟠 **Proxied** (सक्रिय) | Auto |
| **CNAME** | `www` | `haryana-news.pages.dev` | 🟠 **Proxied** (सक्रिय) | Auto |
| **TXT** | `@` | `google-site-verification=YOUR_KEY` | ⚪ DNS only | Auto |

---

## 3. SSL/TLS एवं सुरक्षा सेटिंग्स (Security Best Practices)

Cloudflare Dashboard > **SSL/TLS** सेक्शन में:

1. **Encryption Mode:** `Full (Strict)` का चयन करें।
2. **Edge Certificates:**
   - **Always Use HTTPS:** `ON` (चालू करें)
   - **Automatic HTTPS Rewrites:** `ON` (चालू करें)
   - **Minimum TLS Version:** `TLS 1.2` या `TLS 1.3`
   - **Opportunistic Encryption:** `ON`
3. **Speed > Optimization:**
   - **HTTP/3 (with QUIC):** `ON`
   - **0-RTT Connection Resumption:** `ON`
   - **Brotli Compression:** `ON`

---

## 4. Cloudflare Turnstile सेटअप (एडमिन लॉगिन सुरक्षा)

एडमिन पोर्टल (`/admin/login`) पर बॉट और ब्रूट-फोर्स हमलों से सुरक्षा के लिए Cloudflare Turnstile आवश्यक है:

1. Cloudflare Dashboard में बायीं ओर **"Turnstile"** मेनू पर क्लिक करें।
2. **"Add Site"** पर क्लिक करें।
3. सेटिंग्स भरें:
   - **Site name:** `Haryana News Admin`
   - **Domain:** `haryananews.online` (विकास/परीक्षण के लिए `localhost` भी जोड़ें)
   - **Widget Mode:** `Managed` (सिफारिशित)
4. सबमिट करने के बाद आपको दो कुंजियां मिलेंगी:
   - **Site Key:** इसे `PUBLIC_TURNSTILE_SITE_KEY` में सेट करें।
   - **Secret Key:** इसे `TURNSTILE_SECRET_KEY` में सेट करें।

---

## 5. Google AdSense एवं Search Console एकीकरण

1. **Google Search Console:**
   - `https://search.google.com/search-console` पर जाएं।
   - `haryananews.online` जोड़ें और DNS TXT रिकॉर्ड द्वारा सत्यापित करें।
   - **Sitemaps** टैब में जाकर निम्नलिखित दो साइटमैप सबमिट करें:
     1. `https://haryananews.online/sitemap.xml`
     2. `https://haryananews.online/google-news-sitemap.xml`
2. **Google AdSense:**
   - AdSense में साइट `haryananews.online` सबमिट करें।
   - प्रोजेक्ट के `public/ads.txt` में अपना प्रकाशक कोड (Publisher ID) अपडेट करें:
     `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`
   - AdSense क्रॉलर `https://haryananews.online/ads.txt` पर इसे स्वचालित रूप से पढ़ लेगा।
