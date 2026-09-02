import sanitize from 'sanitize-html';
import 'server-only';

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'a',
  'blockquote',
];

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: { a: ['href', 'target', 'rel'] },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Drop the contents too, not just the tag — otherwise the body of a
    // `<script>` survives as visible text.
    nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript'],
    transformTags: {
      a: sanitize.simpleTransform('a', {
        target: '_blank',
        rel: 'noopener noreferrer',
      }),
    },
  });
}
