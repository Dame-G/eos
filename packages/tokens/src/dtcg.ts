import { groups, usage } from "./generated/defaults.js";

/** One token in the W3C Design Tokens format. */
export interface DtcgToken {
  $value: string | number | number[];
  /** Omitted when the value is a CSS expression no DTCG type can hold (a shadow stack, `color-mix()`). */
  $type?: "color" | "dimension" | "duration" | "cubicBezier" | "number" | "fontFamily" | "fontWeight";
  $description?: string;
}

/** Tokens grouped by kind (`color`, `spacing`, `radius`...), the shape Tokens Studio and Style Dictionary read. */
export type DtcgTokens = Record<string, Record<string, DtcgToken>>;

const HEX = /^#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const DIMENSION = /^-?(?:\d+|\d*\.\d+)(?:px|rem|em)$/;
const DURATION = /^\d+(?:\.\d+)?m?s$/;
const BEZIER = /^cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)$/;
const REFERENCE = /^var\(--e-([a-z0-9-]+)\)$/;

/**
 * Turns resolved token values (`theme.tokens`) into W3C Design Tokens JSON. A value that is only another token
 * (`var(--e-primary)`) becomes an alias (`{color.primary}`), and each token carries its usage note as `$description`.
 * Dimensions and durations stay strings with their unit (`"8px"`, `"220ms"`), which Tokens Studio and Style Dictionary accept.
 */
export function toDtcg(tokens: Record<string, string>): DtcgTokens {
  const groupOf = new Map<string, string>();
  for (const [group, names] of Object.entries(groups)) for (const name of names) groupOf.set(name, group);

  const out: DtcgTokens = {};
  const put = (group: string, name: string, token: DtcgToken) => {
    const note = usage[name];
    (out[group] ??= {})[name] = { ...token, ...(note && { $description: note }) };
  };

  for (const [name, value] of Object.entries(tokens)) {
    const group = groupOf.get(name) ?? "other";
    const ref = REFERENCE.exec(value);
    if (ref) {
      const target = groupOf.get(ref[1]!);
      if (target) {
        put(group, name, { $value: `{${target}.${ref[1]}}` });
        continue;
      }
    }
    const bezier = BEZIER.exec(value);
    if (HEX.test(value)) put(group, name, { $value: value.toLowerCase(), $type: "color" });
    else if (group === "font") put(group, name, { $value: value, $type: "fontFamily" });
    else if (bezier) put(group, name, { $value: bezier.slice(1, 5).map(Number), $type: "cubicBezier" });
    else if (group === "weight" && /^\d+$/.test(value))
      put(group, name, { $value: Number(value), $type: "fontWeight" });
    else if (group === "zIndex" && /^-?\d+$/.test(value)) put(group, name, { $value: Number(value), $type: "number" });
    else if (group === "duration" && DURATION.test(value)) put(group, name, { $value: value, $type: "duration" });
    else if (DIMENSION.test(value) && group !== "duration") put(group, name, { $value: value, $type: "dimension" });
    else put(group, name, { $value: value });
  }
  return out;
}
