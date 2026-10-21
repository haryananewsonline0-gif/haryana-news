// ==============================================================================
// RSS & News Topics Data Fetcher
// Fetches news feeds for Govt schemes, Jobs, Tech, Top 10, Trends & Regional
// ==============================================================================

import type { FetchedSlotData, SlotKey } from '../types.ts';

const RSS_ENDPOINTS: Record<string, { url: string; fallbackSource: string }> = {
  govt_schemes: {
    url: 'https://news.google.com/rss/search?q=Haryana+Government+Scheme+Hindi&hl=hi&gl=IN&ceid=IN:hi',
    fallbackSource: 'हरियाणा सूचना एवं जनसंपर्क विभाग (DPR Haryana)',
  },
  govt_jobs: {
    url: 'https://news.google.com/rss/search?q=HSSC+Haryana+Police+CET+Vacancy+Hindi&hl=hi&gl=IN&ceid=IN:hi',
    fallbackSource: 'हरियाणा कर्मचारी चयन आयोग (HSSC) आधिकारिक अपडेट',
  },
  train_bus_tech: {
    url: 'https://news.google.com/rss/search?q=Haryana+Roadways+Railway+Tech+Hindi&hl=hi&gl=IN&ceid=IN:hi',
    fallbackSource: 'उत्तर रेलवे व हरियाणा राज्य परिवहन',
  },
  top10_news: {
    url: 'https://news.google.com/rss/topics/CAAqIQgKIhtDQkFTRGdvSUwyMHZNRE55YXpBU0FtVnVLQUFQAQ?hl=hi&gl=IN&ceid=IN:hi',
    fallbackSource: 'हरियाणा न्यूज़ डेस्क राष्ट्रीय व राज्य बुलेटिन',
  },
  google_trends_india: {
    url: 'https://trends.google.com/trending/rss?geo=IN',
    fallbackSource: 'गूगल ट्रेंड्स भारत (Google Trends India)',
  },
  regional_coverage: {
    url: 'https://news.google.com/rss/search?q=Sirsa+Fatehabad+Hisar+Hindi&hl=hi&gl=IN&ceid=IN:hi',
    fallbackSource: 'हरियाणा क्षेत्रीय संवाद सूत्र (सिरसा, आदमपुर, नोहर, हिसार)',
  },
};

export async function fetchNewsTopicData(slotKey: SlotKey): Promise<FetchedSlotData> {
  const config = RSS_ENDPOINTS[slotKey] || RSS_ENDPOINTS.regional_coverage;
  let items: Array<{ title: string; link: string; snippet?: string }> = [];
  let sourceName = config.fallbackSource;
  let sourceUrl = config.url;

  try {
    const res = await fetch(config.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; HaryanaNewsBot/1.0; +https://haryananews.online)',
      },
    });

    if (res.ok) {
      const xmlText = await res.text();
      // Extract <item> tags simply without heavy XML parser in Deno
      const itemMatches = xmlText.match(/<item>([\s\S]*?)<\/item>/g);
      if (itemMatches && itemMatches.length > 0) {
        items = itemMatches.slice(0, 5).map((block) => {
          const titleMatch = block.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || block.match(/<title>(.*?)<\/title>/);
          const linkMatch = block.match(/<link>(.*?)<\/link>/);
          return {
            title: titleMatch ? titleMatch[1].trim() : '',
            link: linkMatch ? linkMatch[1].trim() : '',
          };
        }).filter((item) => item.title.length > 5);
      }
    }
  } catch (err) {
    console.warn(`RSS fetch failed for [${slotKey}], using topic template:`, err);
  }

  // Determine Category and District
  let category = 'haryana';
  let district: string | undefined = undefined;

  if (slotKey === 'govt_schemes') category = 'govt-schemes';
  else if (slotKey === 'govt_jobs') category = 'govt-jobs';
  else if (slotKey === 'train_bus_tech') category = 'technology';
  else if (slotKey === 'top10_news') category = 'top-news';
  else if (slotKey === 'regional_coverage') {
    category = 'regional';
    district = 'सिरसा';
  }

  const headlineContext = `हरियाणा समाचार बुलेटिन — ${slotKey.replace(/_/g, ' ')}`;

  return {
    slotKey,
    category,
    district,
    sourceName,
    sourceUrl,
    headlineContext,
    rawNumbersOrFacts: {
      topicItems: items.length > 0 ? items : [
        { title: 'हरियाणा विकास कार्य, जन कल्याणकारी घोषणाएं व स्थानीय समाचार', link: 'https://haryananews.online' }
      ],
    },
    instructionsForGemini: `
Write a completely original, neutral journalistic Hindi news article based on the facts and topics provided in rawNumbersOrFacts.
CRITICAL MANDATORY RULES:
1. Do NOT copy sentences verbatim from sources; summarize and rephrase into original, fresh Hindi reporting.
2. Maintain neutral, journalistic reporting in Devanagari script.
3. If source links/names are provided, seamlessly cite them in the text.
4. Structure the article with clear H2/H3 subheadings and bullet points.
`,
  };
}
