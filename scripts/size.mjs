import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { sourceStyles } from "../packages/vue/scripts/css-lib.mjs";

const pkg = join(dirname(fileURLToPath(import.meta.url)), "..", "packages", "vue");
const dist = join(pkg, "dist");
const gzip = (file) => gzipSync(readFileSync(file)).length;

// The JavaScript ships unminified (a consumer's bundler minifies it), so it is measured as a production bundle would
// carry it: minified with the minifier Vite builds with (rolldown's, through Vite), then gzipped. The CSS ships minified.
const fromVite = createRequire(createRequire(join(pkg, "package.json")).resolve("vite"));
const { minifySync } = await import(pathToFileURL(fromVite.resolve("rolldown/experimental")).href);
const gzipMinified = (file) => gzipSync(minifySync(file, readFileSync(file, "utf8")).code).length;

const jsFiles = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return jsFiles(path);
    return entry.name.endsWith(".js") ? [path] : [];
  });

// Budgets in gzipped bytes. Policy: a limit is the current size plus about 3%, so a normal feature fits and a careless
// addition (a duplicated rule set, a new dependency) does not. When a deliberate change needs more, raise the limit in
// the same pull request and say why in its description. Never raise it to make an unexplained growth pass.
// All CSS ships as one file (style.css), so every component is paid for by every consumer: reuse tokens and shared
// rules before adding new ones. Run `node scripts/size.mjs --components` to see what each component costs.
//
// THE LIMITS: change a number here, nowhere else.
const limits = {
  "style.css": 22300,
  // Minified here before gzip since the JavaScript ships unminified; rebased then with the headroom they had.
  "index.js": 2100,
  "all JavaScript files (each gzipped)": 144300,
};

// The per-component paths (`@eos-ui/vue/components/EButton`) are one-line re-exports, dist/components/<Name>/index.js.
// Gzipped one by one they are all header (about 70 B each), and no bundle pays for them, so they are left out of the sum.
const perComponentEntry = /[\\/]components[\\/][A-Za-z]+[\\/]index\.js$/;

const sizes = {
  "style.css": gzip(join(dist, "style.css")),
  "index.js": gzipMinified(join(dist, "index.js")),
  "all JavaScript files (each gzipped)": jsFiles(dist)
    .filter((f) => !perComponentEntry.test(f))
    .reduce((sum, f) => sum + gzipMinified(f), 0),
};

const json = process.argv.includes("--json");
const log = json ? console.error : console.log; // keeps stdout valid JSON
let failed = false;
for (const [name, limit] of Object.entries(limits)) {
  const size = sizes[name];
  const over = size > limit;
  failed ||= over;
  log(
    `${over ? "FAIL" : "ok  "} ${name}: ${size} of ${limit} B gzip (${limit - size} B headroom, ${((size / limit) * 100).toFixed(1)}% used)`,
  );
}

// What each component's own CSS costs: its source <style> blocks, gzipped alone. This is the cost before the build
// merges, layers and de-duplicates, so the figures are an upper bound that is good for ranking, not a share of style.css.
//   node scripts/size.mjs --components          a Markdown table, largest first
//   node scripts/size.mjs --components --json   the same as JSON, for the docs
if (process.argv.includes("--components")) {
  const byComponent = new Map();
  for (const { file, css } of sourceStyles()) {
    const m = /^src\/components\/([^/]+)\//.exec(file);
    const key = m ? m[1] : file.startsWith("src/styles/") ? "(shared styles)" : "(other)";
    const entry = byComponent.get(key) ?? { name: key, css: "" };
    entry.css += css + "\n";
    byComponent.set(key, entry);
  }
  const rows = [...byComponent.values()]
    .map(({ name, css }) => ({ name, bytes: Buffer.byteLength(css), gzip: gzipSync(css).length }))
    .sort((a, b) => b.gzip - a.gzip);
  if (json) console.log(JSON.stringify(rows, null, 2));
  else {
    console.log("\n| Component | CSS source (B) | Gzipped (B) |\n| --- | ---: | ---: |");
    for (const r of rows) console.log(`| ${r.name} | ${r.bytes} | ${r.gzip} |`);
  }
}

if (failed) process.exit(1);
