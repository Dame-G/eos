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
  // Raised from 22300 (about 770 B in all): the upload redesign (the dropzone as a well with its dragging states, each
  // file as a raised tile, rejected-file rows with their tone edge, the corner count, thumbnails and the single-file
  // preview card), the calendar range meeting flush (each end, today and the hover squaring toward the band, the band
  // rounding its outer corners), and the hover veil that fades a field's and an outline button's wash without a sweep.
  // Then from 23400 (about 260 B over it at the time): print support (the shared paper rules for colour, breaks and
  // floating panels; the grid, table, code block, upload, disclosure and header on paper), the single-file upload tile
  // taking the zone's states, the avatar stack, the nav item's own hover edge and the switch thumb's slab and press.
  // Then from 23900 (about 560 B over it): the app patterns, seven components (ESheet, EPopover, EList, EListRow,
  // ETree, EVirtualList, EStatLink); the rows share one stylesheet (listrow.css) and the sheet reuses the dialog's
  // head, body and foot rules.
  "style.css": 26000,
  // Minified here before gzip since the JavaScript ships unminified; rebased then with the headroom they had.
  "index.js": 2100,
  // Raised from 144300 in the audit release, at 148029 B with the headroom it had (2.9%). Growth over 0.17 (about 8 kB,
  // EDefinition -> EToggletip moved bytes without adding any): useDataGrid (the grid's search index and sort, split out
  // so it is tested alone), useDatePopover (the calendar popup EDatePicker and ERangePicker now share, which also gives
  // the range picker invalid-text and Alt+Arrow Down), RekaConfig/TooltipScope (one direction, scroll lock and tooltip
  // provider for every Reka part), useLink (to and href, never both, on every link), useBusyButton, the theme mounted
  // as a stylesheet with lang and dir restored on unmount (plugin), useDir following the page's own direction, ETooltip
  // not reading a label twice, EAppHeader's height hook and scrolling nav, and the announcer and new props across the
  // release. Already cut: warn.ts folded into env.ts with every one-off console.warn on warnOnce, and Field/popper.ts
  // folded into the floating-part constants of useDir.ts.
  // Then from 152300 (about 6.7 kB over it) for the same seven components, ETree on Reka's tree and EVirtualList on
  // @tanstack/vue-virtual, both already dependencies.
  "all JavaScript files (each gzipped)": 168600,
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
