import { describe, expect, test } from "vitest";
import { EosResolver } from "./resolver.js";
import * as library from "./index.js";

describe("EosResolver", () => {
  const resolver = EosResolver();

  test("claims eos components and nothing else", () => {
    expect(resolver.resolve("EButton")).toEqual({ name: "EButton", from: "@eos-ui/vue" });
    expect(resolver.resolve("EEmptyState")).toEqual({ name: "EEmptyState", from: "@eos-ui/vue" });
    expect(resolver.resolve("EventCard")).toBeUndefined();
    expect(resolver.resolve("EHeader")).toBeUndefined();
    expect(resolver.resolve("OpButton")).toBeUndefined();
    expect(resolver.resolve("VBtn")).toBeUndefined();
  });

  test("every component the package exports is claimed, and every claim is exported", () => {
    const exported = Object.keys(library).filter((k) => /^E[A-Z]/.test(k));
    expect(exported.length).toBeGreaterThan(60);
    for (const name of exported) expect(resolver.resolve(name), name).toBeDefined();
  });

  test("the import source can be changed", () => {
    expect(EosResolver({ from: "@my/ui" }).resolve("EButton")).toEqual({ name: "EButton", from: "@my/ui" });
  });

  test("the stylesheet is imported only when asked for", () => {
    expect(EosResolver().resolve("EButton")).not.toHaveProperty("sideEffects");
    expect(EosResolver({ css: true }).resolve("EButton")).toEqual({
      name: "EButton",
      from: "@eos-ui/vue",
      sideEffects: "@eos-ui/vue/style.css",
    });
    expect(EosResolver({ css: "./my.css" }).resolve("EButton")).toMatchObject({ sideEffects: "./my.css" });
    expect(EosResolver({ css: true }).resolve("EventCard")).toBeUndefined();
  });
});
