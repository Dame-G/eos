// CI runs the browser tests in Playwright's container image (.github/workflows/ci.yml), whose browsers are built for
// one Playwright version. Fails when the image tag and the installed playwright package disagree, with the tag to use.
// Part of `pnpm check:source`.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const installed = createRequire(join(root, "packages", "vue", "package.json"))("playwright/package.json").version;
const workflow = readFileSync(join(root, ".github", "workflows", "ci.yml"), "utf8");
const tags = [...workflow.matchAll(/mcr\.microsoft\.com\/playwright:v([0-9][^\s-]*)/g)].map((m) => m[1]);

const wrong = tags.filter((t) => t !== installed);
if (!tags.length || wrong.length) {
  console.error(
    tags.length
      ? `ci.yml uses the Playwright image v${wrong[0]}, but playwright ${installed} is installed. Use mcr.microsoft.com/playwright:v${installed}-noble.`
      : "ci.yml no longer names a Playwright image; update scripts/check-playwright-image.mjs.",
  );
  process.exit(1);
}
console.log(`playwright image ok (v${installed})`);
