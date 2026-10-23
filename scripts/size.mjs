import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { sourceStyles } from "../packages/vue/scripts/css-lib.mjs";

const dist = join(dirname(fileURLToPath(import.meta.url)), "..", "packages", "vue", "dist");
const gzip = (file) => gzipSync(readFileSync(file)).length;

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
  "style.css": 21900,
  "index.js": 2250,
  "all JavaScript files (each gzipped)": 178000,
};

const sizes = {
  "style.css": gzip(join(dist, "style.css")),
  "index.js": gzip(join(dist, "index.js")),
  "all JavaScript files (each gzipped)": jsFiles(dist).reduce((sum, f) => sum + gzip(f), 0),
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
