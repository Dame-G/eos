import { describe, expect, test } from "vitest";
import { checkContrast, contrast, defaults, defineTheme } from "../src/index.js";

describe("the default theme", () => {
  test("keeps every promised contrast pair", () => {
    expect(defineTheme({ name: "light" }).issues).toEqual([]);
  });
  test("emits the layer order and every token", () => {
    const css = defineTheme({ name: "light" }).css({ header: true });
    expect(css).toMatch(/@layer e.reset, e.tokens/);
    for (const k of Object.keys(defaults)) expect(css).toContain(`--e-${k}:`);
  });
  test("white on primary is AAA", () => {
    expect(contrast(defaults["primary"], defaults["on-primary"])).toBeGreaterThanOrEqual(7);
  });
});

describe("defineTheme", () => {
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
});
