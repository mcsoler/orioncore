export type RichSegment = { text: string; href?: string };

const LINK = /\[([^[\]]+)\]\(([^)\s]+)\)/g;

/**
 * Texto del contenido con enlaces internos en formato `[texto](/ruta/)`.
 * Los marcadores pendientes ([Contenido…]) no llevan `(ruta)` y quedan como texto.
 */
export function richText(text: string): RichSegment[] {
  const segments: RichSegment[] = [];
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    if (match.index! > last) segments.push({ text: text.slice(last, match.index) });
    segments.push({ text: match[1]!, href: match[2]! });
    last = match.index! + match[0].length;
  }
  if (last < text.length) segments.push({ text: text.slice(last) });
  return segments;
}

/** Estrellas de una calificación entera: 4 → "★★★★☆". */
export function stars(count: number): string {
  const n = Math.max(0, Math.min(5, Math.round(count)));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}
