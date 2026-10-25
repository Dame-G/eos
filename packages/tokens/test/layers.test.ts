import { describe, expect, test, vi } from "vitest";
import {
  checkContrast,
  contrast,
  defaults,
  defineTheme,
  groups,
  resolveColor,
  type SkippedPair,
} from "../src/index.js";
import tokensJson from "../src/tokens.json";

describe("evaluating colours", () => {
  const t = defineTheme().tokens;
  const get = (n: string) => t[n];
  test("resolves mixes of known tokens, shades and transparency", () => {
    expect(resolveColor("#102030", get)).toBe("#102030");
    expect(resolveColor("var(--e-ink)", get)).toBe("#000000");
    expect(resolveColor("color-mix(in srgb, #ffffff, black 50%)", get)).toBe("#808080");
    expect(resolveColor(t["primary-hover"]!, get)).toMatch(/^#[0-9a-f]{6}$/);
    expect(resolveColor(t["wash-hover"]!, get, "#ffffff")).toBe(t["surface-tint"]);
  });
  test("lays a translucent colour over its ground, and gives up without one", () => {
    expect(resolveColor("color-mix(in srgb, #000000 50%, transparent)", get, "#ffffff")).toBe("#808080");
    expect(resolveColor("color-mix(in srgb, #000000 50%, transparent)", get)).toBeUndefined();
  });
  test("gives up on what it cannot read", () => {
    expect(resolveColor("var(--e-nope)", get)).toBeUndefined();
    expect(resolveColor("oklch(0.5 0.1 200)", get)).toBeUndefined();
  });
  test("a mixed token is checked, not skipped", () => {
    const issues = checkContrast({ ...t, "wash-hover": "color-mix(in srgb, var(--e-ink) 70%, transparent)" });
    expect(issues.some((i) => i.pair.join(">") === "muted>wash-hover")).toBe(true);
  });
  test("a pair it cannot evaluate is reported, not silently passed", () => {
    const skipped: SkippedPair[] = [];
    checkContrast({ ...t, muted: "oklch(0.5 0 0)" }, skipped);
    expect(skipped.some((s) => s.pair[0] === "muted")).toBe(true);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(defineTheme({ tokens: { muted: "oklch(0.5 0 0)" } }).warnings.join("\n")).toMatch(/muted/);
    warn.mockRestore();
  });
  test("the default theme evaluates every pair", () => {
    const skipped: SkippedPair[] = [];
    checkContrast(t, skipped);
    expect(skipped).toEqual([]);
  });
});

describe("feedback colours", () => {
  test("secondary text and primary text hold on the hover, press and selected fills of every ground", () => {
    for (const input of [
      {},
      { surface: "#0f1418" },
      { surface: "#fffdf7", foreground: "#1f1a14" },
      { surface: "#333333", foreground: "#eeeeee" },
      { surface: "#808080" },
      { surface: "#e0e0e0", contrast: "high" as const },
    ]) {
      expect(defineTheme(input).issues, JSON.stringify(input)).toEqual([]);
    }
  });
  test("the hover ring holds 3:1 on the surface, so it is drawn at the strength the ground needs", () => {
    for (const t of [defineTheme().tokens, defineTheme({ surface: "#10151a" }).tokens]) {
      const ring = resolveColor(t["wash-ring"]!, (n) => t[n], t["surface"]);
      expect(contrast(ring!, t["surface"]!)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("token layers", () => {
  const css = defineTheme().css();
  const value = (name: string) => defaults[name as keyof typeof defaults];
  test("sizes that follow the browser's font size are in rem; the tap target is not", () => {
    for (const name of [
      ...groups.fontSize,
      "control-height",
      "chip-height",
      "icon-size-md",
      "container-width-md",
      "term-width",
      "check-size",
      "avatar-size-md",
      "avatar-size-lg",
    ])
      expect(value(name), name).toMatch(/rem$/);
    expect(value("tap")).toBe("44px");
    expect(value("text-md")).toBe("1rem");
  });
  test("the semantic spacing tokens are references to the space scale, so spaceScale and density reach them", () => {
    for (const name of groups.layout) expect(value(name), name).toMatch(/var\(--e-space-\d+\)/);
    expect(defineTheme({ density: "compact" }).tokens["gap-base"]).toBe("var(--e-space-3)");
    expect(defineTheme({ density: "compact" }).tokens["space-4"]).toBe("12px");
  });
  test("tracking and leading scales exist", () => {
    expect(value("tracking-label")).toBe("0.08em");
    expect(value("tracking-tight")).toBe("-0.02em");
    expect([value("leading-tight"), value("leading-snug"), value("leading-normal")]).toEqual(["1.15", "1.3", "1.5"]);
  });
  test("every type style is a token that agrees with its documented size and line-height", () => {
    const styles = tokensJson.type.groups.flatMap((g) => g.styles);
    expect(styles.length).toBe(groups.type.length);
    for (const s of styles) {
      expect(value(`type-${s.name}`), s.name).toContain(`var(--e-${s.size}) / var(--e-leading-${s.leading})`);
      expect(s.fontSize, s.name).toBe(value(s.size));
      expect(s.lineHeight, s.name).toBe(value(`leading-${s.leading}`));
      expect(parseFloat(s.lineHeight), s.name).toBeGreaterThanOrEqual(1);
    }
  });
  test("the slab scale derives from depth, and the ring and panel tokens exist", () => {
    expect(value("depth-thin")).toContain("var(--e-depth)");
    expect(value("depth-bold")).toContain("var(--e-depth)");
    expect(value("shadow-ring-hover")).toContain("var(--e-wash-ring)");
    expect([value("panel-width-sm"), value("panel-width-md"), value("panel-width-lg")]).toEqual([
      "28rem",
      "32rem",
      "36rem",
    ]);
    expect(value("radius-round")).toBe("50%");
  });
  test("motion has a fade step between tap and move, and enter and exit easings", () => {
    expect(parseFloat(value("duration-fade"))).toBeGreaterThan(parseFloat(value("duration-tap")));
    expect(parseFloat(value("duration-fade"))).toBeLessThan(parseFloat(value("duration-move")));
    expect(value("easing-enter")).toMatch(/^cubic-bezier/);
    expect(value("easing-exit")).toMatch(/^cubic-bezier/);
    expect(css).toContain("--e-duration-fade: 0.01ms !important");
  });
  test("tone variants follow one template, darkening on a light surface and lightening on a dark one", () => {
    const shades = { hover: "black 8%", press: "black 16%", slab: "black 30%" };
    const dark = { hover: "white 12%", press: "white 20%", slab: "black 45%" };
    const night = defineTheme({ surface: "#10151a" }).tokens;
    for (const tone of ["primary", "secondary", "danger"])
      for (const suffix of ["hover", "press", "slab"] as const) {
        expect(value(`${tone}-${suffix}`)).toBe(`color-mix(in srgb, var(--e-${tone}), ${shades[suffix]})`);
        expect(night[`${tone}-${suffix}` as keyof typeof night]).toBe(
          `color-mix(in srgb, var(--e-${tone}), ${dark[suffix]})`,
        );
      }
    // The neutral slab is the control edge in every theme, so a sunk state always shows.
    expect(value("slab-ink")).toBe("var(--e-border-strong)");
    expect(night["slab-ink"]).toBe("var(--e-border-strong)");
  });
  test("the removed tokens are gone", () => {
    const names = Object.keys(defaults);
    for (const gone of [
      "surface-raised",
      "surface-sunken",
      "slab",
      "stroke-ring",
      "surface-hover",
      "surface-press",
      "brand-blue",
      "brand-green",
      "easing-standard",
      "leading-loose",
      "space-7",
      "on-info",
      "on-success",
      "on-warning",
      "shade-hover",
      "shade-press",
      "shade-slab",
      "bp-narrow",
      "bp-medium",
      "bp-wide",
    ])
      expect(names, gone).not.toContain(gone);
    expect(Object.values(groups).flat()).not.toContain("shade-hover");
  });
});

describe("presets, warnings and explain", () => {
  test("ink and quiet bundle elevation, strokes, radius and motion, and keep every pair", () => {
    const ink = defineTheme({ preset: "ink" });
    expect(ink.tokens["radius-md"]).toBe("2px");
    expect(ink.tokens["stroke-hair"]).toBe("2px");
    expect(ink.tokens["stroke-focus"]).toBe("3px");
    expect(ink.tokens["duration-tap"]).toBe("50ms");
    expect(ink.tokens["depth"]).toBe("3px");
    expect(ink.tokens["depth-bold"]).toBe("6px");
    expect(ink.tokens["shadow-float"]).toContain("0 calc(2 * var(--e-depth)) 0 var(--e-stroke-card) var(--e-slab-ink)");
    const quiet = defineTheme({ preset: "quiet" });
    expect(quiet.tokens["radius-md"]).toBe("14px");
    expect(quiet.tokens["duration-move"]).toBe("380ms");
    // A quiet slab, not a soft shadow: the same material at 1px.
    expect(quiet.tokens["depth"]).toBe("1px");
    expect(quiet.tokens["depth-thin"]).toBe("1px");
    expect(quiet.tokens["shadow-float"]).toBe(defineTheme().tokens["shadow-float"]);
    for (const preset of ["paper", "ink", "quiet"] as const) {
      expect(defineTheme({ preset }).issues, preset).toEqual([]);
      expect(defineTheme({ preset, surface: "#10151a" }).issues, preset).toEqual([]);
    }
    expect(defineTheme({ preset: "paper" }).tokens).toEqual(defineTheme().tokens);
  });
  test("your own inputs win over the preset, entry by entry", () => {
    const t = defineTheme({ preset: "ink", radius: "round", strokes: { focus: 4 } }).tokens;
    expect(t["radius-md"]).toBe("14px");
    expect(t["stroke-focus"]).toBe("4px");
    expect(t["stroke-hair"]).toBe("2px");
  });
  test("an input that is ignored or adjusted is reported", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const w = defineTheme({
      density: "compact",
      controlHeight: 30,
      textScale: -1,
      strokes: { hair: Number.NaN },
      tokens: { "no-such-token": "1" } as never,
      dark: { surface: "#000000" },
    }).warnings.join("\n");
    expect(w).toMatch(/controlHeight: 30 is raised to 44/);
    expect(w).toMatch(/textScale/);
    expect(w).toMatch(/strokes\.hair/);
    expect(w).toMatch(/no-such-token/);
    expect(w).toMatch(/dark: ignored/);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
    expect(defineTheme().warnings).toEqual([]);
  });
  test("explain says where a token comes from", () => {
    const t = defineTheme({ brand: "#8a2be2", tokens: { ink: "#111111" } });
    expect(t.explain("primary")).toMatch(/driven by: brand, surface[\s\S]*given here: brand/);
    expect(t.explain("ink")).toMatch(/set explicitly in tokens/);
    expect(t.explain("depth")).toMatch(/driven by: depth/);
    expect(t.explain("tap")).toMatch(/fixed/);
    expect(t.explain("wash-hover")).toMatch(/resolves to #/);
    expect(t.explain("nope")).toMatch(/not a token/);
  });
});
