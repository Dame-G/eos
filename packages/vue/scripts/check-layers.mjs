// Fails when a component uses one from a higher layer. The layer of a component is the `@layer e.<name>` its CSS is written in.
// A component may import components of its own layer or an earlier one, never a later one (docs/architecture.md).
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { LAYER_ORDER } from "@eos/tokens";
import { pkgRoot } from "./css-lib.mjs";

const order = LAYER_ORDER.split(",").map((s) => s.trim());
const rank = (layer) => order.indexOf(layer);
const dir = join(pkgRoot, "src", "components");
if (!existsSync(dir)) process.exit(0);

const layerOf = new Map(); // component dir -> layer
const files = new Map(); // component dir -> .vue source(s)
for (const name of readdirSync(dir)) {
  const vueFiles = readdirSync(join(dir, name)).filter((f) => f.endsWith(".vue"));
  const src = vueFiles.map((f) => readFileSync(join(dir, name, f), "utf8")).join("\n");
  files.set(name, { src, vueFiles });
  const m = /@layer\s+(e.[a-z]+)\s*\{/.exec(src);
  if (m) layerOf.set(name, m[1]);
}

const problems = [];
for (const [name, { src, vueFiles }] of files) {
  const mine = layerOf.get(name);
  if (!mine) {
    if (vueFiles.length) problems.push(`${name}: no @layer e.<name> block in its <style>`);
    continue;
  }
  for (const m of src.matchAll(/from\s+["']\.\.\/([A-Za-z0-9]+)\/[^"']+\.vue["']/g)) {
    const dep = m[1];
    const theirs = layerOf.get(dep);
    if (!theirs) continue; // a component with no CSS of its own (VisuallyHidden is the rare case); not a layering signal
    if (rank(theirs) > rank(mine))
      problems.push(`${name} (${mine}) uses ${dep} (${theirs}), which is in a higher layer`);
  }
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`layers ok (${layerOf.size} components with CSS)`);
