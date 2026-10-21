// ==============================================================================
// Thumbnail Generator & ImageKit Uploader
// Pollinations.ai (1200x630) -> ImageKit /haryana-news/ with branded card fallback
// ==============================================================================

/**
 * Uploads a binary buffer or base64 data to ImageKit in /haryana-news/
 */
async function uploadToImageKit(
  fileContent: Uint8Array | string,
  fileName: string
): Promise<string> {
  const privateKey = Deno.env.get('IMAGEKIT_PRIVATE_KEY');
  const endpoint = Deno.env.get('IMAGEKIT_URL_ENDPOINT');

  if (!privateKey) {
    console.warn('IMAGEKIT_PRIVATE_KEY is missing. Using direct placeholder.');
    return '/images/placeholder-news.jpg';
  }

  // Convert binary to base64 if needed
  let base64String: string;
  if (typeof fileContent === 'string') {
    base64String = fileContent;
  } else {
    base64String = btoa(String.fromCharCode(...fileContent));
  }

  const formData = new FormData();
  formData.append('file', base64String);
  formData.append('fileName', fileName);
  formData.append('folder', '/haryana-news/');
  formData.append('useUniqueFileName', 'true');

  const authHeader = `Basic ${btoa(privateKey + ':')}`;

  const res = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: { Authorization: authHeader },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`ImageKit Upload failed (${res.status}): ${errorText}`);
  }

  const json = await res.json();
  return json.url || `${endpoint}/haryana-news/${fileName}`;
}

/**
 * Generates a branded template card SVG (Headline on saffron/green gradient)
 */
function generateBrandedCardSvg(headline: string, category: string): string {
  // Break headline into 2-3 lines for clean SVG rendering
  const words = headline.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length > 32) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word;
    } else {
      currentLine += ' ' + word;
    }
    if (lines.length >= 3) break;
  }
  if (currentLine && lines.length < 3) lines.push(currentLine.trim());

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF9933" />
        <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.1" />
        <stop offset="100%" stop-color="#138808" />
      </linearGradient>
      <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#000000" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0.85" />
      </linearGradient>
    </defs>
    
    <!-- Background Gradient -->
    <rect width="1200" height="630" fill="url(#brandGrad)" />
    <rect width="1200" height="630" fill="url(#overlay)" />

    <!-- Decorative Top & Bottom Borders -->
    <rect x="0" y="0" width="1200" height="12" fill="#FF9933" />
    <rect x="0" y="618" width="1200" height="12" fill="#138808" />

    <!-- Brand Header -->
    <g transform="translate(80, 80)">
      <rect width="50" height="50" rx="10" fill="#FF9933" />
      <text x="25" y="36" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-weight="900" font-size="28" fill="#FFFFFF" text-anchor="middle">ह</text>
      <text x="70" y="32" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-weight="800" font-size="28" fill="#FFFFFF">हरियाणा <tspan fill="#138808">न्यूज़</tspan></text>
      <text x="70" y="52" font-family="Arial, sans-serif" font-size="12" fill="#D1D5DB" letter-spacing="2">HARYANANEWS.ONLINE</text>
    </g>

    <!-- Category Pill -->
    <g transform="translate(80, 180)">
      <rect width="140" height="36" rx="8" fill="#FF9933" />
      <text x="70" y="24" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-weight="700" font-size="16" fill="#FFFFFF" text-anchor="middle">${category.toUpperCase()}</text>
    </g>

    <!-- Headline Lines -->
    <g transform="translate(80, 280)">
      ${lines
        .map(
          (line, idx) =>
            `<text x="0" y="${idx * 68}" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-weight="800" font-size="46" fill="#FFFFFF" letter-spacing="-0.5">${line}</text>`
        )
        .join('')}
    </g>

    <!-- Footer Notice -->
    <g transform="translate(80, 560)">
      <text x="0" y="0" font-family="'Noto Sans Devanagari', Arial, sans-serif" font-size="16" fill="#9CA3AF">प्रामाणिक व निष्पक्ष समाचार • haryananews.online</text>
    </g>
  </svg>`;

  return svg;
}

/**
 * Main thumbnail pipeline: Pollinations.ai -> ImageKit -> Fallback to Branded Card
 */
export async function generateAndUploadThumbnail(
  imagePrompt: string,
  headline: string,
  category: string,
  slug: string
): Promise<string> {
  const seed = Math.floor(Math.random() * 1000000);
  const cleanPrompt = `${imagePrompt}, ultra realistic photography, 8k resolution, award winning photojournalism, cinematic lighting, 16:9 aspect ratio, no text, no logos`;
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1200&height=630&nologo=true&seed=${seed}`;

  try {
    // 1. Attempt Pollinations fetch with 10s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(pollinationsUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const buffer = new Uint8Array(await res.arrayBuffer());
      if (buffer.length > 5000) {
        const uploadedUrl = await uploadToImageKit(buffer, `${slug}.jpg`);
        return uploadedUrl;
      }
    }
  } catch (err) {
    console.warn(`Pollinations image fetch failed or timed out: ${err}. Triggering branded card fallback.`);
  }

  // 2. Fallback: Generate branded template card SVG and upload to ImageKit
  try {
    const svgCard = generateBrandedCardSvg(headline, category);
    const svgEncoder = new TextEncoder();
    const svgBuffer = svgEncoder.encode(svgCard);
    const uploadedCardUrl = await uploadToImageKit(svgBuffer, `${slug}-card.svg`);
    return uploadedCardUrl;
  } catch (cardErr) {
    console.error('Failed to upload branded fallback card to ImageKit:', cardErr);
    return '/images/placeholder-news.jpg';
  }
}
