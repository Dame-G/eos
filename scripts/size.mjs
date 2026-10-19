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

const budgets = [
  { name: "style.css", size: gzip(join(dist, "style.css")), limit: 19800 },
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
  console.log(`${over ? "FAIL" : "ok  "} ${name}: ${size} B gzip (limit ${limit} B)`);
}
if (failed) process.exit(1);
