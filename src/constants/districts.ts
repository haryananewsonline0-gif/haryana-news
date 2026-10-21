// ==============================================================================
// Haryana Districts & Target Regional Coverage Areas
// ==============================================================================

export interface DistrictInfo {
  slug: string;
  nameHi: string;
  nameEn: string;
  isPriorityRegion?: boolean;
}

export const HARYANA_DISTRICTS: DistrictInfo[] = [
  // High-priority regional focus areas (from prompt)
  { slug: 'sirsa', nameHi: 'सिरसा', nameEn: 'Sirsa', isPriorityRegion: true },
  { slug: 'fatehabad', nameHi: 'फतेहाबाद', nameEn: 'Fatehabad', isPriorityRegion: true },
  { slug: 'hisar', nameHi: 'हिसार', nameEn: 'Hisar', isPriorityRegion: true },
  { slug: 'adampur', nameHi: 'आदमपुर', nameEn: 'Adampur', isPriorityRegion: true },
  { slug: 'ellenabad', nameHi: 'ऐलनाबाद', nameEn: 'Ellenabad', isPriorityRegion: true },
  { slug: 'nohar', nameHi: 'नोहर', nameEn: 'Nohar', isPriorityRegion: true },
  { slug: 'bhadra', nameHi: 'भादरा', nameEn: 'Bhadra', isPriorityRegion: true },

  // Remaining major Haryana districts
  { slug: 'jind', nameHi: 'जींद', nameEn: 'Jind' },
  { slug: 'rohtak', nameHi: 'रोहतक', nameEn: 'Rohtak' },
  { slug: 'bhiwani', nameHi: 'भिवानी', nameEn: 'Bhiwani' },
  { slug: 'charkhi-dadri', nameHi: 'चरखी दादरी', nameEn: 'Charkhi Dadri' },
  { slug: 'jhajjar', nameHi: 'झज्जर', nameEn: 'Jhajjar' },
  { slug: 'ambala', nameHi: 'अंबाला', nameEn: 'Ambala' },
  { slug: 'panchkula', nameHi: 'पंचकूला', nameEn: 'Panchkula' },
  { slug: 'yamunanagar', nameHi: 'यमुनानगर', nameEn: 'Yamunanagar' },
  { slug: 'kurukshetra', nameHi: 'कुरुक्षेत्र', nameEn: 'Kurukshetra' },
  { slug: 'kaithal', nameHi: 'कैथल', nameEn: 'Kaithal' },
  { slug: 'karnal', nameHi: 'करनाल', nameEn: 'Karnal' },
  { slug: 'panipat', nameHi: 'पानीपत', nameEn: 'Panipat' },
  { slug: 'sonipat', nameHi: 'सोनीपत', nameEn: 'Sonipat' },
  { slug: 'gurugram', nameHi: 'गुरुग्राम', nameEn: 'Gurugram' },
  { slug: 'faridabad', nameHi: 'फरीदाबाद', nameEn: 'Faridabad' },
  { slug: 'rewari', nameHi: 'रेवाड़ी', nameEn: 'Rewari' },
  { slug: 'mahendragarh', nameHi: 'महेंद्रगढ़', nameEn: 'Mahendragarh' },
  { slug: 'palwal', nameHi: 'पलवल', nameEn: 'Palwal' },
  { slug: 'nuh', nameHi: 'नूह', nameEn: 'Nuh' },
];

export const DISTRICT_MAP = new Map<string, DistrictInfo>(
  HARYANA_DISTRICTS.map((d) => [d.slug, d])
);
