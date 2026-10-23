import { describe, expect, test } from "vitest";
import {
  carbonAliases,
  fluentAliases,
  heroiconsAliases,
  iconifyAliases,
  lucideAliases,
  materialSymbolsAliases,
  mdiAliases,
  phosphorAliases,
  tablerAliases,
} from "./aliases.js";
import { iconNames } from "./types.js";

const tables = {
  lucide: lucideAliases,
  tabler: tablerAliases,
  heroicons: heroiconsAliases,
  phosphor: phosphorAliases,
  mdi: mdiAliases,
  "material-symbols": materialSymbolsAliases,
  carbon: carbonAliases,
  fluent: fluentAliases,
};

describe("icon alias tables", () => {
  test("there are 42 Eos icon names", () => {
    expect(iconNames).toHaveLength(42);
  });

  for (const [set, table] of Object.entries(tables)) {
    test(`${set} has an entry for every Eos icon name, and nothing else`, () => {
      expect(Object.keys(table).sort()).toEqual([...iconNames].sort());
    });

    test(`${set} names are non-empty kebab-case`, () => {
      for (const [eos, name] of Object.entries(table)) {
        expect(name, eos).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
      }
    });
  }

  test("every Iconify prefix points at a complete table", () => {
    expect(Object.keys(iconifyAliases)).toEqual(
      expect.arrayContaining(["lucide", "tabler", "heroicons", "ph", "mdi", "material-symbols"]),
    );
    for (const table of Object.values(iconifyAliases)) expect(Object.keys(table)).toHaveLength(iconNames.length);
  });
});
