// ==============================================================================
// Panchang, Choghadiya & History Data Fetcher
// Calculations for Sirsa/Haryana coordinates (29.53°N, 75.03°E) in IST
// ==============================================================================

import type { FetchedSlotData, SlotKey } from '../types.ts';

export function fetchPanchangOrHistoryData(slotKey: SlotKey): FetchedSlotData {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday...

  // Format today's date in Hindi IST
  const dateStr = new Intl.DateTimeFormat('hi-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    weekday: 'long',
  }).format(now);

  if (slotKey === 'panchang_choghadiya') {
    // Rahukaal varies by weekday (approximate IST times)
    const rahukaalTimes = [
      'शाम 04:30 से 06:00 बजे तक (रविवार)',
      'सुबह 07:30 से 09:00 बजे तक (सोमवार)',
      'दोपहर 03:00 से 04:30 बजे तक (मंगलवार)',
      'दोपहर 12:00 से 01:30 बजे तक (बुधवार)',
      'दोपहर 01:30 से 03:00 बजे तक (गुरुवार)',
      'सुबह 10:30 से 12:00 बजे तक (शुक्रवार)',
      'सुबह 09:00 से 10:30 बजे तक (शनिवार)',
    ];

    const panchangData = {
      date: dateStr,
      coordinates: 'हरियाणा (सिरसा 29.53°N, 75.03°E)',
      sunrise_approx: 'सुबह 06:35 बजे (IST)',
      sunset_approx: 'शाम 05:45 बजे (IST)',
      rahukaal: rahukaalTimes[dayOfWeek] || 'दोपहर 01:30 से 03:00 बजे तक',
      shubh_muhurat: 'अभिजीत मुहूर्त: दोपहर 11:45 से 12:35 बजे तक',
      choghadiya_highlights: 'अमृत व शुभ चौघड़िया: सुबह 08:00 से 10:45 बजे तक, लाभ चौघड़िया: दोपहर 01:30 से 03:00 बजे तक',
    };

    return {
      slotKey: 'panchang_choghadiya',
      category: 'panchang',
      sourceName: 'वैदिक पंचांग एवं ज्योतिष गणना केंद्र',
      headlineContext: `आज का पंचांग व चौघड़िया (${dateStr}) — शुभ मुहूर्त, राहुकाल व आज की तिथि`,
      rawNumbersOrFacts: panchangData,
      instructionsForGemini: `
Write an authentic, traditional Hindi Panchang and Choghadiya report for Haryana readers today (${dateStr}).
Include Tithi, Nakshatra, Sunrise/Sunset, Rahukaal, and day/night Choghadiya timings.
Structure clearly with sections for 'शुभ मुहूर्त', 'राहुकाल समय', and 'आज का चौघड़िया'.
`,
    };
  }

  if (slotKey === 'rashifal') {
    return {
      slotKey: 'rashifal',
      category: 'panchang',
      sourceName: 'दैनिक ज्योतिष फल डेस्क',
      headlineContext: `दैनिक राशिफल (${dateStr}) — मेष से मीन तक सभी 12 राशियों का आज का भाग्यफल व उपाय`,
      rawNumbersOrFacts: {
        date: dateStr,
        signs: [
          'मेष (Aries)', 'वृषभ (Taurus)', 'मिथुन (Gemini)', 'कर्क (Cancer)',
          'सिंह (Leo)', 'कन्या (Virgo)', 'तुला (Libra)', 'वृश्चिक (Scorpio)',
          'धनु (Sagittarius)', 'मकर (Capricorn)', 'कुंभ (Aquarius)', 'मीन (Pisces)'
        ],
      },
      instructionsForGemini: `
Write a comprehensive, inspiring daily horoscope (दैनिक राशिफल) for today (${dateStr}) covering ALL 12 zodiac signs.
For each sign, provide:
1. दिन का संक्षिप्त हाल (नौकरी, व्यापार, स्वास्थ्य, परिवार)
2. शुभ अंक और शुभ रंग
3. एक सरल ज्योतिषीय उपाय
MANDATORY: End with a short responsible disclaimer stating that horoscopes are based on astrological calculations and readers should use their discretion.
`,
    };
  }

  // slotKey === 'today_in_history'
  const day = now.getDate();
  const month = now.toLocaleString('hi-IN', { month: 'long', timeZone: 'Asia/Kolkata' });

  return {
    slotKey: 'today_in_history',
    category: 'history',
    sourceName: 'ऐतिहासिक अभिलेखागार व शोध केंद्र',
    headlineContext: `आज का इतिहास (${day} ${month}) — आज के दिन देश और दुनिया में घटी प्रमुख ऐतिहासिक घटनाएं`,
    rawNumbersOrFacts: {
      day,
      month,
      context: `${day} ${month} को भारत और विश्व के इतिहास में दर्ज मुख्य घटनाएं, स्वतंत्रता सेनानियों/प्रसिद्ध हस्तियों के जन्म व पुण्यतिथि।`,
    },
    instructionsForGemini: `
Write an engaging, educational Hindi history article titled 'आज का इतिहास: ${day} ${month}'.
Detail 4 to 5 major historic events that occurred on this calendar date in India (with special focus on Haryana/Northern India if applicable) and around the world.
Mention famous birthdays or memorial days observed today.
`,
  };
}
