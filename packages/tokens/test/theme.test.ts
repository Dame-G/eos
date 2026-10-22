import { describe, expect, test } from "vitest";
import {
  checkContrast,
  constants,
  contrast,
  defaults,
  defineTheme,
  derivedFrom,
  groups,
  inputTokens,
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
    expect(fixed("#e0e0e0")["primary"]).toBe("#17586d");
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
    expect(l(lightT["surface-tint"]!)).toBeCloseTo(l(light.surface) - 0.045, 1);
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
      expect(contrast(t["border"]!, input.surface)).toBeLessThan(3.6);
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
    expect(contrast(t["warning-strong"]!, t["warning-soft"]!)).toBeGreaterThanOrEqual(4.5);
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
      { danger: defaults["danger"], warning: defaults["warning-strong"] },
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
        expect(contrast(k["warning-strong"]!, k["surface"]!), label).toBeGreaterThanOrEqual(4.5);
        expect(contrast(k["warning-strong"]!, k["warning-soft"]!), label).toBeGreaterThanOrEqual(4.5);
        expect(t.issues, label).toEqual([]);
      }
    }
    expect(changed({ warning: "#c2410c" }).sort()).toEqual(["warning-soft", "warning-strong"]);
  });

  test("textScale and spaceScale scale only their own tokens, in whole pixels", () => {
    const text = defineTheme({ textScale: 1.25 }).tokens;
    expect(changed({ textScale: 1.25 })).toEqual(groups.fontSize);
    expect(text["text-md"]).toBe("20px");
    expect(text["text-xs"]).toBe("15px");
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
    expect(t["focus-gap"]).toBe("4px");
    expect(t["focus-gap-field"]).toBe("calc(-1 * var(--e-stroke-edge))");
    expect(t["edge"]).toBe("0 0 0 2px #7c8c93");
    expect(changed({ strokes: { focus: 3 } }).sort()).toEqual(["focus-gap", "stroke-focus"]);
  });

  test("strokes.edge and strokes.card set their tokens outright", () => {
    const t = defineTheme({ elevation: "bold", strokes: { hair: 2, edge: 2, card: 3 } }).tokens;
    expect(t["stroke-hair"]).toBe("2px");
    expect(t["stroke-edge"]).toBe("2px");
    expect(t["stroke-card"]).toBe("3px");
    expect(t["edge"]).toContain("0 0 0 3px");
    expect(changed({ strokes: { edge: 2 } })).toEqual(["stroke-edge"]);
    expect(defineTheme({ strokes: { edge: 0 } }).tokens).toEqual(base);
  });

  test("contrast high pins lines to the foreground and neutralises the tint", () => {
    const t = defineTheme({ brand: "#0044cc", contrast: "high" }).tokens;
    expect(t["border"]).toBe(t["ink"]);
    expect(t["border-strong"]).toBe(t["ink"]);
    expect(t["scrim"]).toBe("rgb(0 0 0 / 0.75)");
    expect(contrast(t["muted"]!, t["surface"]!)).toBeGreaterThanOrEqual(14.9);
    expect(toOklch(t["surface-tint"]!).c).toBeLessThan(0.005);
    expect(t["edge"]).toContain(t["border"]!);
    expect(defineTheme({ contrast: "standard" }).tokens).toEqual(base);
    expect(defineTheme({ contrast: "high" }).issues).toEqual([]);
    const dark = defineTheme({ surface: "#0f1418", background: "#0a0e11", foreground: "#ffffff", contrast: "high" });
    expect(dark.tokens["border"]).toBe("#ffffff");
    expect(dark.issues).toEqual([]);
  });

  test("motion presets set the three motion tokens", () => {
    expect(changed({ motion: "snappy" }).sort()).toEqual(["duration-move", "duration-tap"]);
    expect(changed({ motion: "none" }).sort()).toEqual(["duration-move", "duration-tap"]);
    expect(changed({ motion: "gentle" }).sort()).toEqual(["duration-move", "duration-tap", "easing-out"]);
    expect(defineTheme({ motion: "none" }).tokens["duration-move"]).toBe("0ms");
  });

  test("the shadow tint comes from the ground, not the brand", () => {
    const plain = defineTheme({ elevation: "lifted" }).tokens["float"];
    expect(defineTheme({ elevation: "lifted", brand: "#e91e63" }).tokens["float"]).toBe(plain);
    expect(plain).toContain("rgba(36, 36, 36,");
    expect(defineTheme({ elevation: "lifted", background: "#f6efe0" }).tokens["float"]).not.toBe(plain);
  });

  test("elevation presets set the shadows from the border and ink", () => {
    const lifted = defineTheme({ elevation: "lifted" }).tokens;
    expect(lifted["edge"]).toBe(
      "0 0 0 1px #7c8c93, 0 1px 2px 0px rgba(36, 36, 36, 0.12), 0 4px 8px -2px rgba(36, 36, 36, 0.08)",
    );
    expect(lifted["float"]!.split("rgba(").length - 1).toBe(4);
    expect(lifted["well"]).toBe(base["well"]);
    expect(changed({ elevation: "lifted" }).sort()).toEqual(["edge", "float"]);
    const bold = defineTheme({ elevation: "bold" }).tokens;
    expect(bold["float"]).toBe(
      "0 0 0 2px #7c8c93, 4px 4px 0 0 rgba(36, 36, 36, 0.32), 0 14px 28px -10px rgba(36, 36, 36, 0.22)",
    );
    expect(changed({ elevation: "bold" }).sort()).toEqual(["edge", "float", "stroke-card", "well"]);
    expect(bold["stroke-card"]).toBe("2px");
    const darkOutline = defineTheme({ ...dark, elevation: "outline" }).tokens;
    expect(darkOutline["edge"]).toContain(darkOutline["border"]!);
    expect(darkOutline["float"]).toContain("0.43)");
    expect(darkOutline["well"]).toBe(defineTheme(dark).tokens["well"]);
  });

  test("controlHeight sets the control and an even chip height", () => {
    expect(changed({ controlHeight: 40 }).sort()).toEqual(["chip-height", "control-height"]);
    expect(defineTheme({ controlHeight: 40 }).tokens["chip-height"]).toBe("20px");
    expect(defineTheme({ controlHeight: 44 }).tokens["chip-height"]).toBe("22px");
    expect(defineTheme({ controlHeight: 53 }).tokens["chip-height"]).toBe("26px");
    expect(defineTheme({ controlHeight: 56 }).tokens["control-height"]).toBe("56px");
  });

  test("explicit tokens win over every new input", () => {
    const t = defineTheme({
      danger: "#e53935",
      textScale: 2,
      motion: "none",
      elevation: "bold",
      controlHeight: 56,
      tokens: { danger: "#111111", "text-md": "17px", "duration-tap": "10ms", float: "none", "chip-height": "30px" },
    }).tokens;
    expect(t["danger"]).toBe("#111111");
    expect(t["text-md"]).toBe("17px");
    expect(t["duration-tap"]).toBe("10ms");
    expect(t["float"]).toBe("none");
    expect(t["chip-height"]).toBe("30px");
  });

  test("strict throws when a derived colour is paired with a failing override", () => {
    expect(() => defineTheme({ danger: "#e53935", tokens: { "on-danger": "#555555" }, strict: true })).toThrow(
      /Danger button label/,
    );
    expect(() => defineTheme({ danger: "#e53935", warning: "#f59e0b", strict: true })).not.toThrow();
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
  });
  test("a token that is only another token is an alias", () => {
    expect(tree.color!["focus-ring"]!.$value).toBe("{color.ink}");
  });
  test("a CSS expression with no DTCG type keeps its string and has no type", () => {
    expect(tree.shadow!["edge"]!.$type).toBeUndefined();
    expect(tree.color!["surface-hover"]!.$type).toBeUndefined();
    expect(typeof tree.color!["surface-hover"]!.$value).toBe("string");
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
