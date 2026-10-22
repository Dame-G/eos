import { defaults, groups, type TokenName } from "./generated/defaults.js";
import { toDtcg, type DtcgTokens } from "./dtcg.js";
import {
  type ContrastCheck,
  contrast,
  fromOklch,
  luminance,
  parseHex,
  reachAll,
  reachContrast,
  settleContrast,
  tint,
  toOklch,
  withLightness,
} from "./color.js";

export type TokenValues = Partial<Record<TokenName, string>>;

export type MotionPreset = "default" | "snappy" | "gentle" | "none";
export type ElevationPreset = "outline" | "lifted" | "bold";
export type ContrastPreset = "standard" | "high";

export interface ThemeInput {
  /** Identifies the theme. It becomes the value of `data-e-theme` when the theme is scoped to an element. */
  name?: string;
  /** The brand colour. The deep action colour (`primary`) is derived from it so white text on it reaches 7:1; the tinted ground follows. */
  brand?: string;
  /** A second brand colour for positive actions (`secondary`), derived the same way. */
  accent?: string;
  /** The page ground: the colour behind everything. Sets `background`. When `surface` is given and this is not, the page ground follows the surface. */
  background?: string;
  /** Anything that sits on the page: cards, fields, popovers, panels. Sets `surface` and derives `surface-tint` (the second ground) and the soft tone backdrops from its lightness. A dark surface also switches the action colours and their `on-*` text to light variants. */
  surface?: string;
  /** Text and lines. Sets `ink` and derives `muted` (softened until it just holds 7:1 on the surface), `border` (3.4:1) and `border-strong` (4.5:1). Without it, a given `surface` picks black or white. */
  foreground?: string;
  /** The destructive action colour. Derives `danger` (deepened until `on-danger` text reaches 7:1, and 4.5:1 on the surface and on `danger-soft`), `on-danger` and `danger-soft`. */
  danger?: string;
  /** The caution colour. Derives `warning-strong` (4.5:1 or more on the surface and on `warning-soft`) and `warning-soft`. */
  warning?: string;
  /** Font stacks for body and mono text. Fonts are never bundled: load them yourself or import `@eos-ui/vue/fonts.css`. */
  fonts?: { sans?: string; mono?: string };
  /** Corner style: a preset or explicit values. */
  radius?: "sharp" | "default" | "round" | { sm?: string; md?: string; lg?: string };
  /** Multiplier for the type scale, `text-xs` to `text-4xl`. 1 is the default scale; non-finite or non-positive values are ignored. */
  textScale?: number;
  /** Multiplier for the spacing scale, `space-1` to `space-8`. 1 is the default scale; non-finite or non-positive values are ignored. */
  spaceScale?: number;
  /** Line weights in px. `hair` sets `stroke-hair`, `stroke-card` and `stroke-edge` (1.5 times it, rounded down to whole pixels); `focus` sets `stroke-focus` and `focus-gap` (the same). `edge` and `card` set `stroke-edge` (controls) and `stroke-card` (containers, chips) outright and win over what `hair` and a bold `elevation` give. `focus-gap-field` always follows `stroke-edge` in CSS (minus the border width), so a field's focus outline sits exactly over its border. */
  strokes?: { hair?: number; focus?: number; edge?: number; card?: number };
  /** `"high"` draws every line and secondary text at full strength: `border` and `border-strong` become the foreground colour, `muted` is softened only until it holds 15:1, `surface-tint` is a neutral grey (no brand tint) and `scrim` is darker. Pair it with heavier `strokes`. Default `"standard"`. */
  contrast?: ContrastPreset;
  /** How state changes feel: sets `duration-tap`, `duration-move` and `easing-out`. */
  motion?: MotionPreset;
  /** How depth is drawn: sets `edge`, `well` and `float` from the border, ink and hairline. `outline` is flat rings, `lifted` adds soft drops, `bold` uses heavy rings and a hard offset shadow. */
  elevation?: ElevationPreset;
  /** Height in px of every tappable control. Sets `control-height` and derives `chip-height` at half of it, rounded to an even number. */
  controlHeight?: number;
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
  /** The tokens as W3C Design Tokens JSON, for Figma (Tokens Studio), Style Dictionary and other design tools. */
  dtcg(): DtcgTokens;
  /** Sets the tokens on an element as inline custom properties and marks it `data-e-theme`. Browser only. */
  apply(el?: HTMLElement): void;
}

/** Cascade order of the library. Later layers win, and each layer only builds on the ones before it. */
export const LAYER_ORDER =
  "e.reset, e.tokens, e.base, e.primitives, e.blocks, e.controls, e.composites, e.containers, e.page";

const RADII = {
  sharp: { sm: "0px", md: "2px", lg: "4px" },
  default: { sm: "4px", md: "8px", lg: "16px" },
  round: { sm: "8px", md: "14px", lg: "24px" },
} as const;

const PAIRS: { fg: TokenName; bg: TokenName; min: number; role: string }[] = [
  { fg: "ink", bg: "surface", min: 7, role: "Body text" },
  { fg: "ink", bg: "surface-tint", min: 7, role: "Text on the tinted ground" },
  { fg: "muted", bg: "surface", min: 4.5, role: "Secondary text" },
  { fg: "muted", bg: "surface-tint", min: 4.5, role: "Secondary text on the tinted ground" },
  { fg: "on-primary", bg: "primary", min: 4.5, role: "Primary button label" },
  { fg: "primary", bg: "surface", min: 4.5, role: "Links and small primary text" },
  { fg: "on-secondary", bg: "secondary", min: 4.5, role: "Secondary button label" },
  { fg: "on-danger", bg: "danger", min: 4.5, role: "Danger button label" },
  { fg: "danger", bg: "surface", min: 4.5, role: "Error text" },
  { fg: "danger", bg: "danger-soft", min: 4.5, role: "Danger notice text" },
  { fg: "warning-strong", bg: "warning-soft", min: 4.5, role: "Warning notice text" },
  { fg: "secondary", bg: "secondary-soft", min: 4.5, role: "Success notice text" },
  { fg: "border", bg: "surface", min: 3, role: "Card outline (non-text)" },
  { fg: "border", bg: "surface-tint", min: 3, role: "Outline on the tinted ground (non-text)" },
  { fg: "border-strong", bg: "surface", min: 3, role: "Control edge (non-text)" },
  { fg: "focus-ring", bg: "surface", min: 3, role: "Focus ring (non-text)" },
  { fg: "focus-ring", bg: "surface-tint", min: 3, role: "Focus ring on the tinted ground (non-text)" },
  { fg: "focus-ring", bg: "background", min: 3, role: "Focus ring on the page (non-text)" },
  { fg: "focus-field", bg: "surface", min: 3, role: "Field focus outline (non-text)" },
  { fg: "focus-field", bg: "surface-tint", min: 3, role: "Field focus outline on the tinted ground (non-text)" },
  { fg: "focus-field", bg: "background", min: 3, role: "Field focus outline on the page (non-text)" },
  { fg: "ink", bg: "background", min: 7, role: "Text on the page" },
  { fg: "muted", bg: "background", min: 4.5, role: "Secondary text on the page" },
  { fg: "primary", bg: "background", min: 4.5, role: "Links on the page" },
  { fg: "border", bg: "background", min: 3, role: "Outline on the page (non-text)" },
];

const DARK_BELOW = 0.179;
const BLACK = "#000000";
const WHITE = "#ffffff";
const DARK_DANGER = "#d33b30";
const DARK_WARNING = "#ffc857";
const DARK_WELL = "inset 0 2px 0 0 rgba(0, 0, 0, 0.55)";

const MOTION: Record<MotionPreset, Record<string, string>> = {
  default: {},
  snappy: { "duration-tap": "50ms", "duration-move": "140ms" },
  gentle: { "duration-tap": "140ms", "duration-move": "380ms", "easing-out": "cubic-bezier(0.4, 0, 0.2, 1)" },
  none: { "duration-tap": "0ms", "duration-move": "0ms" },
};

const positive = (n: unknown): number | undefined =>
  typeof n === "number" && Number.isFinite(n) && n > 0 ? n : undefined;
const px = (n: number) => `${Math.round(n * 100) / 100}px`;

function scaleTokens(out: Record<string, string>, names: readonly string[], factor: number | undefined) {
  const f = positive(factor);
  if (f === undefined || f === 1) return;
  for (const name of names) out[name] = px(Math.max(1, Math.round(parseFloat(defaults[name as TokenName]) * f)));
}

function toneHue(soft: "danger-soft" | "warning-soft", strong: "danger" | "warning-strong", tone?: string): number {
  const hue = toOklch(defaults[soft]).h;
  return tone ? hue + toOklch(tone).h - toOklch(defaults[strong]).h : hue;
}

function deriveStrokes(input: ThemeInput, out: Record<string, string>) {
  const hair = positive(input.strokes?.hair);
  const focus = positive(input.strokes?.focus);
  const edge = positive(input.strokes?.edge);
  const card = positive(input.strokes?.card);
  if (hair !== undefined) {
    out["stroke-hair"] = px(hair);
    out["stroke-card"] = px(hair);
    out["stroke-edge"] = px(Math.max(1, Math.floor(hair * 1.5)));
  }
  if (focus !== undefined) {
    out["stroke-focus"] = px(focus);
    out["focus-gap"] = px(focus);
  }
  if (edge !== undefined) out["stroke-edge"] = px(edge);
  if (card !== undefined) out["stroke-card"] = px(card);
}

type ShadowLayer = [y: number, blur: number, spread: number, alpha: number];

const SOFT: ShadowLayer[] = [
  [1, 2, 0, 0.08],
  [4, 8, -2, 0.1],
  [12, 24, -6, 0.14],
  [24, 48, -12, 0.18],
];
const LIFTED: ShadowLayer[] = [
  [1, 2, 0, 0.1],
  [6, 12, -3, 0.12],
  [18, 36, -8, 0.18],
  [32, 64, -16, 0.2],
];
const CARD: ShadowLayer[] = [
  [1, 2, 0, 0.12],
  [4, 8, -2, 0.08],
];

function shadowRgb(out: Record<string, string>, dark: boolean) {
  const ground = toOklch(out["background"]!);
  const [r, g, b] = parseHex(
    fromOklch({ l: dark ? 0.07 : 0.2613, c: Math.min(ground.c, dark ? 0.03 : 0.0408), h: ground.h }),
  );
  return `${r}, ${g}, ${b}`;
}

function layers(set: ShadowLayer[], dark: boolean, base: string) {
  return set
    .map(
      ([y, blur, spread, alpha]) =>
        `0 ${y}px ${blur}px ${spread}px rgba(${base}, ${Math.round(Math.min(0.9, dark ? alpha * 2.4 : alpha) * 100) / 100})`,
    )
    .join(", ");
}

function deriveElevation(
  style: ElevationPreset,
  out: Record<string, string>,
  dark: boolean,
  strokes?: ThemeInput["strokes"],
) {
  const ring = (w: string) => `0 0 0 ${w} ${out["border"]}`;
  const hair = out["stroke-hair"]!;
  const given = positive(strokes?.card);
  const card = given !== undefined ? px(given) : style === "bold" ? "2px" : hair;
  out["stroke-card"] = card;
  const base = shadowRgb(out, dark);
  if (style === "lifted") {
    out["edge"] = `${ring(card)}, ${layers(CARD, dark, base)}`;
    out["float"] = `${ring(card)}, ${layers(LIFTED, dark, base)}`;
  } else if (style === "bold") {
    out["edge"] = ring(card);
    out["well"] = `inset 0 3px 0 0 ${dark ? "rgba(0, 0, 0, 0.55)" : "rgba(0, 0, 0, 0.14)"}`;
    out["float"] =
      `${ring(card)}, 4px 4px 0 0 rgba(${base}, ${dark ? 0.75 : 0.32}), 0 14px 28px -10px rgba(${base}, ${dark ? 0.7 : 0.22})`;
  } else {
    out["edge"] = ring(card);
    out["float"] = `${ring(card)}, ${layers(SOFT, dark, base)}`;
  }
}

const holds = (value: string, checks: readonly ContrastCheck[]) =>
  checks.every(([against, min]) => contrast(value, against) >= min);

/** The value pushed away from each colour it falls short of, in order. Right whenever the colours sit clearly on one side of it, which covers every light and dark surface that is not a mid-tone. */
function pushed(value: string, checks: readonly ContrastCheck[]): string {
  let out = value;
  for (const [against, min] of checks) if (contrast(out, against) < min) out = reachContrast(out, against, min);
  return out;
}

/** Keeps `token` when it already holds every check. Otherwise pushes it away from what it falls short of, and if that is not enough moves `base` to the nearest lightness that does, darker or lighter. */
function fit(out: Record<string, string>, token: string, base: string, checks: readonly ContrastCheck[]) {
  const push = pushed(out[token]!, checks);
  out[token] = holds(push, checks) ? push : reachAll(base, checks).color;
}

/**
 * Like `fit` for an action fill that carries label text in `onToken`. The fill has to hold its checks and 7:1 with the label (4.5:1 when 7:1 is out of reach). It keeps the current label colour when it can, then tries the other of black and white.
 * On a mid-tone surface the fill cannot be lightened toward white without losing its white label, so it goes darker instead, or the label turns black.
 * Returns false and leaves the fill alone when no lightness holds everything.
 */
function fitFill(
  out: Record<string, string>,
  token: string,
  onToken: string | undefined,
  base: string,
  checks: readonly ContrastCheck[],
): boolean {
  const label = onToken ? out[onToken]! : undefined;
  const push = pushed(out[token]!, checks);
  if (holds(push, label ? [[label, 4.5], ...checks] : checks)) {
    out[token] = push;
    return true;
  }
  const other = label === BLACK ? WHITE : BLACK;
  const tries: (readonly [string | undefined, number])[] = label
    ? [
        [label, 7],
        [label, 4.5],
        [other, 7],
        [other, 4.5],
      ]
    : [[undefined, 0]];
  for (const [on, min] of tries) {
    const found = reachAll(base, on ? [[on, min], ...checks] : checks);
    if (found.ok) {
      out[token] = found.color;
      if (onToken && on) out[onToken] = on;
      return true;
    }
  }
  return false;
}

/**
 * Settles an action colour against the surface and its soft backdrop. When that is impossible, which happens on a mid-tone surface where the backdrop sits between the surface and the only colours the action can take, the action settles against the surface alone and the backdrop moves away from it.
 */
function fitTone(
  out: Record<string, string>,
  token: string,
  onToken: string | undefined,
  soft: string,
  base: string,
  surface: string,
) {
  const both: ContrastCheck[] = [
    [surface, 4.5],
    [out[soft]!, 4.5],
  ];
  if (fitFill(out, token, onToken, base, both)) return;
  if (!fitFill(out, token, onToken, base, [[surface, 4.5]])) {
    const label = onToken ? out[onToken]! : undefined;
    out[token] = reachAll(
      base,
      label
        ? [
            [label, 4.5],
            [surface, 4.5],
          ]
        : [[surface, 4.5]],
    ).color;
  }
  out[soft] = reachAll(out[soft]!, [[out[token]!, 4.5]]).color;
}

function deriveGround(input: ThemeInput, out: Record<string, string>, dark: boolean) {
  const surface = input.surface ?? out["surface"]!;
  if (input.surface) {
    out["surface"] = input.surface;
    const hue = toOklch(input.brand ?? out["brand-blue"]!).h;
    const l = toOklch(input.surface).l;
    out["surface-tint"] = fromOklch({ l: Math.min(1, Math.max(0, dark ? l + 0.06 : l - 0.045)), c: 0.025, h: hue });
    for (const [token, hueSource] of [
      ["secondary-soft", toOklch(input.accent ?? defaults["secondary-soft"]).h],
      ["danger-soft", toneHue("danger-soft", "danger", input.danger)],
      ["warning-soft", toneHue("warning-soft", "warning-strong", input.warning)],
    ] as const) {
      const base = toOklch(defaults[token]);
      const chroma = dark ? 0.05 : token === "secondary-soft" && input.accent ? 0.04 : base.c;
      const offset = token === "secondary-soft" && input.accent ? -0.04 : base.l - 1;
      out[token] = withLightness(surface, dark ? l + 0.07 : l + offset, chroma, hueSource);
    }
  }
  out["background"] = input.background ?? (input.surface ? surface : out["background"]!);
  const foreground =
    input.foreground ??
    (input.surface ? (dark ? WHITE : defaults["ink"]) : input.contrast === "high" ? defaults["ink"] : undefined);
  if (foreground) {
    out["ink"] = foreground;
    out["muted"] = settleContrast(foreground, surface, 7);
    out["border"] = settleContrast(foreground, surface, 3.4);
    out["border-strong"] = settleContrast(foreground, surface, 4.5);
    if (input.contrast === "high") {
      out["muted"] = settleContrast(foreground, surface, 15);
      out["border"] = foreground;
      out["border-strong"] = foreground;
    }
  }
  if (input.contrast === "high") {
    const l = toOklch(surface).l;
    out["surface-tint"] = fromOklch({ l: Math.min(1, Math.max(0, dark ? l + 0.06 : l - 0.04)), c: 0, h: 0 });
    out["scrim"] = "rgb(0 0 0 / 0.75)";
  }
  // The tint steps away from the surface by a fixed amount, which can cost the text on it more contrast than it can spare.
  if (foreground) {
    fit(out, "surface-tint", out["surface-tint"]!, [
      [out["ink"]!, 7],
      [out["muted"]!, 4.5],
    ]);
  }
}

function isDark(input: ThemeInput): boolean {
  return input.surface !== undefined && luminance(input.surface) < DARK_BELOW;
}

function derive(input: ThemeInput): Record<string, string> {
  const out: Record<string, string> = { ...defaults };
  const dark = isDark(input);
  if (dark) {
    for (const t of ["on-primary", "on-secondary", "on-danger"]) out[t] = BLACK;
    out["warning-strong"] = input.warning ?? DARK_WARNING;
    out["scrim"] = "rgb(0 0 0 / 0.7)";
    out["well"] = DARK_WELL;
    out["shade-hover"] = "white 12%";
    out["shade-press"] = "white 20%";
    out["shade-slab"] = "black 45%";
  }
  const dangerBase = input.danger ?? (dark ? DARK_DANGER : undefined);
  if (dangerBase) out["danger"] = reachContrast(dangerBase, out["on-danger"]!, 7);
  if (input.brand) out["brand-blue"] = input.brand;
  if (input.brand || dark) out["primary"] = reachContrast(out["brand-blue"]!, out["on-primary"]!, 7);
  if (input.accent) out["brand-green"] = input.accent;
  if (input.accent || dark) out["secondary"] = reachContrast(out["brand-green"]!, out["on-secondary"]!, 7);
  if (input.brand && !input.surface) out["surface-tint"] = tint(input.brand);
  if (input.accent && !input.surface) out["secondary-soft"] = tint(input.accent, 0.96, 0.04);
  deriveGround(input, out, dark);
  if (!input.surface) {
    for (const [token, tone, strong] of [
      ["danger-soft", input.danger, "danger"],
      ["warning-soft", input.warning, "warning-strong"],
    ] as const) {
      const hue = toneHue(token, strong, tone);
      const base = toOklch(defaults[token]);
      if (tone && hue !== base.h) out[token] = withLightness(defaults[token], base.l, base.c, hue);
    }
  }
  if (input.warning && !dark) out["warning-strong"] = reachContrast(input.warning, out["surface"]!, 7);
  const surface = out["surface"]!;
  if (input.surface) {
    if (!fitFill(out, "primary", "on-primary", out["brand-blue"]!, [[surface, 4.5]])) {
      out["primary"] = reachAll(out["brand-blue"]!, [
        [out["on-primary"]!, 4.5],
        [surface, 4.5],
      ]).color;
    }
    fitTone(out, "secondary", "on-secondary", "secondary-soft", out["brand-green"]!, surface);
  }
  if (input.surface || input.danger) {
    fitTone(out, "danger", "on-danger", "danger-soft", dangerBase ?? defaults["danger"], surface);
  }
  if (input.surface || input.warning) {
    const base = input.warning ?? (dark ? DARK_WARNING : defaults["warning-strong"]);
    fitTone(out, "warning-strong", undefined, "warning-soft", base, surface);
  }
  // The outline has to show on the tinted ground as well as on the surface, and the tint moves with the brand.
  fit(out, "border", out["border"]!, [
    [surface, 3],
    [out["surface-tint"]!, 3],
  ]);
  if (input.fonts?.sans) out["font-sans"] = input.fonts.sans;
  if (input.fonts?.mono) out["font-mono"] = input.fonts.mono;
  if (input.radius) {
    const r = typeof input.radius === "string" ? RADII[input.radius] : { ...RADII.default, ...input.radius };
    out["radius-sm"] = r.sm;
    out["radius-md"] = r.md;
    out["radius-lg"] = r.lg;
  }
  scaleTokens(out, groups.fontSize, input.textScale);
  scaleTokens(out, groups.spacing, input.spaceScale);
  deriveStrokes(input, out);
  Object.assign(out, MOTION[input.motion ?? "default"]);
  const height = positive(input.controlHeight);
  if (height !== undefined) {
    out["control-height"] = px(height);
    out["chip-height"] = px(Math.max(2, Math.round(height / 4) * 2));
  }
  if (
    input.elevation ||
    input.background ||
    input.surface ||
    input.foreground ||
    input.contrast === "high" ||
    positive(input.strokes?.hair) !== undefined ||
    positive(input.strokes?.card) !== undefined
  ) {
    deriveElevation(input.elevation ?? "outline", out, dark, input.strokes);
  }
  Object.assign(out, input.tokens);
  return out;
}

function resolve(tokens: Record<string, string>, name: string, seen = new Set<string>()): string {
  const v = tokens[name] ?? "";
  const m = /^var\(--e-([a-z0-9-]+)\)$/.exec(v);
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
  // Tells the browser which way the page leans, so its own controls (scrollbars, colour picker, autofill) match.
  const scheme = isDark(input) ? "dark" : "light";
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
      const derived = `${selector}, [data-e-theme] {\n${WASHES.map((w) => "  " + w).join("\n")}\n}`;
      const rules = `${selector} {\n  color-scheme: ${scheme};\n${decls}\n}\n${derived}\n`;
      const body = layer ? `@layer e.tokens {\n${rules}}\n` : rules;
      return (header ? `/* Generated from tokens.json. Theme: ${name}. */\n@layer ${LAYER_ORDER};\n` : "") + body;
    },
    dtcg() {
      return toDtcg(tokens);
    },
    apply(el = document.documentElement) {
      for (const [k, v] of Object.entries(tokens)) el.style.setProperty(`--e-${k}`, v);
      el.style.colorScheme = scheme;
      el.setAttribute("data-e-theme", name);
    },
  };
}

export { defaults, groups };
export type { TokenName };
