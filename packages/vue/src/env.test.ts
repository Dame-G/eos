import { describe, expect, test, vi } from "vitest";
import { createApp, defineComponent, h } from "vue";
import { isProduction } from "./env.js";
import { createEos } from "./plugin.js";

// Bundlers replace `process.env.NODE_ENV` with a literal, so the production branch cannot be switched at run time here.
// scripts/check-dist.mjs asserts the built file still reads it and carries no `import.meta.env`.
describe("development warnings", () => {
  const failing = { theme: { tokens: { primary: "#9fd3e3" } } };
  const install = (options: Parameters<typeof createEos>[0]) =>
    createEos(options).install(createApp(defineComponent({ render: () => h("div") })));

  test("a test run is not production", () => {
    expect(isProduction()).toBe(false);
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
