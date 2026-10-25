import { describe, expect, test } from "vitest";
import { fold, foldedRange } from "./fold.js";

describe("fold", () => {
  test("lower-cases and drops accents, composed or not", () => {
    expect(fold("Café ZÜRICH")).toBe("cafe zurich");
    expect(fold("Café")).toBe("cafe");
  });

  test("finds a range in the original text", () => {
    expect(foldedRange("Café au lait", "CAFE")).toEqual([0, 4]);
    expect(foldedRange("Café au lait", "cafe")).toEqual([0, 5]);
    expect(foldedRange("Zürich", "uri")).toEqual([1, 4]);
  });

  test("plain ASCII text takes the short path and still matches an accented query", () => {
    expect(fold("Hello World")).toBe("hello world");
    expect(foldedRange("Cafe au lait", "CAFÉ")).toEqual([0, 4]);
    expect(foldedRange("Lyon", "yo")).toEqual([1, 3]);
  });

  test("no match or no query gives null", () => {
    expect(foldedRange("Zürich", "x")).toBeNull();
    expect(foldedRange("Zürich", "")).toBeNull();
  });
});
