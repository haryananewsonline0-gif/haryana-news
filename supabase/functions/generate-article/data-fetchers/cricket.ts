// ==============================================================================
// Cricket Scores Data Fetcher — CricAPI currentMatches
// Real match scores and sports updates
// ==============================================================================

import type { FetchedSlotData } from '../types.ts';

export async function fetchCricketData(): Promise<FetchedSlotData> {
  const apiKey = Deno.env.get('CRICAPI_KEY');
  let matchData: unknown = null;
  let source = 'CricAPI Live Match Feed';

  if (apiKey) {
    try {
      const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          // Pick the most relevant international or domestic match
          matchData = json.data.slice(0, 3).map((m: Record<string, unknown>) => ({
            name: m.name,
            matchType: m.matchType,
            status: m.status,
            venue: m.venue,
            teams: m.teams,
            score: m.score,
          }));
        }
      }
    } catch (err) {
      console.warn('CricAPI fetch failed, using fallback:', err);
    }
  }

  if (!matchData) {
    source = 'हरियाणा खेल डेस्क (क्रिकेट व राष्ट्रीय खेल बुलेटिन)';
    matchData = {
      highlight: 'भारतीय क्रिकेट टीम व आईपीएल अपडेट',
      notes: 'हरियाणा के खिलाड़ियों का रणजी ट्रॉफी व अंतरराष्ट्रीय स्तर पर प्रदर्शन',
      status: 'हालिया मुकाबलों का विश्लेषण व आगामी मैचों का शेड्यूल',
    };
  }

  return {
    slotKey: 'cricket_sports',
    category: 'sports',
    sourceName: source,
    headlineContext: 'क्रिकेट व खेल जगत की बड़ी खबरें — लाइव स्कोर, मैच परिणाम व हरियाणा के खिलाड़ियों का प्रदर्शन',
    rawNumbersOrFacts: matchData,
    instructionsForGemini: `
Write an engaging Hindi sports news report focusing on cricket and Haryana sports achievements.
If real match scores are provided in rawNumbersOrFacts, use them accurately. Never invent fictitious runs or wickets.
Write in an energetic, journalistic Hindi tone suitable for sports enthusiasts.
`,
  };
}
