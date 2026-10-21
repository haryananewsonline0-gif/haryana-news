// ==============================================================================
// ImageKit URL Transformation Helper
// Ensures fast Core Web Vitals, WebP formatting, responsive sizing, and quality
// ==============================================================================

export interface ImageKitOptions {
  width?: number;
  height?: number;
  quality?: number | 'auto';
  format?: 'webp' | 'auto' | 'jpg' | 'png';
  cropMode?: 'pad_resize' | 'maintain_ratio' | 'force';
}

/**
 * Transforms an image URL to optimize delivery via ImageKit.
 * If the image is already on ImageKit, appends or replaces transformation query parameters.
 * If external, falls back to the original URL or proxies if needed.
 */
export function getOptimizedImageUrl(
  originalUrl: string | null | undefined,
  options: ImageKitOptions = {}
): string {
  if (!originalUrl) {
    return '/images/placeholder-news.jpg';
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'webp',
    cropMode,
  } = options;

  // Build transformation params
  const trParts: string[] = [];
  if (width) trParts.push(`w-${width}`);
  if (height) trParts.push(`h-${height}`);
  if (quality) trParts.push(`q-${quality}`);
  if (format) trParts.push(`f-${format}`);
  if (cropMode) trParts.push(`cm-${cropMode}`);

  if (trParts.length === 0) return originalUrl;

  try {
    const url = new URL(originalUrl);
    // If it's an ImageKit URL (contains imagekit.io)
    if (url.hostname.includes('imagekit.io')) {
      url.searchParams.set('tr', trParts.join(','));
      return url.toString();
    }
    return originalUrl;
  } catch {
    // Relative or invalid URL format fallback
    return originalUrl;
  }
}
