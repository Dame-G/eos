// A migration report, not a gate: lists, per file, the gap, padding and margin values written as raw lengths instead of
// tokens, most first. Migrate them to the `gap-*` and `pad-*` tokens (CONTRIBUTING, Design conventions).
// Run: node scripts/report-spacing.mjs   (or `pnpm --filter @eos-ui/vue report:spacing`)
import postcss from "postcss";
import { sourceStyles } from "./css-lib.mjs";

const raw = /(?<![\w-])-?\d*\.?\d+(?:px|rem|em)\b/;
const found = new Map();
for (const { file, css } of sourceStyles()) {
  postcss.parse(css, { from: file }).walkDecls(/^(gap|row-gap|column-gap|padding|margin)(-|$)/, (d) => {
    if (!raw.test(d.value.replace(/var\(--e-[a-z0-9-]+\)/g, ""))) return;
    if (!found.has(file)) found.set(file, []);
    found.get(file).push(`${d.source?.start?.line}: ${d.prop}: ${d.value}`);
  });
}
for (const [file, list] of [...found].sort((a, b) => b[1].length - a[1].length))
  console.log(`${list.length}  ${file}\n    ${list.join("\n    ")}`);
if (!found.size) console.log("no raw lengths in gap, padding or margin");
