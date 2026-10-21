// ==============================================================================
// Weather Data Fetcher — Open-Meteo API (Free, No Key Required)
// Fetches real atmospheric data for Haryana districts
// ==============================================================================

import type { FetchedSlotData } from '../types.ts';

interface DistrictCoord {
  nameHi: string;
  lat: number;
  lon: number;
}

const DISTRICT_COORDS: Record<string, DistrictCoord> = {
  sirsa: { nameHi: 'सिरसा', lat: 29.53, lon: 75.03 },
  hisar: { nameHi: 'हिसार', lat: 29.15, lon: 75.72 },
  fatehabad: { nameHi: 'फतेहाबाद', lat: 29.51, lon: 75.45 },
  adampur: { nameHi: 'आदमपुर', lat: 29.28, lon: 75.46 },
  ellenabad: { nameHi: 'ऐलनाबाद', lat: 29.45, lon: 74.65 },
  nohar: { nameHi: 'नोहर', lat: 29.18, lon: 74.77 },
  bhadra: { nameHi: 'भादरा', lat: 29.11, lon: 75.17 },
};

function getWeatherDescription(code: number): string {
  if (code === 0) return 'साफ़ और धूप';
  if (code === 1 || code === 2) return 'आंशिक रूप से बादल';
  if (code === 3) return 'घने बादल';
  if (code >= 45 && code <= 48) return 'धुंध और कोहरा';
  if (code >= 51 && code <= 55) return 'हल्की बूंदाबांदी';
  if (code >= 61 && code <= 65) return 'बारिश';
  if (code >= 80 && code <= 82) return 'तेज बौछारें';
  if (code >= 95) return 'गरज के साथ बारिश';
  return 'सामान्य मौसम';
}

export async function fetchWeatherData(): Promise<FetchedSlotData> {
  const districtReports: Record<string, { temp: number; feelsLike: number; humidity: number; condition: string; wind: number }> = {};

  for (const info of Object.values(DISTRICT_COORDS)) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${info.lat}&longitude=${info.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=Asia%2FKolkata`;
      const res = await fetch(url, { headers: { 'User-Agent': 'HaryanaNews/1.0' } });

      if (res.ok) {
        const data = await res.json();
        const current = data.current;
        districtReports[info.nameHi] = {
          temp: current.temperature_2m,
          feelsLike: current.apparent_temperature,
          humidity: current.relative_humidity_2m,
          condition: getWeatherDescription(current.weather_code),
          wind: current.wind_speed_10m,
        };
      }
    } catch (err) {
      console.warn(`Failed to fetch weather for ${info.nameHi}:`, err);
    }
  }

  return {
    slotKey: 'weather_districtwise',
    category: 'weather',
    sourceName: 'Open-Meteo मौसम विज्ञान केंद्र',
    sourceUrl: 'https://open-meteo.com',
    headlineContext: 'हरियाणा जिलावार मौसम पूर्वानुमान — सिरसा, हिसार, फतेहाबाद, आदमपुर, ऐलनाबाद तापमान व बारिश अलर्ट',
    rawNumbersOrFacts: districtReports,
    instructionsForGemini: `
Write an informative, conversational Hindi weather report for Haryana based strictly on the provided real temperature and weather condition figures.
DO NOT invent any temperature numbers or weather conditions. Use ONLY the figures given in rawNumbersOrFacts.
Include advice for farmers regarding crops and irrigation based on the weather conditions.
Structure the article with H2 subheadings for different districts.
`,
  };
}
