import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

export const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Every source stylesheet: { file, css }. */
export function sourceStyles() {
  const out = [];
  for (const file of walk(join(pkgRoot, "src"))) {
    const rel = relative(pkgRoot, file).replace(/\\/g, "/");
    if (file.endsWith(".css")) out.push({ file: rel, css: readFileSync(file, "utf8") });
    else if (file.endsWith(".vue")) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) out.push({ file: rel, css: m[1] });
    }
  }
  return out;
}
