/**
 * Utility to convert WhatsApp share copy to Unicode Stylized Sans-Serif fonts
 * Eliminates markdown formatting symbols (*, _, `, ~, ') and uses native Unicode styling.
 */

export function cleanSymbols(text: string): string {
  if (!text) return '';
  return text
    .replace(/[*_~`]/g, '')
    .replace(/^['"]|['"]$/g, '')
    .trim();
}

export function toUnicodeBold(str: string): string {
  if (!str) return '';
  return str.replace(/[A-Za-z0-9]/g, ch => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D5D4 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D5EE + (code - 97));
    if (code >= 48 && code <= 57) return String.fromCodePoint(0x1D7EC + (code - 48));
    return ch;
  });
}

export function toUnicodeItalic(str: string): string {
  if (!str) return '';
  return str.replace(/[A-Za-z]/g, ch => {
    const code = ch.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCodePoint(0x1D608 + (code - 65));
    if (code >= 97 && code <= 122) return String.fromCodePoint(0x1D622 + (code - 97));
    return ch;
  });
}

export function formatWhatsAppPost(options: {
  title: string;
  summary: string;
  category?: string;
  readTime?: string;
  articleUrl: string;
  customMessage?: string;
}): string {
  if (options.customMessage && options.customMessage.trim()) {
    return cleanSymbols(options.customMessage);
  }

  const cleanTitle = cleanSymbols(options.title);
  const cleanSummary = cleanSymbols(options.summary);

  const readMoreLabel = `🔗 ${toUnicodeBold('Read Full Story:')}`;
  const footer = `${toUnicodeItalic('Curated with precision by')} myfeedlk.com ${toUnicodeItalic('Sri Lanka')}`;

  return `${cleanTitle}

${cleanSummary}

${readMoreLabel}
${options.articleUrl}

${footer}`;
}

export const formatSharePost = formatWhatsAppPost;
