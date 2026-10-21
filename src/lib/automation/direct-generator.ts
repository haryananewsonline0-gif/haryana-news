// ==============================================================================
// Direct In-App Autonomous Article Generator (Gemini Flash Engine)
// Used when triggered from Admin Dashboard or local cron environment
// ==============================================================================

import { getServiceSupabase } from '../supabase/server.ts';

interface DirectGenerationResult {
  success: boolean;
  articleId?: string;
  title?: string;
  slug?: string;
  error?: string;
}

const SLOT_PROMPTS: Record<string, { topic: string; category: string }> = {
  mandi_bhav: {
    topic: 'हरियाणा की प्रमुख अनाज मंडियों (सिरसा, हिसार, करनाल, रोहतक) के आज के सरसों, गेहूं, नरमा और धान के ताजा मंडी भाव और किसानों के लिए बाजार समीक्षा।',
    category: 'mandi-bhav',
  },
  weather_districtwise: {
    topic: 'हरियाणा मौसम अपडेट: अंबाला, करनाल, गुरुग्राम, हिसार और रोहतक समेत सभी 22 जिलों में आज और अगले 48 घंटों का मौसम पूर्वानुमान और तापमान।',
    category: 'weather',
  },
  gold_silver: {
    topic: 'हरियाणा में आज सोने और चांदी के ताज़ा भाव: 24 कैरेट और 22 कैरेट गोल्ड रेट और सर्राफा बाजार का ताजा रुझान।',
    category: 'business',
  },
  petrol_diesel_lpg: {
    topic: 'हरियाणा में आज पेट्रोल, डीजल और सीएनजी के ताज़ा दाम: गुरुग्राम, फरीदाबाद, पंचकूला और रोहतक में प्रति लीटर नई दरें।',
    category: 'business',
  },
  cricket_sports: {
    topic: 'हरियाणा खेल जगत व क्रिकेट: हरियाणा के खिलाड़ियों का शानदार प्रदर्शन, कुश्ती, मुक्केबाजी और राष्ट्रीय खेलों की ताज़ा खेल खबरें।',
    category: 'sports',
  },
  morning_lead_politics: {
    topic: 'हरियाणा राजनीति और सरकार की बड़ी घोषणाएं: चंडीगढ़ से विधानसभा व विकास योजनाओं की सबसे ताज़ा राजनीतिक रिपोर्ट।',
    category: 'haryana-top',
  },
  evening_crime_roundup: {
    topic: 'हरियाणा क्राइम बुलेटिन: प्रदेश में कानून व्यवस्था, पुलिस प्रशासन की त्वरित कार्रवाई और सुरक्षा अपडेट।',
    category: 'crime',
  },
  auto_industry_ev: {
    topic: 'हरियाणा ऑटोमोबाइल व उद्योग: गुरुग्राम और मानेसर ऑटो हब से नई गाड़ियां, इलेक्ट्रिक वाहन और मैन्युफैक्चरिंग निवेश।',
    category: 'auto',
  },
  education_jobs: {
    topic: 'हरियाणा रोजगार व शिक्षा समाचार: HSSC, HKRN भर्ती परिणाम, एडमिट कार्ड और कॉलेज व प्रतियोगी परीक्षाओं के अपडेट।',
    category: 'education',
  },
  rural_panchayat_schemes: {
    topic: 'हरियाणा ग्रामीण विकास व पंचायत: ग्रामीण क्षेत्रों में नई सरकारी योजनाएं, सोलर ट्यूबवेल सब्सिडी और किसान कल्याण योजनाएं।',
    category: 'rural',
  },
  panchang_choghadiya: {
    topic: 'आज का पंचांग व शुभ मुहूर्त: तिथि, वार, नक्षत्र, राहुकाल और चौघड़िया मुहूर्त का दैनिक पंचांग।',
    category: 'culture',
  },
  rashifal: {
    topic: 'आज का दैनिक राशिफल: मेष से मीन तक सभी 12 राशियों का आज का भाग्यफल, नौकरी व स्वास्थ्य भविष्यफल।',
    category: 'culture',
  },
  share_market: {
    topic: 'शेयर बाजार और व्यापार जगत: सेंसेक्स, निफ्टी और प्रमुख कॉर्पोरेट कंपनियों का आज का वित्तीय कारोबार।',
    category: 'business',
  },
  today_in_history: {
    topic: 'आज का इतिहास: भारत और हरियाणा के इतिहास में आज के दिन घटी प्रमुख ऐतिहासिक घटनाएं और महान विभूतियां।',
    category: 'culture',
  },
  health_environment: {
    topic: 'हरियाणा पर्यावरण व स्वास्थ्य: वायु गुणवत्ता सूचकांक (AQI), मौसमी बीमारियों से बचाव और स्वास्थ्य परामर्श।',
    category: 'health',
  },
};

function generateSlug(title: string, slotKey: string): string {
  const dateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
  const rand = Math.random().toString(36).substring(2, 6);
  const cleanTitle = title
    .toLowerCase()
    .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 35);
  return `${cleanTitle || slotKey}-${dateStr}-${rand}`;
}

export async function generateArticleLocally(
  slotKey: string,
  runtimeEnv?: Record<string, string | undefined>
): Promise<DirectGenerationResult> {
  const startTime = Date.now();
  const apiKey =
    runtimeEnv?.GEMINI_API_KEY ||
    import.meta.env?.GEMINI_API_KEY ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : '') ||
    '';

  const modelName =
    runtimeEnv?.GEMINI_MODEL ||
    import.meta.env?.GEMINI_MODEL ||
    (typeof process !== 'undefined' ? process.env?.GEMINI_MODEL : '') ||
    'gemini-3.5-flash-lite';

  if (!apiKey) {
    return { success: false, error: 'GEMINI_API_KEY कॉन्फ़िगर नहीं है।' };
  }

  const supabase = getServiceSupabase(runtimeEnv);
  const slotConfig = SLOT_PROMPTS[slotKey] || {
    topic: `हरियाणा के समसामयिक विषय: ${slotKey} पर प्रामाणिक समाचार रिपोर्ट।`,
    category: 'haryana-top',
  };

  try {
    const prompt = `
आप "हरियाणा न्यूज़" (haryananews.online) के वरिष्ठ पत्रकार हैं।
निम्नलिखित विषय पर 100% मौलिक, प्रामाणिक व तथ्यात्मक हिंदी समाचार लेख लिखिए:

विषय: ${slotConfig.topic}

कृपया आउटपुट केवल और केवल मान्य JSON प्रारूप (Valid JSON) में दें:
{
  "title": "आकर्षक, तथ्यात्मक व पत्रकारिता योग्य शीर्षक (50-80 अक्षरों में)",
  "summary": "समाचार का संक्षिप्त 2-पंक्तियों का सार (120-160 अक्षरों में)",
  "body_html": "<p>पहला मुख्य पैराग्राफ...</p><h2>प्रमुख बिंदु व विवरण</h2><ul><li>बिंदु 1</li><li>बिंदु 2</li></ul><p>आगे की जानकारी...</p><h3>निष्कर्ष</h3><p>संपादकीय निष्कर्ष...</p>",
  "tags": ["हरियाणा", "ताजा खबर", "Haryana News"],
  "image_prompt": "A realistic photo of modern news scene in Haryana India, 8k resolution, documentary photography, no text, no watermark"
}
`;

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      throw new Error(`Gemini API त्रुटि (${geminiRes.status}): ${errText}`);
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) throw new Error('AI से कोई उत्तर प्राप्त नहीं हुआ');

    const parsed = JSON.parse(rawText);
    const title = parsed.title?.trim() || `हरियाणा समाचार: ${slotKey}`;
    const summary = parsed.summary?.trim() || title;
    const bodyHtml = parsed.body_html || `<p>${summary}</p>`;
    const tags = Array.isArray(parsed.tags) ? parsed.tags : ['हरियाणा', 'ताज़ा खबर'];
    const imagePrompt = parsed.image_prompt || 'Haryana landscape documentary photography';

    const slug = generateSlug(title, slotKey);

    // High quality royalty-free news thumbnail via Pollinations
    const encodedPrompt = encodeURIComponent(`${imagePrompt}, realistic documentary journalism photography`);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=675&nologo=true`;

    // Insert article into Supabase
    const { data: newArticle, error: insertError } = await supabase
      .from('articles')
      .insert({
        title,
        slug,
        summary,
        body_html: bodyHtml,
        category: slotConfig.category,
        thumbnail_url: imageUrl,
        image_alt: title,
        tags,
        source_name: 'हरियाणा न्यूज़ ब्यूरो',
        source_url: 'https://haryananews.online',
        status: 'published',
        slot_key: slotKey,
        published_at: new Date().toISOString(),
        views: 1,
        seo_title: `${title} | हरियाणा न्यूज़`,
        seo_description: summary.substring(0, 160),
        content_hash: `${slotKey}-${Date.now()}`,
      })
      .select('id, title, slug')
      .single();

    if (insertError) {
      throw new Error(`डेटाबेस इंसर्ट त्रुटि: ${insertError.message}`);
    }

    const durationMs = Date.now() - startTime;

    // Log to generation_logs
    await supabase.from('generation_logs').insert({
      slot: slotKey,
      status: 'success',
      duration_ms: durationMs,
    });

    // Update slots table
    await supabase
      .from('slots')
      .update({ last_run_at: new Date().toISOString() })
      .eq('slot_key', slotKey);

    return {
      success: true,
      articleId: newArticle.id,
      title: newArticle.title,
      slug: newArticle.slug,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'अज्ञात त्रुटि';
    const durationMs = Date.now() - startTime;

    try {
      await supabase.from('generation_logs').insert({
        slot: slotKey,
        status: 'failure',
        error: errorMsg,
        duration_ms: durationMs,
      });
    } catch {
      // Ignore logging failure
    }

    return {
      success: false,
      error: errorMsg,
    };
  }
}
