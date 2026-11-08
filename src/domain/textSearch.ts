/** Case-insensitive plain-text search used by the document viewer. */

export interface TextSegment {
  readonly text: string;
  readonly match: boolean;
}

/** Normalises a query; returns null when there is nothing to search for. */
export function normaliseQuery(query: string): string | null {
  const trimmed = query.trim().replace(/\s+/g, ' ');
  return trimmed.length === 0 ? null : trimmed.toLocaleLowerCase();
}

/** Splits text into matching and non-matching segments. */
export function splitMatches(text: string, query: string): TextSegment[] {
  const needle = normaliseQuery(query);
  if (!needle) return [{ text, match: false }];
  const haystack = text.toLocaleLowerCase();
  const segments: TextSegment[] = [];
  let cursor = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    if (index > cursor) segments.push({ text: text.slice(cursor, index), match: false });
    segments.push({ text: text.slice(index, index + needle.length), match: true });
    cursor = index + needle.length;
    index = haystack.indexOf(needle, cursor);
  }
  if (cursor < text.length) segments.push({ text: text.slice(cursor), match: false });
  return segments;
}

export function countMatches(texts: readonly string[], query: string): number {
  if (!normaliseQuery(query)) return 0;
  return texts.reduce(
    (total, text) => total + splitMatches(text, query).filter((s) => s.match).length,
    0,
  );
}

/**
 * Keeps reference codes such as "SB-07" or "NA-07" on one line in narrow
 * table columns: the hyphen after capitals and before a digit becomes a
 * non-breaking hyphen. One character for one, so search offsets still hold.
 */
export function keepCodesTogether(text: string): string {
  return text.replace(/(?<=\b[A-Z]{1,4})-(?=\d)/g, '\u2011');
}
