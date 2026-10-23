import { afterEach, describe, expect, test, vi } from "vitest";
import { useReducedMotion } from "./useReducedMotion.js";

describe("useReducedMotion", () => {
  afterEach(() => vi.unstubAllGlobals());

  test("reads the media query each time it is called", () => {
    let reduce = false;
    vi.stubGlobal("matchMedia", (q: string) => ({ matches: q.includes("reduce") && reduce }));
    const calm = useReducedMotion();
    expect(calm()).toBe(false);
    reduce = true;
    expect(calm()).toBe(true);
  });

  test("says no where there is no matchMedia", () => {
    vi.stubGlobal("matchMedia", undefined);
    expect(useReducedMotion()()).toBe(false);
  });
});
