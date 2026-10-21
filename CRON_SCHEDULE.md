# हरियाणा न्यूज़ (haryananews.online) — 15-स्लॉट ऑटोमेशन व क्रॉन शेड्यूल (cron-job.org)

यह दस्तावेज़ `cron-job.org` के माध्यम से सभी 15 दैनिक स्वचालित प्रकाशन स्लॉट्स को कॉन्फ़िगर करने की पूर्ण मार्गदर्शिका है।

---

## 1. सामान्य क्रॉन अनुरोध सेटिंग्स (Common Request Configuration)

प्रत्येक जॉब के लिए निम्नलिखित सेटिंग्स समान रहेंगी:

| सेटिंग पैरामीटर | मान (Value) | विवरण |
| :--- | :--- | :--- |
| **HTTP Method** | `POST` | एज फंक्शन को POST अनुरोध भेजा जाता है |
| **Timezone** | `Asia/Kolkata` (IST) | भारतीय मानक समय |
| **Request Header 1** | `x-cron-secret: YOUR_CRON_SECRET` | वही सीक्रेट जो Supabase secrets में सेट है |
| **Request Header 2** | `Content-Type: application/json` | JSON सामग्री प्रकार |
| **Request Body** | `{}` | खाली JSON ऑब्जेक्ट |
| **Request Timeout** | `60` Seconds | AI जनरेशन और इमेज अपलोड के लिए पर्याप्त समय |
| **Failure Retry** | 1 retry after 2 minutes | अस्थायी नेटवर्क त्रुटि से बचाव हेतु |

> **बेस URL फॉर्मेट:**  
> `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/functions/v1/generate-article?slot=<SLOT_KEY>`

---

## 2. 15-स्लॉट समय-सारिणी तालिका (Complete Timetable Schedule)

| स्लॉट संख्या | समय (IST) | समय (UTC) | स्लॉट कुंजी (`slot_key`) | श्रेणी | विषय व डेटा स्रोत | लक्षित URL (Target Endpoint) |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- |
| **1** | **05:00 AM** | 23:30 (prev) | `rashifal` | पंचांग व राशिफल | दैनिक 12 राशियों का राशिफल | `.../generate-article?slot=rashifal` |
| **2** | **05:20 AM** | 23:50 (prev) | `panchang_choghadiya` | पंचांग व राशिफल | पंचांग, चौघड़िया, राहुकाल (सिरसा) | `.../generate-article?slot=panchang_choghadiya` |
| **3** | **05:40 AM** | 00:10 | `weather_districtwise` | मौसम | हरियाणा 22 जिलों का मौसम (Open-Meteo) | `.../generate-article?slot=weather_districtwise` |
| **4** | **06:00 AM** | 00:30 | `today_in_history` | आज का इतिहास | आज की ऐतिहासिक घटनाएं | `.../generate-article?slot=today_in_history` |
| **5** | **06:30 AM** | 01:00 | `gold_silver` | बिजनेस व बाजार | सोने व चांदी की लाइव/बैकअप दरें | `.../generate-article?slot=gold_silver` |
| **6** | **07:00 AM** | 01:30 | `petrol_diesel_lpg` | बिजनेस व बाजार | पेट्रोल, डीजल और 14.2kg LPG सिलेंडर रेट | `.../generate-article?slot=petrol_diesel_lpg` |
| **7** | **07:30 AM** | 02:00 | `share_market` | बिजनेस व बाजार | Sensex, Nifty 50 बाजार संकेत | `.../generate-article?slot=share_market` |
| **8** | **08:30 AM** | 03:00 | `govt_schemes` | सरकारी योजनाएं | हरियाणा परिवार पहचान पत्र/कल्याणकारी योजनाएं | `.../generate-article?slot=govt_schemes` |
| **9** | **09:30 AM** | 04:00 | `govt_jobs` | सरकारी नौकरी | HSSC, पुलिस, CET, शिक्षक भर्तियां | `.../generate-article?slot=govt_jobs` |
| **10** | **11:00 AM** | 05:30 | `train_bus_tech` | टेक व ऑटो | हरियाणा रोडवेज, रेलवे व तकनीक अपडेट | `.../generate-article?slot=train_bus_tech` |
| **11** | **01:00 PM** | 07:30 | `mandi_bhav` | मंडी भाव | सिरसा, हिसार, आदमपुर, ऐलनाबाद मंडी भाव | `.../generate-article?slot=mandi_bhav` |
| **12** | **03:00 PM** | 09:30 | `cricket_sports` | खेल कूद | क्रिकेट स्कोर, हरियाणा के खिलाड़ी व पदक | `.../generate-article?slot=cricket_sports` |
| **13** | **06:00 PM** | 12:30 | `top10_news` | टॉप 10 | दिनभर की 10 बड़ी खबरें व बुलेटिन | `.../generate-article?slot=top10_news` |
| **14** | **08:00 PM** | 14:30 | `google_trends_india` | हरियाणा | ट्रेंडिंग नेशनल व राज्य विषय | `.../generate-article?slot=google_trends_india` |
| **15** | **10:30 PM** | 17:00 | `regional_coverage` | क्षेत्रीय | सिरसा, फतेहाबाद, हिसार, नोहर, भादरा | `.../generate-article?slot=regional_coverage` |

---

## 3. cron-job.org पर सेटअप करने के चरण (Step-by-Step Instructions)

1. [cron-job.org](https://cron-job.org) पर निःशुल्क खाता बनाएं या लॉगिन करें।
2. **"Cronjobs"** टैब पर जाएं और **"Create Cronjob"** पर क्लिक करें।
3. **Title** दर्ज करें, जैसे: `HN-01-Rashifal-0500`.
4. **Address (URL):**  
   `https://<YOUR-PROJECT-ID>.supabase.co/functions/v1/generate-article?slot=rashifal`
5. **Schedule:**
   - Execution schedule: **"User-defined"**
   - Timezone: `Asia/Kolkata`
   - Days: Every day (Daily)
   - Time: `05:00` (या तालिका अनुसार स्लॉट समय)
6. **Request:**
   - Request method: `POST`
   - Request body: `{}`
   - Request headers:
     - Header Name: `x-cron-secret`
     - Header Value: `<आपकी CRON_SECRET कुंजी>`
     - Header Name: `Content-Type`
     - Header Value: `application/json`
7. **Advanced Settings:**
   - Request Timeout: `60` Seconds
   - Failure notifications: Enabled (ईमेल पर अलर्ट प्राप्त करने हेतु)
8. **Save** पर क्लिक करें।
9. इसी प्रकार सभी 15 स्लॉट्स के लिए Cronjobs बना लें।

---

## 4. आपातकालीन रोक (Emergency Kill Switch)

यदि किसी कारणवश (जैसे भारी API त्रुटि या अनपेक्षित सामग्री) आपको सभी स्वचालित पोस्ट्स को तुरंत रोकना पड़े:
- आपको cron-job.org पर जाकर 15 जॉब्स को बंद करने की आवश्यकता **नहीं** है।
- सीधे अपने एडमिन पैनल `/admin` पर जाएं और **"किल स्विच (Kill Switch)"** को **सक्रिय (ON)** कर दें।
- एज फंक्शन किसी भी क्रॉन ट्रिगर को बिना कोई लेख बनाए तुरंत सुरक्षित रूप से `skipped` स्थिति में समाप्त कर देगा।
