import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

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
// rules before adding new ones.
const budgets = [
  { name: "style.css", size: gzip(join(dist, "style.css")), limit: 27500 },
  { name: "index.js", size: gzip(join(dist, "index.js")), limit: 2250 },
  {
    name: "all JavaScript files (each gzipped)",
    size: jsFiles(dist).reduce((sum, f) => sum + gzip(f), 0),
    limit: 162000,
  },
];

let failed = false;
for (const { name, size, limit } of budgets) {
  const over = size > limit;
  failed ||= over;
  console.log(
    `${over ? "FAIL" : "ok  "} ${name}: ${size} of ${limit} B gzip (${limit - size} B headroom, ${((size / limit) * 100).toFixed(1)}% used)`,
  );
}
if (failed) process.exit(1);
