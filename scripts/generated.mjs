// The one way the generators write a committed file: through Prettier (with the repo's config), so a generated file is
// formatted exactly as `pnpm format` would leave it and regenerating never dirties the tree. With `--check` on the
// command line nothing is written: reportStale() lists the files that differ and exits 1.
// Used by packages/tokens/scripts/generate.mjs, packages/vue/scripts/gen-index.mjs and packages/vue/scripts/gen-props.mjs.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import prettier from "prettier";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

/** True when the generator was started with `--check`: compare, write nothing. */
export const checking = process.argv.includes("--check");

const stale = [];

/**
 * Formats `content` with Prettier for `file` and writes it when it differs from what is on disk (in check mode, records
 * the file as stale instead). A file checked out with CRLF line endings keeps them. Returns true when the file changed
 * or would change.
 */
export async function writeGenerated(file, content) {
  const options = (await prettier.resolveConfig(file)) ?? {};
  const next = await prettier.format(content, { ...options, filepath: file });
  const raw = existsSync(file) ? readFileSync(file, "utf8") : undefined;
  if (raw?.replaceAll("\r\n", "\n") === next) return false;
  if (checking) stale.push(relative(repoRoot, file).replaceAll("\\", "/"));
  else writeFileSync(file, raw?.includes("\r\n") ? next.replaceAll("\n", "\r\n") : next);
  return true;
}

/** In check mode, prints the stale files with the command that regenerates them and exits 1. Returns how many were stale. */
export function reportStale(fix) {
  if (checking && stale.length) {
    console.error(`Generated files are out of date: ${stale.join(", ")}.\nRun \`${fix}\` and commit the result.`);
    process.exit(1);
  }
  return stale.length;
}
