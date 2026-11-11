export type RichSegment =
  | { readonly kind: 'text'; readonly text: string }
  | { readonly kind: 'bold'; readonly text: string }
  | { readonly kind: 'highlight'; readonly text: string };

/**
 * Splits "Start with **50** as the ==root==" into plain, bold and
 * highlighted runs. Unclosed markers are kept as plain text.
 */
export function parseRichText(input: string): RichSegment[] {
  const segments: RichSegment[] = [];
  const pattern = /\*\*(.+?)\*\*|==(.+?)==/g;
  let last = 0;
  for (const match of input.matchAll(pattern)) {
    const at = match.index ?? 0;
    if (at > last) segments.push({ kind: 'text', text: input.slice(last, at) });
    if (match[1] !== undefined) segments.push({ kind: 'bold', text: match[1] });
    else segments.push({ kind: 'highlight', text: match[2] });
    last = at + match[0].length;
  }
  if (last < input.length) segments.push({ kind: 'text', text: input.slice(last) });
  return segments;
}

/** The text without markers (for accessible names and search). */
export function plainText(input: string): string {
  return parseRichText(input)
    .map((s) => s.text)
    .join('');
}
