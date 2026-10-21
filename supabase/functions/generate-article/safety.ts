// ==============================================================================
// Sensitive Content Editorial Safety Filter
// Detects crime, death, communal conflict, and defamatory political accusations
// Holds sensitive topics in 'draft' status for human editorial review
// ==============================================================================

export interface SafetyCheckResult {
  isSensitive: boolean;
  status: 'published' | 'draft';
  reason?: string;
  matchedTerms?: string[];
}

// Regex patterns for sensitive journalistic topics
const SENSITIVE_PATTERNS = [
  // 1. Deaths & Fatal Incidents
  /\b(हत्या|मर्डर|आत्महत्या|लाश|मृतक|मौत|सड़क हादसे में मौत|जिंदा जलाया)\b/i,

  // 2. Severe Crime & Sexual Assault
  /\b(दुष्कर्म|बलात्कार|गैंगरेप|छेड़छाड़|अपहरण|फिरौती|गिरफ्तार आरोपी|हिरासत में आरोपी)\b/i,

  // 3. Communal / Caste Conflict
  /\b(सांप्रदायिक|दंगा|धार्मिक विवाद|जातिगत हिंसा|पथराव|तनावपूर्ण स्थिति|धार्मिक भावना)\b/i,

  // 4. Severe Political Accusations & Scams
  /\b(घोटाला|रिश्वत लेते गिरफ्तार|भ्रष्टाचार का आरोप|सीबीआई छापा|ईडी की रेड|गबन का आरोप)\b/i,
];

export function evaluateEditorialSafety(
  title: string,
  summary: string,
  bodyHtml: string
): SafetyCheckResult {
  const combinedText = `${title} ${summary} ${bodyHtml}`;
  const matchedTerms: string[] = [];

  for (const pattern of SENSITIVE_PATTERNS) {
    const match = combinedText.match(pattern);
    if (match) {
      matchedTerms.push(match[0]);
    }
  }

  if (matchedTerms.length > 0) {
    return {
      isSensitive: true,
      status: 'draft',
      reason: `Sensitive editorial topic detected containing sensitive keywords: [${matchedTerms.join(', ')}]. Held as draft for manual review.`,
      matchedTerms,
    };
  }

  return {
    isSensitive: false,
    status: 'published',
  };
}
