// Fails when a component's CSS breaks the layering rules:
//  - every rule sits inside `@layer e.<name> { }` with a known layer (so consumers can always override with plain CSS)
//  - no `!important`
//  - no raw z-index numbers (use the --z-* tokens)
import postcss from "postcss";
import { sourceStyles } from "./css-lib.mjs";
import { LAYER_ORDER } from "@eos-ui/tokens";

const layers = new Set(LAYER_ORDER.split(",").map((s) => s.trim()));
const problems = [];

for (const { file, css } of sourceStyles()) {
  const root = postcss.parse(css, { from: file });
  root.each((n) => {
    if (n.type === "comment") return;
    if (n.type === "atrule" && n.name === "import") return;
    if (n.type === "atrule" && n.name === "layer") {
      if (!n.nodes) return; // an order statement
      if (!layers.has(n.params.trim()))
        problems.push(`${file}: unknown layer "${n.params}". Known: ${[...layers].join(", ")}`);
      return;
    }
    problems.push(
      `${file}:${n.source?.start?.line ?? "?"}: top-level ${n.type === "rule" ? n.selector : "@" + n.name} is outside an @layer e.* block`,
    );
  });
  root.walkDecls((d) => {
    if (d.important) problems.push(`${file}:${d.source?.start?.line}: !important on ${d.prop}`);
    if (d.prop === "z-index" && /^\d+$/.test(d.value.trim()) && d.value.trim() !== "0")
      problems.push(`${file}:${d.source?.start?.line}: raw z-index ${d.value}; use a --z-* token`);
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("css layers ok");
