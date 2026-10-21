// ==============================================================================
// Admin Hinglish AI Assistant API (Gemini Proxy)
// Endpoint: POST /api/admin/ai-chat
// ==============================================================================

import type { APIRoute } from 'astro';
import { verifyAdminSession } from '@/lib/auth/session';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const runtimeEnv = locals?.runtime?.env;
  const session = await verifyAdminSession(cookies, runtimeEnv);

  if (!session.isAuthenticated || !session.isAdmin || !session.isMfaVerified) {
    return new Response(JSON.stringify({ success: false, error: 'अनधिकृत अनुरोध' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = runtimeEnv?.GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'GEMINI_API_KEY कॉन्फ़िगर नहीं है। कृपया पर्यावरण चर (Environment variable) सेट करें।',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const modelName = runtimeEnv?.GEMINI_MODEL || import.meta.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  try {
    const body = await request.json();
    const userPrompt = (body.prompt || '').trim();
    const taskType = body.task || 'general';

    if (!userPrompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'प्रॉम्प्ट खाली नहीं हो सकता।' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemInstruction = `
आप "हरियाणा न्यूज़ AI पत्रकार" हैं - haryananews.online के वरिष्ठ डिजिटल संपादक।
आप हिंदी, अंग्रेजी और हिंग्लिश (Hinglish) में पत्रकारों से बात कर सकते हैं।
आपकी भूमिका:
1. पत्रकारों के लिए आकर्षक, प्रामाणिक व क्लिक-योग्य (click-worthy without clickbait) हिंदी सुर्खियां (Headlines) बनाना।
2. कच्चे नोट्स (raw notes / press releases) को 100% मौलिक, प्रवाहमयी हिंदी समाचार लेख में बदलना।
3. सर्च इंजन ऑप्टिमाइजेशन (SEO Meta Description, Focus Keywords, Tags) लिखना।
4. व्हाट्सएप और सोशल मीडिया के लिए त्वरित समाचार बुलेटिन तैयार करना।
5. हरियाणा के सभी 22 जिलों, स्थानीय संस्कृति और बोली की सूक्ष्म समझ के साथ तथ्यपरक लिखना।

नियम:
- मनगढ़ंत आंकड़े (भाव, स्कोर, तारीखें) कभी न बनाएं।
- उत्तर स्पष्ट, सुंदर मार्कडाउन (Markdown) स्वरूप में दें।
- यदि पत्रकार हिंग्लिश में पूछे, तो मित्रवत हिंग्लिश और शुद्ध हिंदी का संतुलन रखें।
`;

    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Prepend system instruction
    contents.push({
      role: 'user',
      parts: [{ text: `${systemInstruction}\n\n[उपयोगकर्ता का अनुरोध / कार्य: ${taskType}]\n${userPrompt}` }],
    });

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemini API error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'कोई उत्तर प्राप्त नहीं हुआ।';

    return new Response(
      JSON.stringify({ success: true, reply }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'आंतरिक त्रुटि';
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
