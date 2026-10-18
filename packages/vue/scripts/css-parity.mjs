// Compares the library's CSS with the original React design system's bundle.css, kept in the private eos-site repo
// (../eos-site/reference/react/components/bundle.css, or set EOS_REFERENCE to the file). A development tool only,
// so nothing is lost or silently changed in the port. Formatting and layer wrapping do not count; a missing rule,
// a missing declaration or a changed value does.
//
//   node scripts/css-parity.mjs                 whole report (exit 1 if anything is missing)
//   node scripts/css-parity.mjs --grep e-btn   only rules whose selector contains the text
//   node scripts/css-parity.mjs --extra         also list rules the library has that the reference does not
//
// Deliberate differences are recorded in parity-allow.json: { "<context> | <selector>": "reason" }.
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { flatten, pkgRoot, sourceStyles } from "./css-lib.mjs";

const args = process.argv.slice(2);
const grep = args.includes("--grep") ? args[args.indexOf("--grep") + 1] : null;
const showExtra = args.includes("--extra");

const refPath =
  process.env.EOS_REFERENCE ??
  join(pkgRoot, "..", "..", "..", "eos-site", "reference", "react", "components", "bundle.css");
const reference = flatten(readFileSync(refPath, "utf8"), "reference");
const ours = new Map();
// The library renamed op- to e- (classes) and --x to --e-x (custom properties); compare in the reference's names.
const back = (css) => css.replace(/(?<![A-Za-z0-9_-])e-(?=[a-z])/g, "op-").replace(/--e-/g, "--");
for (const { file, css: raw } of sourceStyles()) {
  const css = back(raw);
  // tokens.css is generated from tokens.json; the reference had it in a separate file
  for (const [k, v] of flatten(css, file)) {
    const m = ours.get(k) ?? new Map();
    for (const [p, val] of v) m.set(p, val);
    ours.set(k, m);
  }
}
const allowPath = join(pkgRoot, "parity-allow.json");
const allow = existsSync(allowPath) ? JSON.parse(readFileSync(allowPath, "utf8")) : {};

const missing = [];
const changed = [];
for (const [key, decls] of reference) {
  if (grep && !key.includes(grep)) continue;
  if (allow[key]) continue;
  const mine = ours.get(key);
  if (!mine) {
    missing.push(`MISSING RULE  ${key}`);
    continue;
  }
  for (const [prop, val] of decls) {
    if (!mine.has(prop)) changed.push(`MISSING DECL  ${key}  { ${prop}: ${val} }`);
    else if (mine.get(prop) !== val) changed.push(`CHANGED       ${key}  { ${prop}: ${val} }  =>  ${mine.get(prop)}`);
  }
}
const extra = [];
if (showExtra)
  for (const key of ours.keys())
    if (!reference.has(key) && (!grep || key.includes(grep))) extra.push(`EXTRA RULE    ${key}`);

const lines = [...missing, ...changed, ...extra];
const total = [...reference.keys()].filter((k) => !grep || k.includes(grep)).length;
console.log(lines.join("\n"));
console.log(
  `\n${total - missing.length - new Set(changed.map((c) => c.split("  ")[1])).size}/${total} reference rules match` +
    (grep ? ` (selectors containing "${grep}")` : ""),
);
if (missing.length + changed.length) process.exit(1);
