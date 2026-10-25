// A browser command: turns forced colours (Windows High Contrast) on or off for the page, as Playwright emulates it, so
// a test reads the computed style a forced-colours user gets. Turn it off again in afterEach.
import type { BrowserCommand } from "vitest/node";

declare module "vitest/browser" {
  interface BrowserCommands {
    forcedColors: (active: boolean) => Promise<void>;
  }
}

export const forcedColors: BrowserCommand<[active: boolean]> = async ({ page }, active) => {
  await page.emulateMedia({ forcedColors: active ? "active" : "none" });
};
