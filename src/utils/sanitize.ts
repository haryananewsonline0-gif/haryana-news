// ==============================================================================
// Safe HTML Sanitization for AI-Generated Article Content
// ==============================================================================

import sanitizeHtml from 'sanitize-html';

export function sanitizeArticleHtml(rawHtml: string): string {
  if (!rawHtml) return '';

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      'h2',
      'h3',
      'h4',
      'p',
      'blockquote',
      'ul',
      'ol',
      'li',
      'b',
      'i',
      'strong',
      'em',
      'strike',
      'code',
      'hr',
      'br',
      'a',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'figure',
      'figcaption',
    ],
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      th: ['colspan', 'rowspan', 'align'],
      td: ['colspan', 'rowspan', 'align'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer nofollow',
      }),
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}
