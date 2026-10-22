/** Colour maths for contrast checks and brand derivation. Hex in, hex out; sRGB with WCAG 2.x relative luminance and OKLCH for lightness steps. */

export type RGB = [number, number, number];

export function parseHex(hex: string): RGB {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`Not a hex colour: ${hex}`);
  let h = m[1]!;
  if (h.length === 3) h = [...h].map((c) => c + c).join("");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as RGB;
}

export function toHex([r, g, b]: RGB): string {
  return (
    "#" +
    [r, g, b]
      .map((v) =>
        Math.round(Math.min(255, Math.max(0, v)))
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

const lin = (c: number) => {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};
const gam = (c: number) => 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);

export function luminance(hex: string): number {
  const [r, g, b] = parseHex(hex).map(lin) as RGB;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio, 1 to 21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export interface OKLCH {
  l: number;
  c: number;
  h: number;
}

export function toOklch(hex: string): OKLCH {
  const [r, g, b] = parseHex(hex).map(lin) as RGB;
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { l: L, c: Math.hypot(A, B), h: (Math.atan2(B, A) * 180) / Math.PI };
}

export function fromOklch({ l, c, h }: OKLCH): string {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const r = 4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const g = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const bl = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_;
  return toHex([gam(r), gam(g), gam(bl)]);
}

/** The colour nearest `hex` (same hue and chroma, stepping lightness) whose contrast with `against` reaches `target`. Darkens when `against` is light, lightens when it is dark. */
export function reachContrast(hex: string, against: string, target: number): string {
  const start = toOklch(hex);
  const darken = luminance(against) > 0.4;
  let best = hex;
  for (let step = 0; step <= 100; step++) {
    const l = darken ? start.l - step * 0.01 : start.l + step * 0.01;
    if (l < 0 || l > 1) break;
    best = fromOklch({ ...start, l });
    if (contrast(best, against) >= target) return best;
  }
  return best;
}

/** A colour to hold a contrast ratio against. */
export type ContrastCheck = readonly [against: string, min: number];

/** The colour nearest `hex` in OKLCH lightness (same hue and chroma) that holds every check. Tries darker and lighter and keeps the closer hit. Near white and black the sRGB gamut cannot carry the full chroma, so when nothing holds, it tries again with less chroma. When still nothing holds, returns the closest and `ok: false`. */
export function reachAll(hex: string, checks: readonly ContrastCheck[]): { color: string; ok: boolean } {
  const start = toOklch(hex);
  const worst = (c: string) => Math.min(...checks.map(([against, min]) => contrast(c, against) / min));
  const first = worst(hex);
  if (first >= 1) return { color: hex, ok: true };
  let best = { color: hex, score: first };
  for (const keep of [1, 0.6, 0.3, 0]) {
    let hit: { color: string; distance: number } | undefined;
    for (const dir of [-1, 1]) {
      for (let step = 1; step <= 101; step++) {
        const distance = step * 0.01;
        const l = Math.min(1, Math.max(0, start.l + dir * distance));
        const color = fromOklch({ ...start, c: start.c * keep, l });
        const score = worst(color);
        if (score >= 1) {
          if (!hit || distance < hit.distance) hit = { color, distance };
          break;
        }
        if (score > best.score) best = { color, score };
        if (l === 0 || l === 1) break;
      }
    }
    if (hit) return { color: hit.color, ok: true };
  }
  return { color: best.color, ok: false };
}

/** A very light tint of `hex`'s hue, for soft backgrounds. */
export function tint(hex: string, lightness = 0.955, chroma = 0.025): string {
  const { h } = toOklch(hex);
  return fromOklch({ l: lightness, c: chroma, h });
}

/** The colour nearest `hex` (same hue and chroma, lightness stepped toward `against`) that still holds a contrast of `target` with `against`. Softens as far as the target allows; returns `hex` unchanged when it is already under the target. */
export function settleContrast(hex: string, against: string, target: number): string {
  const start = toOklch(hex);
  const goal = toOklch(against).l;
  const dir = goal >= start.l ? 1 : -1;
  let best = hex;
  if (contrast(hex, against) < target) return best;
  for (let step = 1; step <= 400; step++) {
    const l = start.l + dir * step * 0.0025;
    if ((dir > 0 && l > goal) || (dir < 0 && l < goal)) break;
    const next = fromOklch({ ...start, l });
    if (contrast(next, against) < target) break;
    best = next;
  }
  return best;
}

/** `hex` moved to OKLCH lightness `l`, optionally with a new chroma and hue, clamped to the sRGB gamut. */
export function withLightness(hex: string, l: number, chroma?: number, hue?: number): string {
  const o = toOklch(hex);
  return fromOklch({ l: Math.min(1, Math.max(0, l)), c: chroma ?? o.c, h: hue ?? o.h });
}
