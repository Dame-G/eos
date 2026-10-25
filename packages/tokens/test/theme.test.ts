import { afterEach, describe, expect, test, vi } from "vitest";
import {
  checkContrast,
  constants,
  contrast,
  defaults,
  darkVariant,
  defineTheme,
  derivedFrom,
  groups,
  inputTokens,
  themeInputs,
  themeVariant,
  toOklch,
  type ThemeInput,
} from "../src/index.js";

describe("the default theme", () => {
  test("keeps every promised contrast pair", () => {
    expect(defineTheme({ name: "light" }).issues).toEqual([]);
  });
  test("emits the layer order and every token", () => {
    const css = defineTheme({ name: "light" }).css({ header: true });
    expect(css).toMatch(/@layer e.reset, e.tokens/);
    for (const k of Object.keys(defaults)) expect(css).toContain(`--e-${k}:`);
  });
  test("says the page is light, so native controls are too", () => {
    expect(defineTheme({ name: "light" }).css()).toMatch(/color-scheme: light;/);
  });
  test("white on primary is AAA", () => {
    expect(contrast(defaults["primary"], defaults["on-primary"])).toBeGreaterThanOrEqual(7);
  });
});

describe("defineTheme", () => {
  test("a dark surface sets color-scheme: dark", () => {
    expect(defineTheme({ surface: "#10151a" }).css()).toMatch(/color-scheme: dark;/);
  });
  test("derives a deep action colour from a brand colour so white text reaches 7:1", () => {
    for (const brand of ["#2c95b4", "#f59e0b", "#8bc34a", "#e91e63", "#3f51b5", "#ffd600"]) {
      const t = defineTheme({ brand });
      expect(contrast(t.tokens["primary"]!, "#ffffff"), brand).toBeGreaterThanOrEqual(7);
      expect(t.issues, brand).toEqual([]);
    }
  });
  test("explicit tokens win over derived ones", () => {
    expect(defineTheme({ brand: "#2c95b4", tokens: { primary: "#000080" } }).tokens["primary"]).toBe("#000080");
  });
  test("reports a failing pair, and throws in strict mode", () => {
    const bad = { tokens: { primary: "#9fd3e3" } };
    expect(defineTheme(bad).issues.some((i) => i.pair[0] === "on-primary")).toBe(true);
    expect(() => defineTheme({ ...bad, strict: true })).toThrow(/contrast/);
  });
  test("applies radius presets and fonts", () => {
    const t = defineTheme({ radius: "round", fonts: { sans: "Inter, sans-serif" } });
    expect(t.tokens["radius-md"]).toBe("14px");
    expect(t.tokens["font-sans"]).toBe("Inter, sans-serif");
  });
  test("scopes to a selector", () => {
    expect(defineTheme({ name: "clinic" }).css({ selector: '[data-e-theme="clinic"]' })).toContain(
      '[data-e-theme="clinic"] {',
    );
  });
  test("follows references when checking", () => {
    expect(checkContrast({ ...defaults, "focus-ring": "var(--e-ink)" })).toEqual([]);
  });
  test("an aliased token is checked, not skipped", () => {
    const t = defineTheme().tokens;
    const issues = checkContrast({ ...t, ink: "var(--e-surface)" });
    expect(issues.some((i) => i.pair[0] === "ink" && i.pair[1] === "surface")).toBe(true);
  });
  test("follows a chain of references", () => {
    const t = defineTheme().tokens;
    const issues = checkContrast({ ...t, ink: "var(--e-muted)", muted: "var(--e-surface)" });
    expect(issues.some((i) => i.pair[0] === "ink" && i.pair[1] === "surface")).toBe(true);
  });
  test("checks the focus ring and field outline on every ground", () => {
    const t = defineTheme().tokens;
    for (const token of ["focus-ring", "focus-field"]) {
      const pairs = checkContrast({ ...t, [token]: "#eeeeee" }).map((i) => i.pair.join(">"));
      expect(pairs, token).toEqual(
        expect.arrayContaining([`${token}>surface`, `${token}>surface-tint`, `${token}>background`]),
      );
    }
  });
  test("checks secondary text and outlines on the tinted ground", () => {
    const t = defineTheme().tokens;
    const pairs = checkContrast({ ...t, muted: "#cccccc", border: "#e0e0e0" }).map((i) => i.pair.join(">"));
    expect(pairs).toEqual(expect.arrayContaining(["muted>surface-tint", "border>surface-tint"]));
  });
  test("the outline holds 3:1 on the tinted ground in the default theme", () => {
    const t = defineTheme().tokens;
    expect(contrast(t["border"]!, t["surface-tint"]!)).toBeGreaterThanOrEqual(3);
  });
});

describe("mid-tone surfaces", () => {
  const grey = (v: number) => `#${v.toString(16).padStart(2, "0").repeat(3)}`;
  const surfaces = [0xf0, 0xe0, 0xd0, 0xc0, 0xb0, 0xa0, 0x90, 0x80, 0x70, 0x60, 0x50, 0x40, 0x30, 0x20].map(grey);
  const brands = [undefined, "#e91e63", "#ffd600", "#3f51b5", "#00bcd4", "#8bc34a"];
  // Body text asks for 7:1. Between about #5c and #95 neither black nor white gets there, so there the target is the best of the two.
  const textHasNoRoom = (surface: string) => Math.max(contrast("#000000", surface), contrast("#ffffff", surface)) < 7;

  for (const contrastPreset of ["standard", "high"] as const) {
    for (const brand of brands) {
      test(`every action colour holds on greys from #f0f0f0 to #202020 (${contrastPreset}, brand ${brand ?? "default"})`, () => {
        for (const surface of surfaces) {
          const t = defineTheme({
            surface,
            contrast: contrastPreset,
            ...(brand ? { brand, accent: "#2e7d32", danger: "#c62828", warning: "#f59e0b" } : {}),
          });
          expect(t.issues, `${surface} ${brand}`).toEqual([]);
        }
      });
    }
  }
  test("where no ink can reach 7:1, the ink is the best available, it stays above 4.5:1 and nothing is reported", () => {
    for (const surface of surfaces.filter(textHasNoRoom)) {
      const t = defineTheme({ surface });
      expect(t.issues, surface).toEqual([]);
      expect(contrast(t.tokens["ink"]!, surface), surface).toBeGreaterThan(4.5);
      const best = Math.max(contrast("#000000", surface), contrast("#ffffff", surface));
      expect(contrast(t.tokens["ink"]!, surface), surface).toBeCloseTo(best, 5);
    }
  });
  test("a checked ink that is worse than the best available is still reported", () => {
    const t = defineTheme({ surface: "#808080" });
    const bad = checkContrast({ ...t.tokens, ink: "#6a6a6a" });
    expect(bad.some((i) => i.pair[0] === "ink" && i.pair[1] === "surface")).toBe(true);
  });
  test("the reported cases: #9e9e9e, #808080 and #606060", () => {
    for (const surface of ["#9e9e9e", "#808080", "#606060"]) {
      const t = defineTheme({ surface });
      const { primary, secondary, danger } = t.tokens;
      const on = t.tokens["on-primary"]!;
      expect(contrast(primary!, on), surface).toBeGreaterThanOrEqual(4.5);
      expect(contrast(primary!, surface), surface).toBeGreaterThanOrEqual(4.5);
      expect(contrast(secondary!, t.tokens["on-secondary"]!), surface).toBeGreaterThanOrEqual(4.5);
      expect(contrast(danger!, t.tokens["on-danger"]!), surface).toBeGreaterThanOrEqual(4.5);
    }
  });
  test("a surface that already worked keeps its action colours", () => {
    const fixed = (surface: string) => defineTheme({ surface }).tokens;
    expect(fixed("#e0e0e0")["primary"]).toBe("#005f7c");
    expect(fixed("#20202a")["primary"]).toBe("#3ca1c1");
    expect(fixed("#20202a")["on-primary"]).toBe("#000000");
  });
});

describe("ground inputs", () => {
  const light = {
    background: "#f7f0e3",
    surface: "#fffdf7",
    foreground: "#1f1a14",
    brand: "#b4642c",
    accent: "#6b8e23",
  };
  const dark = {
    background: "#0a0e11",
    surface: "#0f1418",
    foreground: "#ffffff",
    brand: "#4aa3df",
    accent: "#6fd18a",
  };

  test("leaves the default output unchanged apart from the new background token", () => {
    const plain = defineTheme().tokens;
    const { background, ...rest } = plain;
    expect(background).toBe(plain["surface"]);
    expect(rest).toEqual(Object.fromEntries(Object.entries(defaults).filter(([k]) => k !== "background")));
    expect(defineTheme({ brand: "#c2255c" }).tokens["background"]).toBe("#ffffff");
  });

  test("background sets the page ground and only that", () => {
    const t = defineTheme({ background: "#f8f8f8" });
    expect(t.tokens["background"]).toBe("#f8f8f8");
    expect(t.tokens["surface"]).toBe(defaults["surface"]);
    expect(t.tokens["surface-tint"]).toBe(defaults["surface-tint"]);
    expect(t.issues).toEqual([]);
  });

  test("a surface alone brings the page ground with it", () => {
    expect(defineTheme({ surface: "#fffdf7" }).tokens["background"]).toBe("#fffdf7");
  });

  test("surface derives its second ground and the soft backdrops from its lightness", () => {
    const l = (hex: string) => toOklch(hex).l;
    const lightT = defineTheme(light).tokens;
    expect(lightT["surface"]).toBe(light.surface);
    expect(l(lightT["surface-tint"]!)).toBeCloseTo(l(light.surface) - 0.1, 1);
    for (const k of ["secondary-soft", "danger-soft", "warning-soft"])
      expect(l(lightT[k]!)).toBeLessThan(l(light.surface));
    const darkT = defineTheme(dark).tokens;
    expect(l(darkT["surface-tint"]!)).toBeGreaterThan(l(dark.surface));
    for (const k of ["secondary-soft", "danger-soft", "warning-soft"])
      expect(l(darkT[k]!)).toBeGreaterThan(l(dark.surface));
  });

  test("foreground derives muted and the borders to their targets", () => {
    for (const input of [light, dark]) {
      const t = defineTheme(input).tokens;
      expect(t["ink"]).toBe(input.foreground);
      expect(contrast(t["muted"]!, input.surface)).toBeGreaterThanOrEqual(7);
      expect(contrast(t["muted"]!, input.surface)).toBeLessThan(7.3);
      expect(contrast(t["border"]!, input.surface)).toBeGreaterThanOrEqual(3.4);
      expect(contrast(t["border"]!, input.surface)).toBeLessThan(4.6);
      expect(contrast(t["border-strong"]!, input.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(t["border-strong"]!, input.surface)).toBeLessThan(4.7);
    }
  });

  test("a dark surface lifts the action and tone colours and keeps every promised pair", () => {
    for (const input of [light, dark, { surface: "#0f1418" }, { surface: "#333333", foreground: "#eeeeee" }]) {
      expect(defineTheme(input).issues, JSON.stringify(input)).toEqual([]);
    }
    const t = defineTheme(dark).tokens;
    expect(t["on-primary"]).toBe("#000000");
    expect(contrast(t["primary"]!, t["on-primary"]!)).toBeGreaterThanOrEqual(7);
    expect(contrast(t["secondary"]!, t["on-secondary"]!)).toBeGreaterThanOrEqual(7);
    expect(contrast(t["danger"]!, t["on-danger"]!)).toBeGreaterThanOrEqual(7);
    expect(contrast(t["warning"]!, t["warning-soft"]!)).toBeGreaterThanOrEqual(4.5);
  });

  test("a dark surface without a foreground picks white", () => {
    expect(defineTheme({ surface: "#101418" }).tokens["ink"]).toBe("#ffffff");
    expect(defineTheme({ surface: "#fffdf7" }).tokens["ink"]).toBe(defaults["ink"]);
  });

  test("explicit tokens still win over derived ground values", () => {
    expect(defineTheme({ ...dark, tokens: { muted: "#cccccc" } }).tokens["muted"]).toBe("#cccccc");
  });

  test("strict mode throws when the foreground fails on the background or surface", () => {
    expect(() => defineTheme({ background: "#202020", strict: true })).toThrow(/Text on the page/);
    expect(() => defineTheme({ surface: "#ffffff", foreground: "#bbbbbb", strict: true })).toThrow(/contrast/);
    expect(defineTheme({ background: "#202020" }).issues.some((i) => i.pair[1] === "background")).toBe(true);
  });
});

const ICON_BOXES = [
  "icon-size-sm",
  "icon-size-md",
  "icon-size-lg",
  "icon-size-xl",
  "check-size",
  "avatar-size-sm",
  "avatar-size-md",
  "avatar-size-lg",
];

describe("derived inputs", () => {
  const base = defineTheme().tokens;
  const changed = (input: ThemeInput) => {
    const t = defineTheme(input).tokens;
    return Object.keys(t).filter((k) => t[k] !== base[k]);
  };
  const light = { surface: "#fffdf7", foreground: "#1f1a14" };
  const dark = { surface: "#0f1418", foreground: "#ffffff" };

  test("every neutral value reproduces the defaults", () => {
    for (const input of [
      { textScale: 1 },
      { spaceScale: 1 },
      { motion: "default" as const },
      { elevation: "outline" as const },
      { controlHeight: 48 },
      { strokes: { hair: 1, focus: 2 } },
      { strokes: {} },
      { danger: defaults["danger"], warning: defaults["warning"], success: defaults["success"] },
    ]) {
      expect(defineTheme(input).tokens, JSON.stringify(input)).toEqual(base);
    }
  });

  test("danger derives its fill, label and tint, and meets its targets on light and dark surfaces", () => {
    for (const danger of ["#e53935", "#ff6b6b", "#b71c1c", "#ffcdd2", "#d33b30"]) {
      for (const ground of [{}, light, dark]) {
        const t = defineTheme({ ...ground, danger });
        const k = t.tokens;
        const surface = k["surface"]!;
        const label = JSON.stringify({ danger, ground });
        expect(contrast(k["danger"]!, k["on-danger"]!), label).toBeGreaterThanOrEqual(7);
        expect(contrast(k["danger"]!, surface), label).toBeGreaterThanOrEqual(4.5);
        expect(contrast(k["danger"]!, k["danger-soft"]!), label).toBeGreaterThanOrEqual(4.5);
        expect(t.issues, label).toEqual([]);
      }
    }
    expect(defineTheme({ ...dark, danger: "#d33b30" }).tokens["on-danger"]).toBe("#000000");
    expect(changed({ danger: "#1d4ed8" }).sort()).toEqual(["danger", "danger-soft"]);
  });

  test("warning derives its text and tint, and meets its targets on light and dark surfaces", () => {
    for (const warning of ["#f59e0b", "#ffd600", "#ffb300", "#8a5a00"]) {
      for (const ground of [{}, light, dark]) {
        const t = defineTheme({ ...ground, warning });
        const k = t.tokens;
        const label = JSON.stringify({ warning, ground });
        expect(contrast(k["warning"]!, k["surface"]!), label).toBeGreaterThanOrEqual(4.5);
        expect(contrast(k["warning"]!, k["warning-soft"]!), label).toBeGreaterThanOrEqual(4.5);
        expect(t.issues, label).toEqual([]);
      }
    }
    expect(changed({ warning: "#c2410c" }).sort()).toEqual(["warning", "warning-soft"]);
  });

  test("textScale and spaceScale scale only their own tokens, in whole pixels", () => {
    const text = defineTheme({ textScale: 1.25 }).tokens;
    expect(changed({ textScale: 1.25 })).toEqual([...groups.fontSize, ...ICON_BOXES]);
    expect(text["text-md"]).toBe("1.25rem");
    expect(text["text-xs"]).toBe("0.9375rem");
    expect(changed({ spaceScale: 1.5 })).toEqual(groups.spacing);
    expect(defineTheme({ spaceScale: 1.5 }).tokens["space-4"]).toBe("24px");
    expect(defineTheme({ spaceScale: 0.01 }).tokens["space-1"]).toBe("1px");
  });

  test("scale inputs ignore values that are not finite and positive", () => {
    for (const bad of [Number.NaN, Infinity, -Infinity, 0, -2, "2" as unknown as number]) {
      expect(defineTheme({ textScale: bad, spaceScale: bad, controlHeight: bad }).tokens).toEqual(base);
      expect(defineTheme({ strokes: { hair: bad, focus: bad } }).tokens).toEqual(base);
    }
  });

  test("strokes derive the edge, focus gaps and keep the default ratios", () => {
    const t = defineTheme({ strokes: { hair: 2, focus: 4 } }).tokens;
    expect(t["stroke-hair"]).toBe("2px");
    expect(t["stroke-edge"]).toBe("3px");
    expect(t["stroke-focus"]).toBe("4px");
    expect(t["focus-gap"]).toBeUndefined();
    expect(t["stroke-focus-gap-field"]).toBe("calc(-1 * var(--e-stroke-edge))");
    expect(t["stroke-card"]).toBe("2px");
    expect(t["shadow-frame"]).toBe("0 0 0 var(--e-stroke-card) var(--e-border)");
    expect(changed({ strokes: { focus: 3 } }).sort()).toEqual(["stroke-focus"]);
  });

  test("stroke-edge and stroke-card are pinned through tokens", () => {
    const t = defineTheme({
      elevation: "bold",
      strokes: { hair: 2 },
      tokens: { "stroke-edge": "2px", "stroke-card": "3px" },
    }).tokens;
    expect(t["stroke-hair"]).toBe("2px");
    expect(t["stroke-edge"]).toBe("2px");
    expect(t["stroke-card"]).toBe("3px");
    expect(t["shadow-frame"]).toBe("0 0 0 var(--e-stroke-card) var(--e-border)");
  });

  test("contrast high pins lines to the foreground and neutralises the tint", () => {
    const t = defineTheme({ brand: "#0044cc", contrast: "high" }).tokens;
    expect(t["border"]).toBe(t["ink"]);
    expect(t["border-strong"]).toBe(t["ink"]);
    expect(t["scrim"]).toBe("rgb(0 0 0 / 0.75)");
    expect(contrast(t["muted"]!, t["surface"]!)).toBeGreaterThanOrEqual(14.9);
    expect(toOklch(t["surface-tint"]!).c).toBeLessThan(0.005);
    expect(t["shadow-frame"]).toContain("var(--e-border)");
    expect(defineTheme({ contrast: "standard" }).tokens).toEqual(base);
    expect(defineTheme({ contrast: "high" }).issues).toEqual([]);
    const dark = defineTheme({ surface: "#0f1418", background: "#0a0e11", foreground: "#ffffff", contrast: "high" });
    expect(dark.tokens["border"]).toBe("#ffffff");
    expect(dark.issues).toEqual([]);
  });

  test("the scrim is a deep shade of the brand, and black on a dark or high-contrast theme", () => {
    expect(base["scrim"]).toBe("rgb(8 41 50 / 0.55)");
    const rose = defineTheme({ brand: "#e91e63" }).tokens["scrim"]!;
    expect(rose).toMatch(/^rgb\(\d+ \d+ \d+ \/ 0\.55\)$/);
    const [r, , b] = rose.match(/\d+/g)!.map(Number);
    expect(r).toBeGreaterThan(b!);
    expect(defineTheme({ brand: "#e91e63", surface: "#10151a" }).tokens["scrim"]).toBe("rgb(0 0 0 / 0.7)");
    expect(defineTheme({ brand: "#e91e63", contrast: "high" }).tokens["scrim"]).toBe("rgb(0 0 0 / 0.75)");
  });

  test("motion presets set the three motion tokens", () => {
    expect(changed({ motion: "snappy" }).sort()).toEqual(["duration-fade", "duration-move", "duration-tap"]);
    expect(changed({ motion: "gentle" }).sort()).toEqual([
      "duration-fade",
      "duration-move",
      "duration-tap",
      "easing-out",
    ]);
  });

  test("the shadow tint comes from the ground, not the brand", () => {
    const plain = defineTheme({ elevation: "lifted" }).tokens["shadow-drop"];
    expect(defineTheme({ elevation: "lifted", brand: "#e91e63" }).tokens["shadow-drop"]).toBe(plain);
    expect(plain).toContain("rgba(36, 36, 36,");
    expect(defineTheme({ elevation: "lifted", background: "#f6efe0" }).tokens["shadow-drop"]).not.toBe(plain);
  });

  test("elevation presets keep the material: a flush frame or a card slab, and a floating slab with one drop", () => {
    const ring = "0 0 0 var(--e-stroke-card) var(--e-border)";
    const floatSlab = "0 calc(2 * var(--e-depth)) 0 var(--e-stroke-card) var(--e-border)";
    // The default theme is the outline elevation, written out in tokens.json.
    expect(changed({ elevation: "outline" })).toEqual([]);
    expect(base["shadow-float"]).toBe(`${ring}, ${floatSlab}, var(--e-shadow-drop)`);
    expect(base["shadow-drop"]).toBe("0 12px 32px -8px rgba(36, 36, 36, 0.18)");
    const lifted = defineTheme({ elevation: "lifted" }).tokens;
    expect(lifted["shadow-frame"]).toBe(`${ring}, 0 var(--e-depth) 0 var(--e-stroke-card) var(--e-border)`);
    expect(lifted["shadow-float"]).toBe(base["shadow-float"]);
    expect(lifted["shadow-drop"]).toBe("0 20px 48px -12px rgba(36, 36, 36, 0.24)");
    expect(lifted["shadow-well"]).toBe(base["shadow-well"]);
    expect(changed({ elevation: "lifted" }).sort()).toEqual(["shadow-drop", "shadow-frame"]);
    const bold = defineTheme({ elevation: "bold" }).tokens;
    expect(bold["shadow-drop"]).toBe("0 14px 28px -10px rgba(36, 36, 36, 0.22)");
    expect(bold["shadow-well"]).toBe("inset 0 3px 0 0 rgba(36, 36, 36, 0.09)");
    expect(changed({ elevation: "bold" }).sort()).toEqual(["shadow-drop", "shadow-well", "stroke-card"]);
    expect(bold["stroke-card"]).toBe("2px");
    const darkOutline = defineTheme({ ...dark, elevation: "outline" }).tokens;
    expect(darkOutline["shadow-frame"]).toBe(ring);
    expect(darkOutline["shadow-drop"]).toContain("0.45)");
    expect(darkOutline["shadow-well"]).toBe(defineTheme(dark).tokens["shadow-well"]);
  });

  test("every shadow of a theme is drawn in one shade, the well too", () => {
    for (const input of [{}, { background: "#f6efe0" }, dark, { elevation: "bold" as const }]) {
      const t = defineTheme({ elevation: "outline", ...input }).tokens;
      const shades = new Set(
        [...(t["shadow-well"]! + " " + t["shadow-drop"]!).matchAll(/rgba\((\d+, \d+, \d+),/g)].map((m) => m[1]),
      );
      expect(shades.size, JSON.stringify(input)).toBe(1);
    }
  });

  test("depth sets the slab and derives the thin and bold slabs in whole pixels", () => {
    expect(changed({ depth: 3 }).sort()).toEqual(["depth", "depth-bold", "depth-thin"]);
    expect(defineTheme({ depth: 3 }).tokens["depth-thin"]).toBe("1px");
    expect(defineTheme({ depth: 4 }).tokens["depth-thin"]).toBe("2px");
    expect(defineTheme({ depth: 1 }).tokens["depth-bold"]).toBe("2px");
  });

  test("controlHeight sets the control and an even chip height", () => {
    expect(changed({ controlHeight: 40 }).sort()).toEqual(["chip-height", "control-height"]);
    expect(defineTheme({ controlHeight: 40 }).tokens["chip-height"]).toBe("1.25rem");
    expect(defineTheme({ controlHeight: 44 }).tokens["chip-height"]).toBe("1.375rem");
    expect(defineTheme({ controlHeight: 53 }).tokens["chip-height"]).toBe("1.625rem");
    expect(defineTheme({ controlHeight: 56 }).tokens["control-height"]).toBe("3.5rem");
  });

  test("explicit tokens win over every new input", () => {
    const t = defineTheme({
      danger: "#e53935",
      textScale: 2,
      motion: "snappy",
      elevation: "bold",
      controlHeight: 56,
      tokens: {
        danger: "#111111",
        "text-md": "17px",
        "duration-tap": "10ms",
        "shadow-float": "none",
        "chip-height": "30px",
      },
    }).tokens;
    expect(t["danger"]).toBe("#111111");
    expect(t["text-md"]).toBe("17px");
    expect(t["duration-tap"]).toBe("10ms");
    expect(t["shadow-float"]).toBe("none");
    expect(t["chip-height"]).toBe("30px");
  });

  test("strict throws when a derived colour is paired with a failing override", () => {
    expect(() => defineTheme({ danger: "#e53935", tokens: { "on-danger": "#555555" }, strict: true })).toThrow(
      /Danger button label/,
    );
    expect(() => defineTheme({ danger: "#e53935", warning: "#f59e0b", strict: true })).not.toThrow();
  });
});

describe("scheme, contrast and density", () => {
  test("the default theme derives to exactly the defaults", () => {
    expect(defineTheme().tokens).toEqual({ ...defaults });
  });
  test("the baked colours are what the default brand and accent derive", () => {
    expect(defineTheme({ brand: defaults["brand"], accent: defaults["brand-accent"] }).tokens).toEqual({ ...defaults });
  });
  test("scheme auto emits the dark tokens inside prefers-color-scheme and keeps the light ones at the root", () => {
    const t = defineTheme({ scheme: "auto", brand: "#8a2be2" });
    const css = t.css();
    expect(css).toMatch(/:root \{\n {2}color-scheme: light;/);
    expect(css).toMatch(/@media \(prefers-color-scheme: dark\) \{\n {2}:root \{\n {4}color-scheme: dark;/);
    expect(t.alternates).toHaveLength(1);
    const dark = t.alternates[0]!;
    expect(dark.scheme).toBe("dark");
    expect(contrast(dark.tokens["ink"]!, dark.tokens["surface"]!)).toBeGreaterThanOrEqual(7);
    expect(dark.tokens["on-primary"]).toBe("#000000");
    expect(t.tokens["surface"]).toBe(defaults["surface"]);
    expect(t.issues).toEqual([]);
  });
  test("the dark variant does not inherit a light ground, but takes its own", () => {
    const t = defineTheme({ scheme: "auto", surface: "#fffdf7", foreground: "#1f1a14", dark: { surface: "#0b0f14" } });
    const dark = t.alternates[0]!.tokens;
    expect(dark["surface"]).toBe("#0b0f14");
    expect(dark["ink"]).toBe("#ffffff");
    expect(t.tokens["surface"]).toBe("#fffdf7");
  });
  test("a fixed theme has no media variants", () => {
    expect(defineTheme().alternates).toEqual([]);
    expect(defineTheme({ surface: "#10151a" }).css()).not.toMatch(/prefers-color-scheme/);
  });
  test("scheme light or dark only sets color-scheme", () => {
    expect(defineTheme({ scheme: "dark" }).css()).toMatch(/color-scheme: dark;/);
    expect(defineTheme({ scheme: "light", surface: "#10151a" }).css()).toMatch(/color-scheme: light;/);
  });
  test("contrast auto adds the high-contrast tokens under prefers-contrast: more", () => {
    const t = defineTheme({ contrast: "auto" });
    expect(t.tokens).toEqual(defineTheme().tokens);
    expect(t.alternates.map((a) => a.media)).toEqual(["(prefers-contrast: more)"]);
    expect(t.alternates[0]!.tokens["border"]).toBe(t.tokens["ink"]);
    expect(t.css()).toMatch(/@media \(prefers-contrast: more\)/);
  });
  test("auto scheme and auto contrast together add a combined variant that undoes the others", () => {
    const t = defineTheme({ scheme: "auto", contrast: "auto" });
    expect(t.alternates.map((a) => a.media)).toEqual([
      "(prefers-color-scheme: dark)",
      "(prefers-contrast: more)",
      "(prefers-color-scheme: dark) and (prefers-contrast: more)",
    ]);
    const [dark, more, both] = t.alternates.map((a) => a.tokens);
    for (const k of [...Object.keys(dark!), ...Object.keys(more!)]) expect(both, k).toHaveProperty(k);
    expect(both!["border"]).toBe(both!["ink"]);
    expect(t.issues).toEqual([]);
  });
  test("a failing variant is reported with its media query, and strict throws", () => {
    const bad = { scheme: "auto" as const, dark: { tokens: { primary: "#17586d" } } };
    expect(defineTheme(bad).issues.some((i) => i.role.includes("prefers-color-scheme"))).toBe(true);
    expect(() => defineTheme({ ...bad, strict: true })).toThrow(/contrast/);
  });
  test("every theme sets the durations to 0.01ms under reduced motion and prints black on white", () => {
    const css = defineTheme({ motion: "gentle" }).css();
    expect(css).toMatch(
      /prefers-reduced-motion: reduce\) \{\n {2}:root, \[data-e-theme\] \{\n {4}--e-duration-tap: 0.01ms !important;\n {4}--e-duration-fade: 0.01ms !important;\n {4}--e-duration-move: 0.01ms !important;/,
    );
    expect(css).toMatch(/@media print \{[^}]*--e-ink: #000000 !important;[^}]*--e-surface: #ffffff !important;/);
    expect(defineTheme({ motion: "snappy" }).css()).toMatch(/--e-duration-tap: 50ms;/);
  });
  test("a dark page prints in the light palette: every token the dark variant changes is set back", () => {
    const t = defineTheme({ scheme: "auto" });
    const print = /@media print \{\n {2}[^{]+\{([^}]*)\}/.exec(t.css())![1]!;
    for (const k of Object.keys(t.alternates[0]!.tokens)) expect(print, k).toContain(`--e-${k}: `);
    expect(print).toContain(`--e-primary-soft: ${t.tokens["primary-soft"]} !important;`);
    expect(print).toContain("color-scheme: light;");
    // A theme that is dark itself prints on white, with an action colour that holds against it.
    const dark = defineTheme({ scheme: "dark", surface: "#10151a" });
    expect(dark.css()).toMatch(/@media print \{[^}]*--e-surface: #ffffff !important;/);
    expect(dark.css()).not.toMatch(
      new RegExp(`@media print \\{[^}]*--e-primary-soft: ${dark.tokens["primary-soft"]} !important`),
    );
  });
  test("loop durations are left alone under reduced motion", () => {
    expect(defineTheme().css()).not.toMatch(/--e-duration-loop: 0.01ms/);
  });
  test("density compact tightens space, sets controls to the tap size and keeps chips even", () => {
    const t = defineTheme({ density: "compact" }).tokens;
    expect(t["space-4"]).toBe("12px");
    expect(t["control-height"]).toBe("2.75rem");
    expect(t["chip-height"]).toBe("1.375rem");
    expect(defineTheme({ density: "compact", controlHeight: 30 }).tokens["control-height"]).toBe("2.75rem");
    expect(defineTheme({ density: "compact", spaceScale: 2 }).tokens["space-4"]).toBe("24px");
    expect(defineTheme({ density: "comfortable" }).tokens).toEqual(defineTheme().tokens);
  });
  test("icon, check and avatar boxes follow textScale", () => {
    const t = defineTheme({ textScale: 1.5 }).tokens;
    expect(t["icon-size-md"]).toBe("1.875rem");
    expect(t["check-size"]).toBe("2.25rem");
    expect(t["avatar-size-lg"]).toBe("6rem");
    expect(defineTheme({ spaceScale: 2 }).tokens["icon-size-md"]).toBe("1.25rem");
  });
  test("the script font follows fonts.script", () => {
    expect(defineTheme({ fonts: { script: "Caveat, cursive" } }).tokens["font-script"]).toBe("Caveat, cursive");
  });
  test("selection, paper and stamp ink hold their contrast on every kind of surface", () => {
    const best = (c: string) => Math.max(contrast("#000000", c), contrast("#ffffff", c));
    for (const surface of ["#ffffff", "#fffdf7", "#10151a", "#808080", "#5c5c5c", "#999999", "#2c3e50"]) {
      const t = defineTheme({ surface }).tokens;
      expect(contrast(t["ink"]!, t["selection"]!), surface).toBeGreaterThanOrEqual(
        Math.min(4.5, best(t["selection"]!)),
      );
      expect(contrast(t["ink"]!, t["surface-paper"]!), surface).toBeGreaterThanOrEqual(
        Math.min(7, best(t["surface-paper"]!)),
      );
      expect(contrast(t["stamp-ink"]!, t["surface"]!), surface).toBeGreaterThanOrEqual(
        Math.min(7, best(t["surface"]!)),
      );
    }
  });
  test("the paper shadow is the frame ring and the well", () => {
    for (const elevation of ["outline", "lifted", "bold"] as const)
      expect(defineTheme({ elevation }).tokens["shadow-paper"], elevation).toBe(
        "0 0 0 var(--e-stroke-card) var(--e-border), var(--e-shadow-well)",
      );
  });
  test("the frame, float and paper rings follow border and stroke-card, so an override in CSS reaches them", () => {
    const ring = "0 0 0 var(--e-stroke-card) var(--e-border)";
    for (const input of [
      {},
      { elevation: "lifted" as const },
      { elevation: "bold" as const },
      { surface: "#10151a" },
      { contrast: "high" as const },
      { foreground: "#3b2f2f", strokes: { hair: 2 } },
      { tokens: { border: "#ff0000", "stroke-card": "3px" } },
    ]) {
      const t = defineTheme(input).tokens;
      for (const name of ["shadow-frame", "shadow-float", "shadow-paper"]) {
        expect(t[name]!.startsWith(ring), `${name} ${JSON.stringify(input)}`).toBe(true);
        expect(t[name], name).not.toMatch(/0 0 0 \d+px #/);
      }
    }
    expect(defaults["shadow-frame"]).toBe(ring);
  });
  test("the information tone reads the same through its alias", () => {
    const t = defineTheme({ brand: "#8a2be2", accent: "#2e7d32" }).tokens;
    expect(t["info"]).toBe("var(--e-primary)");
    expect(checkContrast(t).filter((i) => ["info", "success", "warning", "link"].includes(i.pair[0]))).toEqual([]);
  });
  test("z-index tokens rise in the order they are listed, with the skip link on top", () => {
    const values = groups.zIndex.map((z) => Number(defaults[z]));
    expect(values).toEqual([...values].sort((a, b) => a - b));
    expect(groups.zIndex.at(-1)).toBe("z-skip");
  });
  test("the spacing scale has the steps 1 to 6, 8, 10, 12 and 16", () => {
    for (const n of [1, 2, 3, 4, 5, 6, 8, 10, 12, 16]) expect(groups.spacing).toContain(`space-${n}`);
    expect(groups.spacing).not.toContain("space-7");
  });
  test("renamed and removed tokens are gone", () => {
    for (const gone of [
      "edge",
      "focus-gap",
      "print-ink",
      "print-paper",
      "icon-size",
      "text-link",
      "warning-strong",
      "frame",
      "well",
      "float",
      "paper",
      "slab-sink",
      "ring-hover",
      "ring-press",
      "slab-thin",
      "slab-bold",
      "focus-gap-field",
      "underline-offset",
      "size-panel-sm",
      "size-list-max",
    ])
      expect(Object.keys(defaults)).not.toContain(gone);
    expect(Object.keys(defaults)).toContain("shadow-frame");
  });
});

describe("token metadata", () => {
  test("every token is derived, an input, or a constant, and constants are never derived", () => {
    for (const name of Object.keys(defaults)) {
      if (constants.includes(name)) expect(derivedFrom[name], name).toBeUndefined();
      else if (!inputTokens.includes(name)) expect(derivedFrom[name] ?? "", name).not.toBe("");
    }
    for (const z of groups.zIndex) expect(constants).toContain(z);
    expect(derivedFrom["danger"]).toBe("danger,surface");
  });
  test("themeInputs lists every input of ThemeInput, each with its doc comment and type", () => {
    // Type-checked both ways: a missing or an extra key here fails `pnpm typecheck`.
    const keys: Record<keyof ThemeInput, true> = {
      name: true,
      brand: true,
      accent: true,
      background: true,
      surface: true,
      foreground: true,
      danger: true,
      warning: true,
      success: true,
      fonts: true,
      radius: true,
      textScale: true,
      spaceScale: true,
      strokes: true,
      contrast: true,
      scheme: true,
      dark: true,
      density: true,
      motion: true,
      elevation: true,
      preset: true,
      depth: true,
      controlHeight: true,
      tokens: true,
      strict: true,
    };
    expect(themeInputs.map((i) => i.name).sort()).toEqual(Object.keys(keys).sort());
    for (const input of themeInputs) {
      expect(input.doc, input.name).not.toBe("");
      expect(input.type, input.name).not.toBe("");
    }
    expect(themeInputs.find((i) => i.name === "contrast")!.type).toBe('"standard" | "high" | "auto"');
  });
});

describe("dtcg", () => {
  const tree = defineTheme({ name: "light" }).dtcg();
  test("groups tokens by kind and types the ones a design tool understands", () => {
    expect(tree.color!["primary"]).toMatchObject({ $type: "color", $value: defaults["primary"] });
    expect(tree.spacing!["space-2"]).toMatchObject({ $type: "dimension", $value: "8px" });
    expect(tree.duration!["duration-tap"]).toMatchObject({ $type: "duration" });
    expect(tree.easing!["easing-out"]).toMatchObject({ $type: "cubicBezier", $value: [0.2, 0.8, 0.2, 1] });
    expect(tree.zIndex!["z-modal"]!.$type).toBe("number");
    expect(tree.font!["font-sans"]!.$type).toBe("fontFamily");
    expect(tree.weight!["weight-strong"]).toMatchObject({ $type: "fontWeight", $value: 600 });
  });
  test("a token that is only another token is an alias", () => {
    expect(tree.color!["focus-ring"]!.$value).toBe("{color.ink}");
  });
  test("a CSS expression with no DTCG type keeps its string and has no type", () => {
    expect(tree.shadow!["shadow-frame"]!.$type).toBeUndefined();
    expect(tree.color!["wash-hover"]!.$type).toBeUndefined();
    expect(typeof tree.color!["wash-hover"]!.$value).toBe("string");
  });
  test("carries the usage note as the description, and every token appears once", () => {
    expect(tree.color!["primary"]!.$description).toMatch(/Action blue/);
    const count = Object.values(tree).reduce((n, g) => n + Object.keys(g).length, 0);
    expect(count).toBe(Object.keys(defineTheme({ name: "light" }).tokens).length);
  });
  test("follows the theme: a custom brand changes the exported colour", () => {
    const custom = defineTheme({ brand: "#8a2be2" }).dtcg();
    expect(custom.color!["primary"]!.$value).not.toBe(tree.color!["primary"]!.$value);
  });
});

const silent = <T>(fn: () => T): T => {
  const warn = console.warn;
  console.warn = () => {};
  try {
    return fn();
  } finally {
    console.warn = warn;
  }
};

describe("brand, wash and tone tokens", () => {
  const t = defineTheme().tokens;
  test("a removed name in tokens only adds a custom property", () => {
    const theme = silent(() => defineTheme({ tokens: { "surface-hover": "#eeeeee" } as never }));
    expect(theme.warnings.join("\n")).toMatch(/tokens\.surface-hover: not a known token/);
  });
  test("the brand inputs set brand and brand-accent", () => {
    const b = defineTheme({ brand: "#8a2be2", accent: "#2e7d32" }).tokens;
    expect(b["brand"]).toBe("#8a2be2");
    expect(b["brand-accent"]).toBe("#2e7d32");
  });
  test("the hover and press washes are the one contrast-fitted pair", () => {
    expect(t["wash-hover"]).toBe("color-mix(in srgb, #a1c3d1 50%, transparent)");
    expect(t["wash-press"]).toBe("color-mix(in srgb, #a1c3d1 75%, transparent)");
    const grey = defineTheme({ surface: "#808080" });
    expect(grey.issues).toEqual([]);
  });
  test("each tone is checked once, through the name components use", () => {
    const issues = checkContrast({ ...t, warning: "#fdf3dc", success: "#e8f5e1" });
    for (const role of ["Warning notice text", "Success notice text"])
      expect(issues.filter((i) => i.role === role).length, role).toBe(1);
  });
  test("type-button is a sans style and type-meta is a mono one", () => {
    expect(t["type-button"]).toContain("var(--e-font-sans)");
    expect(t["type-meta"]).toBe("var(--e-weight-medium) var(--e-text-xs) / var(--e-leading-tight) var(--e-font-mono)");
    expect(groups.type.indexOf("type-button")).toBeLessThan(groups.type.indexOf("type-kicker"));
  });
  test("easing-linear is plain linear, and the shell, underline and row tokens exist", () => {
    expect(t["easing-linear"]).toBe("linear");
    expect(t["shell-width"]).toBe("72rem");
    expect(t["shell-rail"]).toBe("var(--e-border)");
    expect(t["stroke-underline-offset"]).toBe("0.25em");
    expect(t["radius-row"]).toBe("max(0px, calc(var(--e-radius-md) - var(--e-pad-inset)))");
  });
});

describe("theming API shorthands", () => {
  test("radius takes one base number: sm is half of it and lg double", () => {
    const t = defineTheme({ radius: 6 }).tokens;
    expect([t["radius-sm"], t["radius-md"], t["radius-lg"]]).toEqual(["3px", "6px", "12px"]);
    expect(defineTheme({ radius: 0 }).tokens["radius-md"]).toBe("0px");
    const bad = silent(() => defineTheme({ radius: -4 }));
    expect(bad.tokens["radius-md"]).toBe(defaults["radius-md"]);
    expect(bad.warnings.join("\n")).toMatch(/radius: -4/);
    expect(defineTheme({ radius: "round" }).tokens["radius-md"]).toBe("14px");
    expect(defineTheme({ radius: { md: "10px" } }).tokens["radius-md"]).toBe("10px");
  });
  test("strokes needs only hair and focus: they derive the edge and card", () => {
    const t = defineTheme({ strokes: { hair: 2, focus: 3 } });
    expect(t.warnings).toEqual([]);
    expect([t.tokens["stroke-hair"], t.tokens["stroke-edge"], t.tokens["stroke-card"]]).toEqual(["2px", "3px", "2px"]);
    expect(defineTheme({ preset: "ink" }).warnings).toEqual([]);
  });
});

describe("the success tone", () => {
  const light = { surface: "#fffdf7", foreground: "#1f1a14" };
  const dark = { surface: "#0f1418", foreground: "#ffffff" };
  test("an accent recolours the secondary action, not the success tone", () => {
    const t = defineTheme({ accent: "#e0218a" }).tokens;
    expect(t["success"]).toBe(defaults["success"]);
    expect(t["success-soft"]).toBe(defaults["success-soft"]);
    expect(t["secondary"]).not.toBe(defaults["secondary"]);
  });
  test("success derives its text and tint, and meets its targets on light and dark surfaces", () => {
    for (const success of ["#2e7d32", "#00c853", "#a5d6a7", "#0f766e"]) {
      for (const ground of [{}, light, dark]) {
        const t = defineTheme({ ...ground, success });
        const k = t.tokens;
        const label = JSON.stringify({ success, ground });
        expect(contrast(k["success"]!, k["surface"]!), label).toBeGreaterThanOrEqual(4.5);
        expect(contrast(k["success"]!, k["success-soft"]!), label).toBeGreaterThanOrEqual(4.5);
        expect(t.issues, label).toEqual([]);
      }
    }
    const base = defineTheme().tokens;
    const t = defineTheme({ success: "#0f766e" }).tokens;
    expect(
      Object.keys(t)
        .filter((k) => t[k] !== base[k])
        .sort(),
    ).toEqual(["success", "success-soft"]);
  });
  test("every preset keeps every pair in light, dark and high contrast, with a brand and accent of any hue", () => {
    for (const preset of ["paper", "ink", "quiet"] as const)
      for (const contrastPreset of ["standard", "high", "auto"] as const)
        for (const ground of [{}, light, dark, { surface: "#808080" }]) {
          const input = { preset, contrast: contrastPreset, brand: "#8a2be2", accent: "#e0218a", ...ground };
          expect(defineTheme(input).issues, JSON.stringify(input)).toEqual([]);
          expect(defineTheme({ ...input, scheme: "auto" }).issues, JSON.stringify(input)).toEqual([]);
        }
  });
});

describe("colour inputs", () => {
  const quiet = <T>(fn: () => T): T => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      return fn();
    } finally {
      warn.mockRestore();
    }
  };
  test("takes 4 and 8 digit hex, rgb(), color-mix() and black or white", () => {
    const hex = defineTheme({ brand: "#8a2be2" }).tokens;
    for (const brand of ["#8a2be2ff", "rgb(138 43 226)", "rgb(138, 43, 226)", "rgba(138, 43, 226, 1)"])
      expect(defineTheme({ brand }).tokens["primary"], brand).toBe(hex["primary"]);
    expect(defineTheme({ brand: "#f0a" }).tokens["brand"]).toBe("#ff00aa");
    expect(defineTheme({ brand: "#f0af" }).tokens["brand"]).toBe("#ff00aa");
    expect(defineTheme({ surface: "black" }).tokens["surface"]).toBe("#000000");
    expect(defineTheme({ brand: "color-mix(in srgb, #ff0000, #0000ff)" }).tokens["brand"]).toBe("#800080");
  });
  test("drops alpha and says so", () => {
    const t = quiet(() => defineTheme({ brand: "#8a2be280" }));
    expect(t.tokens["brand"]).toBe("#8a2be2");
    expect(t.warnings.join("\n")).toMatch(/brand: the alpha of #8a2be280 is dropped/);
  });
  test("ignores a colour it cannot read and reports it, instead of throwing", () => {
    const t = quiet(() =>
      defineTheme({
        brand: "rebeccapurple",
        surface: "oklch(0.2 0 0)",
        accent: "transparent",
        scheme: "auto",
        dark: { surface: "nope" },
      }),
    );
    expect(t.tokens).toEqual(defineTheme().tokens);
    const w = t.warnings.join("\n");
    for (const key of ["brand", "surface", "accent", "dark.surface"]) expect(w).toContain(`${key}: "`);
  });
});

describe("variants and apply", () => {
  afterEach(() => vi.unstubAllGlobals());
  const fakeElement = () => {
    const props = new Map<string, string>();
    const attrs = new Map<string, string>();
    return {
      props,
      attrs,
      style: {
        colorScheme: "",
        setProperty: (k: string, v: string) => props.set(k, v),
        removeProperty: (k: string) => props.delete(k),
      },
      setAttribute: (k: string, v: string) => attrs.set(k, v),
      removeAttribute: (k: string) => attrs.delete(k),
    };
  };
  test("themeVariant lays the alternate that matches the query over the base", () => {
    const theme = defineTheme({ scheme: "auto", contrast: "auto" });
    expect(themeVariant(theme)).toEqual({ tokens: theme.tokens, colorScheme: "light" });
    const night = themeVariant(theme, { dark: true });
    expect(night.colorScheme).toBe("dark");
    expect(night.tokens).toEqual(defineTheme(darkVariant({})).tokens);
    expect(themeVariant(theme, { more: true }).tokens).toEqual(defineTheme({ contrast: "high" }).tokens);
    expect(themeVariant(defineTheme({ surface: "#10151a" }), { dark: false }).colorScheme).toBe("dark");
  });
  test("apply works without matchMedia, and its disposer removes what it set", () => {
    vi.stubGlobal("matchMedia", undefined);
    const el = fakeElement();
    const dispose = defineTheme({ name: "t", contrast: "auto" }).apply(el as never);
    expect(el.props.get("--e-primary")).toBe(defaults["primary"]);
    expect(el.attrs.get("data-e-theme")).toBe("t");
    dispose();
    expect(el.props.size).toBe(0);
    expect(el.attrs.has("data-e-theme")).toBe(false);
  });
  test("apply follows the media queries until it is disposed of", () => {
    const listeners = new Set<() => void>();
    let dark = false;
    vi.stubGlobal("matchMedia", (media: string) => ({
      get matches() {
        return media.includes("dark") && dark;
      },
      addEventListener: (_: string, fn: () => void) => listeners.add(fn),
      removeEventListener: (_: string, fn: () => void) => listeners.delete(fn),
    }));
    const el = fakeElement();
    const dispose = defineTheme({ scheme: "auto" }).apply(el as never);
    expect(el.props.get("--e-surface")).toBe("#ffffff");
    dark = true;
    for (const fn of listeners) fn();
    expect(el.props.get("--e-surface")).toBe(darkVariant({}).surface);
    expect(el.style.colorScheme).toBe("dark");
    dispose();
    expect(listeners.size).toBe(0);
    expect(el.props.size).toBe(0);
  });
});

describe("development warnings", () => {
  test("are not printed in production", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.stubEnv("NODE_ENV", "production");
    try {
      expect(defineTheme({ textScale: -1 }).warnings.length).toBe(1);
      expect(warn).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllEnvs();
      warn.mockRestore();
    }
  });
});
