import { defaults, groups, type TokenName } from "./generated/defaults.js";
import { contrast, reachContrast, tint } from "./color.js";

export type TokenValues = Partial<Record<TokenName, string>>;

export interface ThemeInput {
  /** Identifies the theme. It becomes the value of `data-e-theme` when the theme is scoped to an element. */
  name?: string;
  /** The brand colour. The deep action colour (`primary`) is derived from it so white text on it reaches 7:1; the tinted ground follows. */
  brand?: string;
  /** A second brand colour for positive actions (`secondary`), derived the same way. */
  accent?: string;
  /** Font stacks for body and mono text. Fonts are never bundled: load them yourself or import `@eos/vue/fonts.css`. */
  fonts?: { sans?: string; mono?: string };
  /** Corner style: a preset or explicit values. */
  radius?: "sharp" | "default" | "round" | { sm?: string; md?: string; lg?: string };
  /** Anything else, by token name. Wins over everything derived. */
  tokens?: TokenValues;
  /** Throw on a contrast failure instead of reporting it in `issues`. */
  strict?: boolean;
}

export interface ContrastIssue {
  pair: [string, string];
  ratio: number;
  min: number;
  role: string;
}

export interface CssOptions {
  /** Selector the tokens apply to. Default `:root`. */
  selector?: string;
  /** Wrap in `@layer e.tokens`, the layer the components expect. Default true. */
  layer?: boolean;
  /** Prepend the layer order statement and a generated-file comment. */
  header?: boolean;
}

export interface Theme {
  name: string;
  /** Every token, by name without the leading `--`. */
  tokens: Record<string, string>;
  /** Failures of the contrast pairs the system promises (text 4.5, non-text 3). Empty when the theme is sound. */
  issues: ContrastIssue[];
  /** The theme as CSS custom properties on a selector, in the token layer. Render it into `<head>` on the server. */
  css(options?: CssOptions): string;
  /** Sets the tokens on an element as inline custom properties and marks it `data-e-theme`. Browser only. */
  apply(el?: HTMLElement): void;
}

/** Cascade order of the library. Later layers win, and each layer only builds on the ones before it. */
export const LAYER_ORDER =
  "e.reset, e.tokens, e.base, e.primitives, e.blocks, e.controls, e.composites, e.containers, e.account, e.page";

const RADII = {
  sharp: { sm: "0px", md: "2px", lg: "4px" },
  default: { sm: "4px", md: "8px", lg: "16px" },
  round: { sm: "8px", md: "14px", lg: "24px" },
} as const;

/** The pairs the system promises, with the minimum ratio and what they carry. */
const PAIRS: { fg: TokenName; bg: TokenName; min: number; role: string }[] = [
  { fg: "ink", bg: "surface", min: 7, role: "Body text" },
  { fg: "ink", bg: "surface-tint", min: 7, role: "Text on the tinted ground" },
  { fg: "muted", bg: "surface", min: 4.5, role: "Secondary text" },
  { fg: "on-primary", bg: "primary", min: 4.5, role: "Primary button label" },
  { fg: "primary", bg: "surface", min: 4.5, role: "Links and small primary text" },
  { fg: "on-secondary", bg: "secondary", min: 4.5, role: "Secondary button label" },
  { fg: "on-danger", bg: "danger", min: 4.5, role: "Danger button label" },
  { fg: "danger", bg: "surface", min: 4.5, role: "Error text" },
  { fg: "danger", bg: "danger-soft", min: 4.5, role: "Danger notice text" },
  { fg: "warning-strong", bg: "warning-soft", min: 4.5, role: "Warning notice text" },
  { fg: "secondary", bg: "secondary-soft", min: 4.5, role: "Success notice text" },
  { fg: "border", bg: "surface", min: 3, role: "Card outline (non-text)" },
  { fg: "border-strong", bg: "surface", min: 3, role: "Control edge (non-text)" },
];

function derive(input: ThemeInput): Record<string, string> {
  const out: Record<string, string> = { ...defaults };
  if (input.brand) {
    out["brand-blue"] = input.brand;
    out["primary"] = reachContrast(input.brand, out["on-primary"]!, 7);
    out["surface-tint"] = tint(input.brand);
  }
  if (input.accent) {
    out["brand-green"] = input.accent;
    out["secondary"] = reachContrast(input.accent, out["on-secondary"]!, 7);
    out["secondary-soft"] = tint(input.accent, 0.96, 0.04);
  }
  if (input.fonts?.sans) out["font-sans"] = input.fonts.sans;
  if (input.fonts?.mono) out["font-mono"] = input.fonts.mono;
  if (input.radius) {
    const r = typeof input.radius === "string" ? RADII[input.radius] : { ...RADII.default, ...input.radius };
    out["radius-sm"] = r.sm;
    out["radius-md"] = r.md;
    out["radius-lg"] = r.lg;
  }
  Object.assign(out, input.tokens);
  return out;
}

function resolve(tokens: Record<string, string>, name: string, seen = new Set<string>()): string {
  const v = tokens[name] ?? "";
  const m = /^var\(--([a-z-]+)\)$/.exec(v);
  if (!m || seen.has(name)) return v;
  seen.add(name);
  return resolve(tokens, m[1]!, seen);
}

export function checkContrast(tokens: Record<string, string>): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  for (const { fg, bg, min, role } of PAIRS) {
    const a = resolve(tokens, fg);
    const b = resolve(tokens, bg);
    if (!a.startsWith("#") || !b.startsWith("#")) continue;
    const ratio = contrast(a, b);
    if (ratio < min) issues.push({ pair: [fg, bg], ratio: Math.round(ratio * 100) / 100, min, role });
  }
  return issues;
}

const WASHES = [
  "--e-wash-hover: color-mix(in srgb, var(--e-ink) 8%, transparent);",
  "--e-wash-press: color-mix(in srgb, var(--e-ink) 15%, transparent);",
  "--e-wash-ring: color-mix(in srgb, var(--e-ink) 38%, transparent);",
];

export function defineTheme(input: ThemeInput = {}): Theme {
  const name = input.name ?? "custom";
  const tokens = derive(input);
  const issues = checkContrast(tokens);
  if (input.strict && issues.length) {
    throw new Error(
      "Theme fails contrast:\n" +
        issues.map((i) => `  ${i.role}: ${i.pair.join(" on ")} is ${i.ratio}:1, needs ${i.min}:1`).join("\n"),
    );
  }
  return {
    name,
    tokens,
    issues,
    css({ selector = ":root", layer = true, header = false }: CssOptions = {}) {
      const decls = Object.entries(tokens)
        .map(([k, v]) => `  --e-${k}: ${v};`)
        .join("\n");
      // The washes are computed from ink, so every scoped root recomputes them from its own ink.
      const derived = `${selector}, [data-e-theme] {\n${WASHES.map((w) => "  " + w).join("\n")}\n}`;
      const rules = `${selector} {\n${decls}\n}\n${derived}\n`;
      const body = layer ? `@layer e.tokens {\n${rules}}\n` : rules;
      return (header ? `/* Generated from tokens.json. Theme: ${name}. */\n@layer ${LAYER_ORDER};\n` : "") + body;
    },
    apply(el = document.documentElement) {
      for (const [k, v] of Object.entries(tokens)) el.style.setProperty(`--e-${k}`, v);
      el.setAttribute("data-e-theme", name);
    },
  };
}

export { defaults, groups };
export type { TokenName };
