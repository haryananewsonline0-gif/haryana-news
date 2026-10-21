-- ==============================================================================
-- Migration: 20261021000002_seed_data.sql
-- Project: Haryana News (haryananews.online)
-- Description: Initial seed data for categories, slots timetable, settings, and fallback rates
-- ==============================================================================

-- 1. SEED DEFAULT SYSTEM SETTINGS
INSERT INTO public.settings (id, kill_switch, whatsapp_enabled, updated_at)
VALUES (1, false, true, now())
ON CONFLICT (id) DO UPDATE 
SET kill_switch = EXCLUDED.kill_switch,
    whatsapp_enabled = EXCLUDED.whatsapp_enabled;

-- 2. SEED CORE NEWS CATEGORIES
INSERT INTO public.categories (slug, name, description, order_index, is_active)
VALUES
    ('haryana', 'हरियाणा', 'हरियाणा राज्य की सभी ताज़ा व मुख्य खबरें', 1, true),
    ('regional', 'क्षेत्रीय', 'सिरसा, फतेहाबाद, हिसar, आदमपुर, ऐलनाबाद, नोहर व आसपास की खबरें', 2, true),
    ('mandi-bhav', 'मंडी भाव', 'हरियाणा व सीमावर्ती मंडियों के ताज़ा भाव (नरमा, ग्वार, सरसों, गेहूं)', 3, true),
    ('weather', 'मौसम', 'जिलावार मौसम पूर्वानुमान व बारिश का अलर्ट', 4, true),
    ('panchang', 'पंचांग व राशिफल', 'दैनिक राशिफल, शुभ मुहूर्त, चौघड़िया व राहुकाल', 5, true),
    ('govt-schemes', 'सरकारी योजनाएं', 'हरियाणा व केंद्र सरकार की जन कल्याणकारी योजनाएं', 6, true),
    ('govt-jobs', 'सरकारी नौकरी', 'HSSC, हरियाणा पुलिस, रिजल्ट, एडमिट कार्ड व भर्तियां', 7, true),
    ('sports', 'खेल कूद', 'क्रिकेट स्कोर, हरियाणा के खिलाड़ी व खेल समाचार', 8, true),
    ('business', 'बिजनेस व बाजार', 'सोना-चांदी भाव, पेट्रोल-डीजल रेट व शेयर बाजार अपडेट', 9, true),
    ('history', 'आज का इतिहास', 'इतिहास के पन्नों से आज के दिन की प्रमुख घटनाएं', 10, true),
    ('technology', 'टेक व ऑटो', 'रेलवे, रोडवेज, तकनीक व ऑटोमोबाइल से जुड़ी खबरें', 11, true),
    ('top-news', 'टॉप 10', 'दिनभर की 10 बड़ी और जरूरी खबरें', 12, true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    order_index = EXCLUDED.order_index;

-- 3. SEED 15 AUTOMATED PUBLISHING SLOTS (Exact IST Timetable from Prompt)
INSERT INTO public.slots (slot_key, name, schedule_ist, description, is_active)
VALUES
    ('rashifal', 'दैनिक राशिफल (सभी 12 राशियां)', '05:00', 'सभी 12 राशियों का दैनिक राशिफल व उपाय', true),
    ('panchang_choghadiya', 'आज का पंचांग व चौघड़िया', '05:20', 'तिथि, नक्षत्र, शुभ मुहूर्त, चौघड़िया व राहुकाल', true),
    ('weather_districtwise', 'हरियाणा जिलावार मौसम', '05:40', 'Open-Meteo आधारित हरियाणा के प्रमुख जिलों का मौसम', true),
    ('today_in_history', 'आज का इतिहास', '06:00', 'आज की तारीख में घटी देश-विदेश की ऐतिहासिक घटनाएं', true),
    ('gold_silver', 'सोना चांदी के भाव', '06:20', 'हरियाणा में 22K व 24K सोने और चांदी के ताज़ा दाम', true),
    ('petrol_diesel_lpg', 'पेट्रोल, डीजल व एलपीजी दाम', '06:40', 'हरियाणा के प्रमुख शहरों में ईंधन व गैस सिलेंडर के रेट', true),
    ('share_market', 'शेयर बाजार ओपनिंग संकेत', '07:00', 'सेंसेक्स, निफ्टी व प्रमुख स्टॉक्स के संकेत', true),
    ('govt_schemes', 'सरकारी योजनाएं', '10:00', 'हरियाणा सरकार व केंद्र की नई योजनाएं, आवेदन प्रक्रिया', true),
    ('govt_jobs', 'सरकारी नौकरी व परिणाम', '12:00', 'HSSC, पुलिस भर्ती, एडमिट कार्ड, परीक्षा तारीखें', true),
    ('train_bus_tech', 'रेलवे, रोडवेज व टेक', '15:00', 'ट्रेनों के समय में बदलाव, हरियाणा रोडवेज व टेक अपडेट', true),
    ('mandi_bhav', 'हरियाणा मंडी भाव', '17:00', 'सिरसा, आदमपुर, ऐलनाबाद, नोहर, फतेहाबाद मंडियों के शाम के भाव', true),
    ('cricket_sports', 'क्रिकेट व खेल समाचार', '18:30', 'लाइव मैच स्कोर, आईपीएल/टीम इंडिया व हरियाणा के खिलाड़ी', true),
    ('top10_news', 'आज की 10 बड़ी खबरें', '21:00', 'दिनभर की सबसे महत्वपूर्ण 10 खबरों का संक्षिप्त बुलेटिन', true),
    ('google_trends_india', 'गूगल ट्रेंड्स वायरल न्यूज', 'hourly', 'भारत व हरियाणा में सबसे ज्यादा सर्च किए जाने वाले ट्रेंडिंग विषय', true),
    ('regional_coverage', 'क्षेत्रीय समाचार कवरेज', 'every_2_hours', 'सिरसा, आदमपुर, ऐलनाबाद, नोहर, भादरा, फतेहाबाद, हिसार लोकल कवरेज', true)
ON CONFLICT (slot_key) DO UPDATE
SET name = EXCLUDED.name,
    schedule_ist = EXCLUDED.schedule_ist,
    description = EXCLUDED.description;

-- 4. SEED MANUAL FALLBACK DATA (For Rates and Market Data)
INSERT INTO public.manual_data (key, value, updated_at)
VALUES
    ('gold_silver', '{"gold_24k_10g": 89500, "gold_22k_10g": 82050, "silver_1kg": 101000, "unit": "INR", "city": "Hisar/Haryana"}'::JSONB, now()),
    ('fuel_rates', '{"petrol_per_litre": 95.34, "diesel_per_litre": 88.19, "lpg_cylinder_14kg": 803.00, "city": "Sirsa/Haryana"}'::JSONB, now()),
    ('share_market', '{"nifty_50": 24200.50, "sensex": 79800.25, "market_status": "Neutral", "key_indices": "Bank Nifty 51500"}'::JSONB, now()),
    ('mandi_fallback', '{"sirsa": {"narma": 7200, "wheat": 2450, "mustard": 5600, "guar": 5100}, "adampur": {"narma": 7250, "mustard": 5650, "guar": 5120}}'::JSONB, now())
ON CONFLICT (key) DO NOTHING;
