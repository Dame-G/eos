/** Text with no character outside ASCII has no accents to remove, so lower case is the whole fold. */
const ascii = (text: string) => /^[\x00-\x7f]*$/.test(text);

/** Lower case with accents removed, so "cafe" finds "Café" and "ZURICH" finds "Zürich". */
export function fold(text: string): string {
  if (ascii(text)) return text.toLowerCase();
  return text
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase();
}

/**
 * Where `query` first occurs in `text`, ignoring case and accents, as `[start, end)` in the original string.
 * `null` when it does not occur or the query is empty.
 */
export function foldedRange(text: string, query: string): [number, number] | null {
  const q = fold(query);
  if (!q) return null;
  if (ascii(text)) {
    const at = text.toLowerCase().indexOf(q);
    return at < 0 ? null : [at, at + q.length];
  }
  let folded = "";
  const starts: number[] = [];
  const ends: number[] = [];
  let i = 0;
  for (const ch of text) {
    const f = ch.charCodeAt(0) < 0x80 ? ch.toLowerCase() : fold(ch);
    for (let k = 0; k < f.length; k++) {
      starts.push(i);
      ends.push(i + ch.length);
    }
    folded += f;
    i += ch.length;
  }
  const at = folded.indexOf(q);
  if (at < 0) return null;
  // Take any accent that follows the last letter, so a decomposed "é" is marked whole.
  let end = ends[at + q.length - 1]!;
  while (end < text.length && /^\p{M}/u.test(text.slice(end))) end++;
  return [starts[at]!, end];
}
