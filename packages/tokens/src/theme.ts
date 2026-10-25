import { defaults, derivedFrom, groups, usage, type TokenName } from "./generated/defaults.js";
import { toDtcg, type DtcgTokens } from "./dtcg.js";
import {
  type ContrastCheck,
  contrast,
  fromOklch,
  luminance,
  parseColor,
  parseHex,
  reachAll,
  reachContrast,
  resolveColor,
  settleContrast,
  toHex,
  tint,
  toOklch,
  withLightness,
} from "./color.js";

export type TokenValues = Partial<Record<TokenName, string>>;

export type MotionPreset = "default" | "snappy" | "gentle";
export type ElevationPreset = "outline" | "lifted" | "bold";
/** A named bundle of `elevation`, `strokes`, `radius`, `depth` and `motion`. Anything you set yourself wins over the preset. `"paper"` is the default look, `"ink"` is heavy and sharp on a deep slab, `"quiet"` is round and gentle on a 1px slab. Fonts are never part of a preset. */
export type ThemePreset = "paper" | "ink" | "quiet";
/** `"auto"` follows the visitor: `standard` normally, `high` under `prefers-contrast: more`. */
export type ContrastPreset = "standard" | "high" | "auto";
export type DensityPreset = "comfortable" | "compact";
/** `"auto"` follows `prefers-color-scheme`: the theme is light and the `dark` input applies when the visitor prefers dark. `"light"` and `"dark"` only set the `color-scheme` of native controls, for a theme whose surface does not say. */
export type SchemePreset = "light" | "dark" | "auto";

/** The inputs a dark variant can change. Anything it leaves out is inherited from the theme, except the grounds (`background`, `surface`, `foreground`), which are never inherited because a light ground makes no sense on a dark page. */
export type ThemeVariant = Omit<ThemeInput, "name" | "scheme" | "dark" | "strict" | "preset">;

/** The surface of the dark variant when `scheme: "auto"` gives none. */
const DARK_SURFACE = "#10151a";

/**
 * The inputs of `defineTheme()`. A colour input (`brand`, `accent`, `background`, `surface`, `foreground`, `danger`,
 * `warning`, `success`) takes a hex (3, 4, 6 or 8 digits), `rgb()` or `rgba()`, `color-mix(in srgb, ...)` of those,
 * `black` or `white`. Alpha is dropped: the colour is used opaque. A value it cannot read is ignored and reported in
 * `warnings`.
 */
export interface ThemeInput {
  /** Identifies the theme. It becomes the value of `data-e-theme` when the theme is scoped to an element. */
  name?: string;
  /** The brand colour. The deep action colour (`primary`) is derived from it so white text on it reaches 7:1. */
  brand?: string;
  /** A second brand colour for the secondary action (`secondary`), derived the same way. It does not change the success tone: that is `success`. */
  accent?: string;
  /** The page ground: the colour behind everything. Sets `background`. When `surface` is given and this is not, the page ground follows the surface. */
  background?: string;
  /** Anything that sits on the page: cards, fields, popovers, panels. Sets `surface` and derives `surface-tint` (the second ground) and the soft tone backdrops from its lightness. A dark surface also switches the action colours and their `on-*` text to light variants. */
  surface?: string;
  /** Text and lines. Sets `ink` and derives `muted` (softened until it barely holds 7:1 on the surface), `border` (3.4:1) and `border-strong` (4.5:1). Without it, a given `surface` picks black or white. */
  foreground?: string;
  /** The destructive action colour. Derives `danger` (deepened until `on-danger` text reaches 7:1, and 4.5:1 on the surface and on `danger-soft`), `on-danger` and `danger-soft`. */
  danger?: string;
  /** The caution colour. Derives `warning` (4.5:1 or more on the surface and on `warning-soft`) and `warning-soft`. */
  warning?: string;
  /** The positive colour (paid, done, saved). Derives `success` (4.5:1 or more on the surface and on `success-soft`) and `success-soft`. */
  success?: string;
  /** Font stacks for body, mono and signature text. Fonts are never bundled: load them yourself or import `@eos-ui/vue/fonts.css`. */
  fonts?: { sans?: string; mono?: string; script?: string };
  /** Corner style: a preset, one base radius in px (`radius-md`; `radius-sm` is half of it and `radius-lg` double), or explicit values. */
  radius?: "sharp" | "default" | "round" | number | { sm?: string; md?: string; lg?: string };
  /** Multiplier for the type scale, `text-xs` to `text-4xl`, and the icon, checkbox and avatar boxes that sit beside text. Those tokens are in rem, so this multiplies on top of the visitor's own browser font size. 1 is the default scale. Non-finite or non-positive values are ignored. */
  textScale?: number;
  /** Multiplier for the spacing scale, `space-1` to `space-16` (the semantic `gap-*`, `pad-*` and `gutter` tokens are references to it, so they follow). 1 is the default scale. Non-finite or non-positive values are ignored. */
  spaceScale?: number;
  /** Line weights in px: `hair` and `focus` are all a theme needs. `hair` sets `stroke-hair` and derives `stroke-card` (the same, or 2px with a bold `elevation`) and `stroke-edge` (1.5 times it, rounded down to whole pixels). `focus` sets `stroke-focus`, which is both the width of the focus outline and its gap. `stroke-focus-gap-field` always follows `stroke-edge` in CSS (minus the border width), so a field's focus outline sits exactly over its border. */
  strokes?: {
    hair?: number;
    focus?: number;
  };
  /** `"high"` draws every line and secondary text at full strength: `border` and `border-strong` become the foreground colour, `muted` is softened only until it holds 15:1, `surface-tint` is a neutral grey (no brand tint) and `scrim` is darker. Pair it with heavier `strokes`. `"auto"` keeps the standard theme and adds the high one under `prefers-contrast: more`. Default `"standard"`. */
  contrast?: ContrastPreset;
  /** Opt in to `prefers-color-scheme` with `"auto"`. The theme is the light one; `dark` (default: a dark surface of `#10151a`) is derived the same way and emitted inside `@media (prefers-color-scheme: dark)`. `color-scheme` becomes `light dark`. Without it the theme is fixed: dark when `surface` is dark, light otherwise. */
  scheme?: SchemePreset;
  /** What changes on a dark page when `scheme` is `"auto"`: usually `surface`, and `foreground` or `brand` if the light ones do not carry over. */
  dark?: ThemeVariant;
  /** `"compact"` tightens the space scale to 0.75 (the `gap-*`, `pad-*` and `gutter` tokens follow, since they reference it) and makes controls exactly the 44px tap target (chips follow at 22px); a smaller `controlHeight` is raised to 44 and reported in `warnings`. `"comfortable"` is the default scale. Tap targets never fall under 44px in a compact theme. */
  density?: DensityPreset;
  /** How state changes feel: sets `duration-tap`, `duration-fade`, `duration-move` and `easing-out`. Every theme already stops moving under `prefers-reduced-motion`. */
  motion?: MotionPreset;
  /** How depth is drawn: sets `shadow-frame`, `shadow-well`, `shadow-float` and `shadow-paper` from the border, the slab ink and the hairline. Every one keeps the material: a frame is a flush ring, a floating panel is a slab lifted off the page (a hard edge twice `depth` deep and one faint drop). `outline` is the default; `lifted` stands cards on a slab of `depth` too and gives floating panels a wider drop; `bold` draws the rings at 2px and presses wells deeper. */
  elevation?: ElevationPreset;
  /** A named look that sets `elevation`, `strokes`, `radius`, `depth` and `motion` together: `"paper"` (the default), `"ink"` (bold, sharp, snappy, a 3px slab) or `"quiet"` (round, gentle, a 1px slab). Your own `elevation`, `radius`, `depth`, `motion` and `strokes` entries win over it. */
  preset?: ThemePreset;
  /** How far the slab reaches, in px: sets `depth` (2 by default) and derives `depth-thin` (half, at least 1) and `depth-bold` (double). Every raised face, every tone edge and every floating panel follows it. */
  depth?: number;
  /** Height in px of every tappable control, emitted in rem. Sets `control-height` and derives `chip-height` at half of it, rounded to an even number. */
  controlHeight?: number;
  /** Anything else, by token name. Wins over everything derived. */
  tokens?: TokenValues;
  /** Throw on a contrast failure instead of reporting it in `issues`. */
  strict?: boolean;
}

export interface Alternate {
  /** The media query, such as `(prefers-color-scheme: dark)`. */
  media: string;
  /** The `color-scheme` of native controls while it matches. */
  scheme: "light" | "dark";
  /** The tokens that differ from the base theme, by name without the leading `--`. */
  tokens: Record<string, string>;
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
  /** Failures of the contrast pairs the system promises (body text 7, other text 4.5, non-text 3). Empty when the theme is sound. With `scheme: "auto"` or `contrast: "auto"` it also lists the failures of every variant, their role ending in the media query. */
  issues: ContrastIssue[];
  /** Tokens that change under a media query (`scheme: "auto"`, `contrast: "auto"`), in cascade order: the last one that matches wins. Empty for a fixed theme. */
  alternates: Alternate[];
  /** Inputs that were ignored or adjusted (a colour it cannot read, a `controlHeight` under the compact tap target, a scale that is not a positive number, an unknown token in `tokens`) and contrast pairs that could not be evaluated. Also printed with `console.warn` outside production. */
  warnings: string[];
  /** Says where a token's value comes from: its value, the inputs that drive it and whether you set it, and its usage note. */
  explain(token: string): string;
  /** The theme as CSS custom properties on a selector, in the token layer. Render it into `<head>` on the server. */
  css(options?: CssOptions): string;
  /** The tokens as W3C Design Tokens JSON, for Figma (Tokens Studio), Style Dictionary and other design tools. */
  dtcg(): DtcgTokens;
  /** Sets the tokens on an element as inline custom properties and marks it `data-e-theme`, and repaints when a media query of `alternates` changes. Returns a function that removes the properties, the mark and the media listeners. Browser only. */
  apply(el?: HTMLElement): () => void;
}

/** Cascade order of the library. Later layers win, and each layer only builds on the ones before it. `e.reset` has no rules in the packages and is public: a site puts its own resets there (a documentation theme's defaults, for one) so every library layer overrides them. `e.state` comes last: the shared hover, press and disabled recipes of `base.css`, which no component's resting face may hide. */
export const LAYER_ORDER =
  "e.reset, e.tokens, e.base, e.primitives, e.blocks, e.controls, e.composites, e.containers, e.page, e.state";

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
  { fg: "link", bg: "surface", min: 4.5, role: "Inline links" },
  { fg: "link", bg: "background", min: 4.5, role: "Inline links on the page" },
  { fg: "success", bg: "success-soft", min: 4.5, role: "Success notice text" },
  { fg: "warning", bg: "warning-soft", min: 4.5, role: "Warning notice text" },
  { fg: "success", bg: "surface", min: 4.5, role: "Success text" },
  { fg: "warning", bg: "surface", min: 4.5, role: "Warning text" },
  { fg: "disabled-ink", bg: "surface", min: 4.5, role: "Disabled text" },
  { fg: "ink", bg: "surface-paper", min: 7, role: "Text on the paper surface" },
  { fg: "muted", bg: "surface-paper", min: 4.5, role: "Secondary text on the paper surface" },
  { fg: "border", bg: "surface-paper", min: 3, role: "Outline on the paper surface (non-text)" },
  { fg: "ink", bg: "selection", min: 4.5, role: "Selected text" },
  { fg: "stamp-ink", bg: "surface", min: 4.5, role: "Stamp ink" },
  { fg: "stamp-ink", bg: "surface-paper", min: 4.5, role: "Stamp ink on the paper surface" },
  { fg: "ink", bg: "wash-hover", min: 7, role: "Text on a hovered row" },
  { fg: "muted", bg: "wash-hover", min: 4.5, role: "Secondary text on a hovered row" },
  { fg: "primary", bg: "wash-hover", min: 4.5, role: "Primary text on a hovered row" },
  { fg: "ink", bg: "wash-press", min: 7, role: "Text on a pressed row" },
  { fg: "muted", bg: "wash-press", min: 4.5, role: "Secondary text on a pressed row" },
  { fg: "primary", bg: "wash-press", min: 4.5, role: "Primary text on a pressed row" },
  { fg: "ink", bg: "primary-soft", min: 7, role: "Text on a selected row" },
  { fg: "muted", bg: "primary-soft", min: 4.5, role: "Secondary text on a selected row" },
  { fg: "primary", bg: "primary-soft", min: 4.5, role: "Primary text on a selected row" },
  { fg: "info", bg: "info-soft", min: 4.5, role: "Information notice text" },
  { fg: "ink", bg: "info-soft", min: 7, role: "Text on an information notice" },
  { fg: "slab-ink", bg: "surface", min: 3, role: "Neutral slab and sunk edge (non-text)" },
  { fg: "muted", bg: "selection", min: 4.5, role: "Selected secondary text" },
  { fg: "wash-ring", bg: "surface", min: 3, role: "Hover ring (non-text)" },
  { fg: "on-primary", bg: "primary-hover", min: 4.5, role: "Hovered primary button label" },
  { fg: "on-primary", bg: "primary-press", min: 4.5, role: "Pressed primary button label" },
  { fg: "on-secondary", bg: "secondary-hover", min: 4.5, role: "Hovered secondary button label" },
  { fg: "on-secondary", bg: "secondary-press", min: 4.5, role: "Pressed secondary button label" },
  { fg: "on-danger", bg: "danger-hover", min: 4.5, role: "Hovered danger button label" },
  { fg: "on-danger", bg: "danger-press", min: 4.5, role: "Pressed danger button label" },
];

const DARK_BELOW = 0.179;
const BLACK = "#000000";
const WHITE = "#ffffff";
const DARK_DANGER = "#d33b30";
const DARK_WARNING = "#ffc857";
/** The success colour on a dark surface when `success` gives none: a pale green, which holds on dark grounds. */
const DARK_SUCCESS = "#9ad9b4";
const COMPACT_SPACE = 0.75;
const STAMP_INK = "#b23a14";
/** The OKLCH lightness and the most chroma of the deep shade a light theme draws its shadows and scrim in: those of the default, the logo blue's, so a brand or ground tints them no more than the default does. */
const SHADE_L = 0.2613;
const SHADE_MAX_C = 0.0408;

/** Boxes that belong to the text beside them, so they grow with `textScale` as the type does. */
const TEXT_SIZED = [
  "icon-size-sm",
  "icon-size-md",
  "icon-size-lg",
  "icon-size-xl",
  "check-size",
  "avatar-size-sm",
  "avatar-size-md",
  "avatar-size-lg",
] as const;

const MOTION: Record<MotionPreset, Record<string, string>> = {
  default: {},
  snappy: { "duration-tap": "50ms", "duration-fade": "90ms", "duration-move": "140ms" },
  gentle: {
    "duration-tap": "140ms",
    "duration-fade": "240ms",
    "duration-move": "380ms",
    "easing-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

const PRESETS: Record<ThemePreset, Pick<ThemeInput, "elevation" | "strokes" | "radius" | "motion" | "depth">> = {
  paper: {},
  ink: { elevation: "bold", strokes: { hair: 2, focus: 3 }, radius: "sharp", motion: "snappy", depth: 3 },
  /** A quiet slab, not a soft shadow: the same material at 1px. */
  quiet: { radius: "round", motion: "gentle", depth: 1 },
};

/** Fills what the input leaves out from its preset. `strokes` merges entry by entry. */
function withPreset(input: ThemeInput): ThemeInput {
  const preset = PRESETS[input.preset ?? "paper"];
  if (!preset) return input;
  return { ...preset, ...input, strokes: { ...preset.strokes, ...input.strokes } };
}

const positive = (n: unknown): number | undefined =>
  typeof n === "number" && Number.isFinite(n) && n > 0 ? n : undefined;
const px = (n: number) => `${Math.round(n * 100) / 100}px`;
const rem = (pixels: number) => `${Math.round((pixels / 16) * 10000) / 10000}rem`;

function scaleTokens(out: Record<string, string>, names: readonly string[], factor: number | undefined) {
  const f = positive(factor);
  if (f === undefined || f === 1) return;
  for (const name of names) {
    const base = defaults[name as TokenName];
    const inRem = base.endsWith("rem");
    const pixels = Math.max(1, Math.round(parseFloat(base) * (inRem ? 16 : 1) * f));
    out[name] = inRem ? rem(pixels) : px(pixels);
  }
}

type Tone = readonly [soft: TokenName, strong: TokenName, input: "danger" | "warning" | "success"];
/** The status tones a theme input recolours: the soft backdrop, the strong colour it is matched to, and the input. */
const TONES: readonly Tone[] = [
  ["danger-soft", "danger", "danger"],
  ["warning-soft", "warning", "warning"],
  ["success-soft", "success", "success"],
];

/** The hue of a tone's soft backdrop: the default one, turned by as much as the input turns the strong colour. */
function toneHue(soft: TokenName, strong: TokenName, tone?: string): number {
  const hue = toOklch(defaults[soft]).h;
  return tone ? hue + toOklch(tone).h - toOklch(defaults[strong]).h : hue;
}

function deriveStrokes(input: ThemeInput, out: Record<string, string>) {
  const hair = positive(input.strokes?.hair);
  const focus = positive(input.strokes?.focus);
  if (hair !== undefined) {
    out["stroke-hair"] = px(hair);
    out["stroke-card"] = px(hair);
    out["stroke-edge"] = px(Math.max(1, Math.floor(hair * 1.5)));
  }
  if (focus !== undefined) {
    out["stroke-focus"] = px(focus);
  }
}

/** The slab dimension: `depth` in whole pixels, `depth-thin` half of it (never under 1px, so a 1px slab keeps a thin one) and `depth-bold` double. */
function deriveDepth(input: ThemeInput, out: Record<string, string>) {
  const depth = positive(input.depth);
  if (depth === undefined) return;
  const d = Math.max(1, Math.round(depth));
  out["depth"] = px(d);
  out["depth-thin"] = px(Math.max(1, Math.floor(d / 2)));
  out["depth-bold"] = px(d * 2);
}

function shadowRgb(out: Record<string, string>, dark: boolean) {
  const ground = toOklch(out["background"]!);
  const [r, g, b] = parseHex(
    fromOklch({ l: dark ? 0.07 : SHADE_L, c: Math.min(ground.c, dark ? 0.03 : SHADE_MAX_C), h: ground.h }),
  );
  return `${r}, ${g}, ${b}`;
}

/** The scrim is the deep shade of the brand, as the default teal one is of the logo blue, so it follows a theme instead of tinting every brand teal. */
function brandScrim(brand: string) {
  const { c, h } = toOklch(brand);
  const [r, g, b] = parseHex(fromOklch({ l: SHADE_L, c: Math.min(c, SHADE_MAX_C), h }));
  return `rgb(${r} ${g} ${b} / 0.55)`;
}

/** The outline of cards, popovers and paper. Written with `var()` so a `border` or `stroke-card` override, from a theme or from plain CSS, reaches every shadow; only the drop layers are literal. */
const RING = "0 0 0 var(--e-stroke-card) var(--e-border)";

/** The slab under a floating panel: a hard bottom edge twice `depth` deep in the slab ink, as wide as the ring, so the panel reads as a slab lifted off the page. Under `lifted` a card stands on one of `depth`. */
const FLOAT_SLAB = "0 calc(2 * var(--e-depth)) 0 var(--e-stroke-card) var(--e-slab-ink)";
const CARD_SLAB = "0 var(--e-depth) 0 var(--e-stroke-card) var(--e-slab-ink)";

/** The one soft layer each elevation keeps under a floating panel, and the well, in the theme's deep shade: [y, blur, spread, alpha light, alpha dark]. */
const DROP: Record<ElevationPreset, readonly [number, number, number, number, number]> = {
  outline: [12, 32, -8, 0.18, 0.45],
  lifted: [20, 48, -12, 0.24, 0.55],
  bold: [14, 28, -10, 0.22, 0.6],
};

function deriveElevation(style: ElevationPreset, out: Record<string, string>, dark: boolean) {
  out["stroke-card"] = style === "bold" ? "2px" : out["stroke-hair"]!;
  const base = shadowRgb(out, dark);
  const shade = (alpha: number) => `rgba(${base}, ${alpha})`;
  const [y, blur, spread, light, darkAlpha] = DROP[style];
  const bold = style === "bold";
  out["shadow-frame"] = style === "lifted" ? `${RING}, ${CARD_SLAB}` : RING;
  out["shadow-well"] = `inset 0 ${bold ? 3 : 2}px 0 0 ${shade(dark ? 0.36 : bold ? 0.09 : 0.07)}`;
  out["shadow-float"] = `${RING}, ${FLOAT_SLAB}, 0 ${y}px ${blur}px ${spread}px ${shade(dark ? darkAlpha : light)}`;
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

/** The second ground: the brand's own hue at a light touch. The same light touch of colour in both; a grey brand stays grey. */
function groundTint(brand: string, surfaceL: number, dark: boolean) {
  const { h, c } = toOklch(brand);
  return fromOklch({
    l: Math.min(1, Math.max(0, dark ? surfaceL + 0.06 : surfaceL - 0.1)),
    c: Math.min(0.02, c),
    h,
  });
}

function deriveGround(input: ThemeInput, out: Record<string, string>, dark: boolean) {
  const surface = input.surface ?? out["surface"]!;
  if (input.surface) {
    out["surface"] = input.surface;
    const l = toOklch(input.surface).l;
    out["surface-tint"] = groundTint(input.brand ?? out["brand"]!, l, dark);
    for (const [token, hueSource] of [
      ["secondary-soft", toOklch(input.accent ?? defaults["secondary-soft"]).h] as const,
      ...TONES.map(([soft, strong, key]) => [soft, toneHue(soft, strong, input[key])] as const),
    ]) {
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

/** Paper, the selection highlight and the stamp ink: three colours that are not part of the ground but have to hold their own contrast on it. */
function deriveMarks(out: Record<string, string>, dark: boolean) {
  const surface = out["surface"]!;
  const ground = toOklch(surface);
  const paper = fromOklch({
    l: Math.min(1, Math.max(0, dark ? ground.l + 0.025 : ground.l - 0.008)),
    c: dark ? 0.01 : 0.008,
    h: 95,
  });
  out["surface-paper"] = paper;
  fit(out, "surface-paper", paper, [
    [out["ink"]!, 7],
    [out["muted"]!, 4.5],
    [out["border"]!, 3],
  ]);
  const selection = withLightness(surface, dark ? ground.l + 0.25 : ground.l - 0.22, 0.06, toOklch(out["primary"]!).h);
  out["selection"] = selection;
  fit(out, "selection", selection, [
    [out["ink"]!, 4.5],
    [out["muted"]!, 4.5],
  ]);
  out["stamp-ink"] = reachAll(STAMP_INK, [
    [surface, 7],
    [out["surface-paper"]!, 7],
  ]).color;
}

const lookup = (out: Record<string, string>) => (name: string) => out[name];
const hexOf = (out: Record<string, string>, name: string) =>
  resolveColor(out[name] ?? "", lookup(out), resolveColor(out["surface"] ?? "", lookup(out)));

/** The fills that carry text and have a strength to give: the neutral washes (hover, press), judged over `surface`, and `surface` tinted with `brand` (where you are: a selected tab, the current nav item, a calendar range). */
const FEEDBACK: [token: string, pct: number, mix: (pct: number, pigment: string) => string][] = [
  ["wash-hover", 50, (p, pigment) => `color-mix(in srgb, ${pigment} ${p}%, transparent)`],
  ["wash-press", 75, (p, pigment) => `color-mix(in srgb, ${pigment} ${p}%, transparent)`],
  ["primary-soft", 50, (p) => `color-mix(in srgb, var(--e-brand) ${p}%, var(--e-surface))`],
];

/** How far the where-you-are tint may sit from the surface, as a contrast ratio: a pastel brand at half strength. A saturated brand gives up strength until it is no stronger than that, so the tint reads as soft whatever the brand. */
const PLACE_TINT_MAX = 1.35;

/** The colour that, laid over `surface` at 50%, is exactly `surface-tint` (twice the tint's step from the surface). The hover and press washes are made of it, so a hovered row on a plain ground is the tinted ground, and on a ground that is already tinted (a striped row, the track of a segmented control) it goes one step deeper, so there is always something to see. */
function washPigment(out: Record<string, string>) {
  const tint = hexOf(out, "surface-tint");
  const surface = hexOf(out, "surface");
  if (!tint || !surface) return undefined;
  const t = parseHex(tint);
  const s = parseHex(surface);
  return toHex(t.map((v, i) => Math.min(255, Math.max(0, Math.round(2 * v - s[i]!)))) as [number, number, number]);
}

/**
 * The hover, press and selected-row fills, and the hover ring. Each keeps its default strength unless the surface leaves the text no room: then the fill gives up strength until `ink`, `muted` and `primary` hold on it, and the ring takes strength until it holds 3:1 on the surface.
 */
function deriveFeedback(out: Record<string, string>) {
  const surface = hexOf(out, "surface");
  if (!surface) return;
  const text = ["ink", "muted", "primary"].map((name) => [name, hexOf(out, name)] as const);
  const pigment = washPigment(out);
  if (!pigment) return;
  for (const [token, base, mix] of FEEDBACK) {
    for (let pct = base; pct >= 1; pct--) {
      out[token] = mix(pct, pigment);
      const bg = hexOf(out, token);
      if (!bg) return;
      // A tint stays a tint: however saturated the brand, where you are sits no further from the surface than PLACE_TINT_MAX.
      if (token === "primary-soft" && contrast(bg, surface) > PLACE_TINT_MAX) continue;
      const holdsAll = text.every(([name, fg]) => {
        if (!fg) return true;
        const min = name === "ink" ? reachable("ink", 7, bg) : contrast(fg, surface) >= 4.5 ? 4.5 : 0;
        return contrast(fg, bg) >= min;
      });
      if (holdsAll) break;
    }
  }
  for (let pct = 38; pct <= 100; pct++) {
    const value = `color-mix(in srgb, var(--e-ink) ${pct}%, transparent)`;
    const ring = resolveColor(value, lookup(out), surface);
    if (!ring) return;
    if (contrast(ring, surface) >= 3) {
      out["wash-ring"] = value;
      return;
    }
  }
}

/** On a mid-tone surface even the faintest fill leaves the primary colour a hair short, so the primary moves a little further from it. */
function fitFeedback(out: Record<string, string>) {
  const checks: ContrastCheck[] = [];
  for (const name of ["surface", "wash-hover", "wash-press", "primary-soft"]) {
    const hex = hexOf(out, name);
    if (hex) checks.push([hex, 4.5]);
  }
  fitFill(out, "primary", "on-primary", out["primary"]!, checks);
}

function isDark(input: ThemeInput): boolean {
  return input.surface !== undefined && luminance(input.surface) < DARK_BELOW;
}

function derive(input: ThemeInput): Record<string, string> {
  const out: Record<string, string> = { ...defaults };
  const dark = isDark(input);
  if (dark) {
    for (const t of ["on-primary", "on-secondary", "on-danger"]) out[t] = BLACK;
    out["warning"] = input.warning ?? DARK_WARNING;
    out["success"] = input.success ?? DARK_SUCCESS;
    out["scrim"] = "rgb(0 0 0 / 0.7)";
    // Darkening a dark fill is invisible, so hover and press lighten it instead, and the slab goes deeper.
    for (const fill of ["primary", "secondary", "danger"]) {
      out[`${fill}-hover`] = `color-mix(in srgb, var(--e-${fill}), white 12%)`;
      out[`${fill}-press`] = `color-mix(in srgb, var(--e-${fill}), white 20%)`;
      out[`${fill}-slab`] = `color-mix(in srgb, var(--e-${fill}), black 45%)`;
    }
  }
  const dangerBase = input.danger ?? (dark ? DARK_DANGER : undefined);
  if (dangerBase) out["danger"] = reachContrast(dangerBase, out["on-danger"]!, 7);
  if (input.brand) out["brand"] = input.brand;
  if (input.brand && !dark) out["scrim"] = brandScrim(input.brand);
  if (input.brand || dark) out["primary"] = reachContrast(out["brand"]!, out["on-primary"]!, 7);
  if (input.accent) out["brand-accent"] = input.accent;
  if (input.accent || dark) out["secondary"] = reachContrast(out["brand-accent"]!, out["on-secondary"]!, 7);
  if (input.brand && !input.surface) out["surface-tint"] = groundTint(input.brand, 1, false);
  if (input.accent && !input.surface) out["secondary-soft"] = tint(input.accent, 0.96, 0.04);
  deriveGround(input, out, dark);
  if (!input.surface) {
    for (const [token, strong, key] of TONES) {
      const tone = input[key];
      const hue = toneHue(token, strong, tone);
      const base = toOklch(defaults[token]);
      if (tone && hue !== base.h) out[token] = withLightness(defaults[token], base.l, base.c, hue);
    }
  }
  if (input.warning && !dark) out["warning"] = reachContrast(input.warning, out["surface"]!, 7);
  if (input.success && !dark) out["success"] = reachContrast(input.success, out["surface"]!, 7);
  const surface = out["surface"]!;
  if (input.surface) {
    if (!fitFill(out, "primary", "on-primary", out["brand"]!, [[surface, 4.5]])) {
      out["primary"] = reachAll(out["brand"]!, [
        [out["on-primary"]!, 4.5],
        [surface, 4.5],
      ]).color;
    }
    fitTone(out, "secondary", "on-secondary", "secondary-soft", out["brand-accent"]!, surface);
  }
  if (input.surface || input.danger) {
    fitTone(out, "danger", "on-danger", "danger-soft", dangerBase ?? defaults["danger"], surface);
  }
  if (input.surface || input.warning) {
    const base = input.warning ?? (dark ? DARK_WARNING : defaults["warning"]);
    fitTone(out, "warning", undefined, "warning-soft", base, surface);
  }
  if (input.surface || input.success) {
    const base = input.success ?? (dark ? DARK_SUCCESS : defaults["success"]);
    fitTone(out, "success", undefined, "success-soft", base, surface);
  }
  // The outline has to show on the tinted ground as well as on the surface.
  fit(out, "border", out["border"]!, [
    [surface, 3],
    [out["surface-tint"]!, 3],
  ]);
  if (input.fonts?.sans) out["font-sans"] = input.fonts.sans;
  if (input.fonts?.mono) out["font-mono"] = input.fonts.mono;
  if (input.fonts?.script) out["font-script"] = input.fonts.script;
  const radiusBase = typeof input.radius === "number" ? (input.radius === 0 ? 0 : positive(input.radius)) : undefined;
  if (radiusBase !== undefined) {
    out["radius-sm"] = px(radiusBase / 2);
    out["radius-md"] = px(radiusBase);
    out["radius-lg"] = px(radiusBase * 2);
  } else if (input.radius && typeof input.radius !== "number") {
    const r = typeof input.radius === "string" ? RADII[input.radius] : { ...RADII.default, ...input.radius };
    out["radius-sm"] = r.sm;
    out["radius-md"] = r.md;
    out["radius-lg"] = r.lg;
  }
  const compact = input.density === "compact";
  scaleTokens(out, groups.fontSize, input.textScale);
  scaleTokens(out, TEXT_SIZED, input.textScale);
  scaleTokens(out, groups.spacing, (positive(input.spaceScale) ?? 1) * (compact ? COMPACT_SPACE : 1));
  deriveStrokes(input, out);
  deriveDepth(input, out);
  Object.assign(out, MOTION[input.motion ?? "default"]);
  const tap = parseFloat(defaults["tap"]);
  const height = compact ? Math.max(tap, positive(input.controlHeight) ?? tap) : positive(input.controlHeight);
  if (height !== undefined) {
    out["control-height"] = rem(height);
    out["chip-height"] = rem(Math.max(2, Math.round(height / 4) * 2));
  }
  if (
    input.elevation ||
    input.background ||
    input.surface ||
    input.foreground ||
    input.contrast === "high" ||
    positive(input.strokes?.hair) !== undefined
  ) {
    deriveElevation(input.elevation ?? "outline", out, dark);
  }
  deriveFeedback(out);
  deriveMarks(out, dark);
  fitFeedback(out);
  Object.assign(out, input.tokens);
  return out;
}

// Body text asks for 7:1 (AAA). On a mid-grey ground, between about #5c and #95, neither black nor white gets there, so the target is the best that either can give. That is always above the 4.5:1 of AA.
function reachable(fg: string, min: number, ground: string): number {
  if (fg !== "ink" || min < 7) return min;
  return Math.min(min, Math.max(contrast("#000000", ground), contrast("#ffffff", ground)));
}

/** The pairs of `PAIRS` that could not be evaluated: a token that is missing or a value this checker cannot read (another colour space, a function it does not know). They are skipped, and named here rather than passed silently. */
export interface SkippedPair {
  pair: [string, string];
  reason: string;
}

export function checkContrast(tokens: Record<string, string>, skipped?: SkippedPair[]): ContrastIssue[] {
  const issues: ContrastIssue[] = [];
  const get = (name: string) => tokens[name];
  const surface = resolveColor(tokens["surface"] ?? "", get);
  for (const { fg, bg, min, role } of PAIRS) {
    const b = resolveColor(tokens[bg] ?? "", get, surface);
    const a = b === undefined ? undefined : resolveColor(tokens[fg] ?? "", get, b);
    if (a === undefined || b === undefined) {
      const bad = b === undefined ? bg : fg;
      skipped?.push({
        pair: [fg, bg],
        reason: `${bad} is ${tokens[bad] === undefined ? "missing" : `"${tokens[bad]}", which cannot be evaluated`}`,
      });
      continue;
    }
    const ratio = contrast(a, b);
    const needs = reachable(fg, min, b);
    if (ratio < needs)
      issues.push({ pair: [fg, bg], ratio: Math.round(ratio * 100) / 100, min: Math.round(needs * 100) / 100, role });
  }
  return issues;
}

const MEDIA_DARK = "(prefers-color-scheme: dark)";
const MEDIA_MORE = "(prefers-contrast: more)";
const GROUND_INPUTS = ["background", "surface", "foreground"] as const;

/** Under print the page is black on white whatever the theme, so every component prints right without its own fallback. `!important` is what lets it beat the inline tokens `apply()` sets. */
const PRINT = [
  "--e-ink: #000000",
  "--e-muted: #333333",
  "--e-border: #000000",
  "--e-border-strong: #000000",
  "--e-surface: #ffffff",
  "--e-surface-tint: #ffffff",
  "--e-surface-paper: #ffffff",
  "--e-background: #ffffff",
];

/** What a reader who asks for less motion gets. `0.01ms` and not `0` so `transitionend` still fires. Loops are not here: a loop at 0.01ms would flicker, so each loader switches itself off. */
const REDUCED = ["--e-duration-tap: 0.01ms", "--e-duration-fade: 0.01ms", "--e-duration-move: 0.01ms"];

const scheme = (input: ThemeInput): "light" | "dark" =>
  input.scheme === "light" || input.scheme === "dark" ? input.scheme : isDark(input) ? "dark" : "light";

function darkInput(input: ThemeInput): ThemeInput {
  const { dark, ...rest } = input;
  const own = { ...rest, scheme: undefined } as ThemeInput;
  for (const k of GROUND_INPUTS) delete own[k];
  return { surface: DARK_SURFACE, ...own, ...dark, tokens: { ...own.tokens, ...dark?.tokens } };
}

function diff(base: Record<string, string>, full: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(full)) if (base[k] !== v) out[k] = v;
  return out;
}

/** The media-query variants of a theme: dark for `scheme: "auto"`, high contrast for `contrast: "auto"`, and both together. Each carries only the tokens that differ, and the combined one repeats the tokens of the others it must undo. */
function variants(input: ThemeInput, base: Record<string, string>) {
  const auto = input.scheme === "auto";
  const more = input.contrast === "auto";
  const list: { media: string; input: ThemeInput }[] = [];
  const dark = auto ? darkInput(input) : undefined;
  if (dark) list.push({ media: MEDIA_DARK, input: dark });
  if (more) list.push({ media: MEDIA_MORE, input: { ...input, contrast: "high" } });
  if (dark && more) list.push({ media: `${MEDIA_DARK} and ${MEDIA_MORE}`, input: { ...dark, contrast: "high" } });
  const fulls = list.map((v) => derive(v.input));
  const changed = new Set(fulls.flatMap((full) => Object.keys(diff(base, full))));
  const alternates: Alternate[] = list.map((v, i) => {
    const keys = v.media.includes(" and ") ? changed : new Set(Object.keys(diff(base, fulls[i]!)));
    return {
      media: v.media,
      scheme: scheme(v.input),
      tokens: Object.fromEntries([...keys].map((k) => [k, fulls[i]![k]!])),
    };
  });
  return { alternates, fulls };
}

/** The disposer of the theme applied to each element, so a second `apply()` replaces the first. */
const watchers = new WeakMap<HTMLElement, () => void>();

const SCALES = ["textScale", "spaceScale", "controlHeight", "depth"] as const;
const STROKES = ["hair", "focus"] as const;

/** Everything the theme quietly changes or ignores, so a wrong input is not a mystery. */
function inputWarnings(raw: ThemeInput): string[] {
  const out: string[] = [];
  for (const key of SCALES)
    if (raw[key] !== undefined && positive(raw[key]) === undefined)
      out.push(`${key}: ${String(raw[key])} is not a positive number, so it is ignored.`);
  for (const key of STROKES) {
    const v = raw.strokes?.[key];
    if (v !== undefined && positive(v) === undefined)
      out.push(`strokes.${key}: ${String(v)} is not a positive number, so it is ignored.`);
  }
  if (typeof raw.radius === "number" && raw.radius !== 0 && positive(raw.radius) === undefined)
    out.push(`radius: ${String(raw.radius)} is not a positive number, so it is ignored.`);
  const tap = parseFloat(defaults["tap"]);
  if (raw.density === "compact" && positive(raw.controlHeight) !== undefined && raw.controlHeight! < tap)
    out.push(`controlHeight: ${raw.controlHeight} is raised to ${tap}, the tap target, because density is "compact".`);
  if (raw.dark && raw.scheme !== "auto") out.push('dark: ignored because scheme is not "auto".');
  if ((raw.scheme === "light" || raw.scheme === "dark") && raw.surface && isDark(raw) !== (raw.scheme === "dark"))
    out.push(
      `scheme: "${raw.scheme}" only sets color-scheme; the surface ${raw.surface} is ${isDark(raw) ? "dark" : "light"}, so native controls will not match it.`,
    );
  if (raw.preset !== undefined && !(raw.preset in PRESETS))
    out.push(`preset: "${raw.preset}" is not a preset (paper, ink, quiet), so it is ignored.`);
  for (const key of Object.keys(raw.tokens ?? {}))
    if (!(key in defaults)) out.push(`tokens.${key}: not a known token, so it only adds a custom property.`);
  return out;
}

declare const process: { env: Record<string, string | undefined> };

/**
 * True in a production build of the consumer's app. Reads `process.env.NODE_ENV` in full, which bundlers replace with a
 * literal and Node sets at run time. Where nothing replaced it and there is no `process` (a script tag in a browser), the
 * lookup throws and the answer is "not production".
 */
function isProduction(): boolean {
  try {
    return process.env.NODE_ENV === "production";
  } catch {
    return false;
  }
}

const COLOUR_INPUTS = [
  "brand",
  "accent",
  "background",
  "surface",
  "foreground",
  "danger",
  "warning",
  "success",
] as const;

/** The colour inputs as opaque hex. One it cannot read is dropped and reported; alpha is dropped and reported. */
function readColours<T extends ThemeVariant>(raw: T, warnings: string[], prefix = ""): T {
  const out: Record<string, unknown> = { ...raw };
  for (const key of COLOUR_INPUTS) {
    const value = raw[key];
    if (value === undefined) continue;
    const c = typeof value === "string" ? parseColor(value) : undefined;
    if (!c || c.a === 0) {
      delete out[key];
      warnings.push(
        `${prefix}${key}: ${JSON.stringify(value)} is not a colour defineTheme can read (a hex, rgb(), color-mix(in srgb, ...), black or white), so it is ignored.`,
      );
      continue;
    }
    if (c.a < 1) warnings.push(`${prefix}${key}: the alpha of ${value} is dropped; the colour is used opaque.`);
    out[key] = toHex([c.r, c.g, c.b]);
  }
  return out as T;
}

/** The colour inputs of a theme and of its `dark` variant, read. */
function readInput(given: ThemeInput, warnings: string[]): ThemeInput {
  const out = readColours(given, warnings);
  if (given.dark) out.dark = readColours(given.dark, warnings, "dark.");
  return out;
}

/** The `color-scheme` of each theme `defineTheme` built. */
const schemes = new WeakMap<Theme, "light" | "dark">();

/**
 * The inputs of a theme's dark variant, as `scheme: "auto"` derives it: the theme's own inputs without its grounds,
 * with `dark` laid over them and a dark surface (`#10151a`) when `dark` gives none.
 */
export function darkVariant(input: ThemeInput): ThemeInput {
  return darkInput(input);
}

/** The visitor's settings a theme's media-query alternates answer to. */
export interface VariantQuery {
  /** `prefers-color-scheme: dark`. */
  dark?: boolean;
  /** `prefers-contrast: more`. */
  more?: boolean;
}

/**
 * The tokens and `color-scheme` of a theme as the visitor sees it: the base theme with the last of its `alternates`
 * whose queries all hold laid over it. A fixed theme (no `scheme: "auto"` or `contrast: "auto"`) is the same for every
 * query. For a renderer that sets tokens itself, such as inline styles on a scoped element.
 */
export function themeVariant(
  theme: Theme,
  query: VariantQuery = {},
): { tokens: Record<string, string>; colorScheme: "light" | "dark" } {
  const holds = (media: string) =>
    media.split(" and ").every((m) => (m === MEDIA_DARK ? !!query.dark : m === MEDIA_MORE ? !!query.more : false));
  const match = theme.alternates.filter((a) => holds(a.media)).at(-1);
  const base =
    schemes.get(theme) ?? (luminance(hexOf(theme.tokens, "surface") ?? WHITE) < DARK_BELOW ? "dark" : "light");
  return match
    ? { tokens: { ...theme.tokens, ...match.tokens }, colorScheme: match.scheme }
    : { tokens: theme.tokens, colorScheme: base };
}

export function defineTheme(raw: ThemeInput = {}): Theme {
  const warnings: string[] = [];
  const given = readInput(raw, warnings);
  const input = withPreset(given);
  const name = input.name ?? "custom";
  const tokens = derive(input);
  warnings.push(...inputWarnings(given));
  // Tells the browser which way the page leans, so its own controls (scrollbars, colour picker, autofill) match.
  const colorScheme = scheme(input);
  const { alternates, fulls } = variants(input, tokens);
  const skipped: SkippedPair[] = [];
  const issues = checkContrast(tokens, skipped);
  alternates.forEach((a, i) => {
    for (const issue of checkContrast(fulls[i]!)) issues.push({ ...issue, role: `${issue.role} ${a.media}` });
  });
  for (const k of skipped) warnings.push(`Contrast not checked for ${k.pair.join(" on ")}: ${k.reason}.`);
  if (warnings.length && !isProduction()) for (const w of warnings) console.warn(`[eos] defineTheme(${name}): ${w}`);
  if (input.strict && issues.length) {
    throw new Error(
      "Theme fails contrast:\n" +
        issues.map((i) => `  ${i.role}: ${i.pair.join(" on ")} is ${i.ratio}:1, needs ${i.min}:1`).join("\n"),
    );
  }
  const decls = (map: Record<string, string>, indent: string) =>
    Object.entries(map)
      .map(([k, v]) => `${indent}--e-${k}: ${v};`)
      .join("\n");
  const theme: Theme = {
    name,
    tokens,
    issues,
    alternates,
    warnings,
    explain(token) {
      const value = tokens[token];
      if (value === undefined) return `${token}: not a token.`;
      const drivers = (derivedFrom[token] ?? "").split(",").filter(Boolean);
      const lines = [`--e-${token}: ${value}`];
      const hex = resolveColor(
        value,
        (n) => tokens[n],
        tokens["surface"] && resolveColor(tokens["surface"], (n) => tokens[n]),
      );
      if (hex && hex !== value.toLowerCase()) lines.push(`resolves to ${hex}`);
      if (token in (given.tokens ?? {})) lines.push("set explicitly in tokens");
      else if (!drivers.length) lines.push("fixed: no input changes it");
      else {
        const set = drivers.filter((d) => (given as Record<string, unknown>)[d] !== undefined);
        lines.push(`driven by: ${drivers.join(", ")}`);
        lines.push(set.length ? `given here: ${set.join(", ")}` : "none of those given, so this is the default");
      }
      if (usage[token]) lines.push(usage[token]!);
      return lines.join("\n");
    },
    css({ selector = ":root", layer = true, header = false }: CssOptions = {}) {
      const themed = `${selector}, [data-e-theme]`;
      let rules = `${selector} {\n  color-scheme: ${colorScheme};\n${decls(tokens, "  ")}\n}\n`;
      for (const a of alternates)
        rules += `@media ${a.media} {\n  ${selector} {\n    color-scheme: ${a.scheme};\n${decls(a.tokens, "    ")}\n  }\n}\n`;
      rules += `@media (prefers-reduced-motion: reduce) {\n  ${themed} {\n${REDUCED.map((d) => `    ${d} !important;`).join("\n")}\n  }\n}\n`;
      rules += `@media print {\n  ${themed} {\n${PRINT.map((d) => `    ${d} !important;`).join("\n")}\n  }\n}\n`;
      const body = layer ? `@layer e.tokens {\n${rules}}\n` : rules;
      return (header ? `/* Generated from tokens.json. Theme: ${name}. */\n@layer ${LAYER_ORDER};\n` : "") + body;
    },
    dtcg() {
      return toDtcg(tokens);
    },
    apply(el = document.documentElement) {
      watchers.get(el)?.();
      const canMatch = typeof matchMedia === "function";
      const set = new Set<string>();
      const paint = () => {
        // The last variant that matches carries every token the earlier ones changed, so it alone is enough.
        const match = canMatch ? alternates.filter((a) => matchMedia(a.media).matches).at(-1) : undefined;
        for (const [k, v] of Object.entries({ ...tokens, ...match?.tokens })) {
          el.style.setProperty(`--e-${k}`, v);
          set.add(k);
        }
        el.style.colorScheme = match?.scheme ?? colorScheme;
      };
      paint();
      const lists = canMatch ? alternates.map((a) => matchMedia(a.media)) : [];
      for (const l of lists) l.addEventListener("change", paint);
      el.setAttribute("data-e-theme", name);
      const dispose = () => {
        if (watchers.get(el) !== dispose) return;
        watchers.delete(el);
        for (const l of lists) l.removeEventListener("change", paint);
        for (const k of set) el.style.removeProperty(`--e-${k}`);
        el.style.removeProperty("color-scheme");
        el.removeAttribute("data-e-theme");
      };
      watchers.set(el, dispose);
      return dispose;
    },
  };
  schemes.set(theme, colorScheme);
  return theme;
}

export { defaults, groups };
export type { TokenName };
