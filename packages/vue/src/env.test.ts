import { describe, expect, test, vi } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { isProduction } from "./env.js";
import { createEos } from "./plugin.js";
import source from "./env.ts?raw";

// Bundlers replace `process.env.NODE_ENV` with a literal, so the production branch cannot be switched at run time here.
// scripts/check-dist.mjs bundles the built file with NODE_ENV=production and asserts the answer is true, and that the
// file carries no `import.meta.env`.
describe("development warnings", () => {
  const failing = { theme: { tokens: { primary: "#9fd3e3" } } };
  const install = (options: Parameters<typeof createEos>[0]) =>
    createEos(options).install(createApp(defineComponent({ render: () => h("div") })));

  test("a test run is not production", () => {
    expect(isProduction()).toBe(false);
  });

  // A bundler replaces the expression `process.env.NODE_ENV` and nothing else. A `typeof process` guard survives the
  // replacement and is false in a browser, which shipped every development warning to production.
  test("reads process.env.NODE_ENV with nothing a bundler would leave behind", () => {
    expect(source).toContain("process.env.NODE_ENV");
    expect(source.slice(source.indexOf("export function"))).not.toMatch(/typeof\s+process/);
  });

  test("with no process at all (an unbundled script in a browser) it is not production", () => {
    const run = new Function(
      "process",
      `${source.replace(/export /g, "").replace("): boolean", ")")}; return isProduction();`,
    ) as (p: unknown) => boolean;
    expect(run(undefined)).toBe(false);
    expect(run({ env: { NODE_ENV: "production" } })).toBe(true);
  });

  test("a failing theme warns outside production", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    install(failing);
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test("warnOnContrast: false silences it", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    install({ ...failing, warnOnContrast: false });
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});
