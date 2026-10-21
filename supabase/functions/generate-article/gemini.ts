// ==============================================================================
// Google Gemini API Integration — Structured News Generation
// Enforces strict JSON schema output and model validation
// ==============================================================================

import type { FetchedSlotData, GeminiArticleOutput } from './types.ts';

export async function generateArticleWithGemini(
  slotData: FetchedSlotData
): Promise<GeminiArticleOutput> {
  const apiKey = Deno.env.get('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment secret is missing in Supabase Edge Function.');
  }

  // Model name from env, defaults to gemini-3.5-flash-lite
  const modelName = Deno.env.get('GEMINI_MODEL') || 'gemini-3.5-flash-lite';

  const systemInstruction = `
You are a senior, highly respected Hindi news editor writing for 'Haryana News' (haryananews.online).
Your goal is to write a compelling, 100% original, professional news article in standard Hindi (Devanagari script).

CORE EDITORIAL RULES:
1. NUMBERS ARE SACRED: For prices, rates, weather temperatures, and match scores, you MUST USE ONLY the numbers provided in the 'Real Data / Facts' section. NEVER fabricate, alter, or hallucinate figures.
2. ORIGINAL JOURNALISTIC VOICE: Rephrase, synthesize, and explain facts in your own original wording. Never copy sentences verbatim.
3. CITATION: Always seamlessly credit the source ('${slotData.sourceName}').
4. FORMATTING: In 'body_html', use semantic HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>. Do NOT wrap with <html> or <body> tags.
5. IMAGE PROMPT: 'image_prompt' must describe a realistic, high-quality photographic scene relevant to the article. It MUST NOT include any real living persons, logos, watermarks, or fake event depictions.
`;

  const userPrompt = `
SLOT: ${slotData.slotKey}
CATEGORY: ${slotData.category}
DISTRICT CONTEXT: ${slotData.district || 'हरियाणा'}
HEADLINE FOCUS: ${slotData.headlineContext}

REAL DATA / FACTS PROVIDED (USE THESE EXACT FIGURES):
${JSON.stringify(slotData.rawNumbersOrFacts, null, 2)}

SPECIFIC SLOT INSTRUCTIONS:
${slotData.instructionsForGemini}

Generate the article adhering strictly to the JSON schema.
`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
      },
    ],
    generationConfig: {
      temperature: 0.2, // Lower temperature to strictly prevent hallucinations
      responseMimeType: 'application/json',
      responseSchema: {
        type: 'OBJECT',
        properties: {
          title: { type: 'STRING', description: 'Catchy, journalistic Hindi headline in Devanagari' },
          summary: { type: 'STRING', description: '1-2 sentence lead summary in Hindi' },
          body_html: { type: 'STRING', description: 'Complete article body in semantic HTML (h2, p, ul)' },
          tags: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Array of 3-6 relevant Hindi tags' },
          seo_title: { type: 'STRING', description: 'SEO title under 65 chars' },
          seo_description: { type: 'STRING', description: 'Meta description under 155 chars' },
          image_prompt: { type: 'STRING', description: 'Realistic descriptive image prompt in English for thumbnail generation' },
        },
        required: ['title', 'summary', 'body_html', 'tags', 'seo_title', 'seo_description', 'image_prompt'],
      },
    },
  };

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    if (res.status === 404 || errorText.includes('not found') || errorText.includes('is not a valid model')) {
      throw new Error(
        `Gemini Model '${modelName}' is invalid or not available with your API key. Error: ${errorText}. Please update GEMINI_MODEL via 'supabase secrets set GEMINI_MODEL="gemini-2.5-flash"' to fix.`
      );
    }
    throw new Error(`Gemini API Error (Status ${res.status}): ${errorText}`);
  }

  const responseJson = await res.json();
  const rawText = responseJson.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    throw new Error('Gemini API returned an empty response candidate.');
  }

  try {
    const parsed: GeminiArticleOutput = JSON.parse(rawText);
    return parsed;
  } catch (err) {
    throw new Error(`Failed to parse Gemini JSON output: ${err}. Raw text: ${rawText}`);
  }
}
