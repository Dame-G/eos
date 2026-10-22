import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { LAYER_ORDER } from "@eos-ui/tokens";
import { pkgRoot } from "./css-lib.mjs";

const order = LAYER_ORDER.split(",").map((s) => s.trim());
const rank = (layer) => order.indexOf(layer);
const dir = join(pkgRoot, "src", "components");
if (!existsSync(dir)) process.exit(0);

const layerOf = new Map();
const files = new Map();
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
    if (vueFiles.length && src.includes("<style")) problems.push(`${name}: no @layer e.<name> block in its <style>`);
    continue;
  }
  for (const m of src.matchAll(/from\s+["']\.\.\/([A-Za-z0-9]+)\/[^"']+\.vue["']/g)) {
    const dep = m[1];
    const theirs = layerOf.get(dep);
    if (!theirs) continue;
    if (rank(theirs) > rank(mine))
      problems.push(`${name} (${mine}) uses ${dep} (${theirs}), which is in a higher layer`);
  }
}

function blocks(text, from, to) {
  const out = [];
  let depth = 0;
  let start = from;
  for (let i = from; i < to; i++) {
    const c = text[i];
    if (c === "{") {
      if (depth === 0) out.push({ head: text.slice(start, i).trim(), open: i });
      depth++;
    } else if (c === "}") {
      depth--;
      if (depth === 0) {
        out[out.length - 1].close = i;
        start = i + 1;
      }
    } else if (c === ";" && depth === 0) start = i + 1;
  }
  return out;
}

function cssSources(file) {
  const raw = readFileSync(file, "utf8");
  if (file.endsWith(".css")) return [raw];
  return [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
}

function walk(d) {
  return readdirSync(d, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(d, e.name)) : /\.(vue|css)$/.test(e.name) ? [join(d, e.name)] : [],
  );
}

const seen = new Map();
for (const file of walk(join(pkgRoot, "src"))) {
  for (const chunk of cssSources(file)) {
    const text = chunk.replace(/\/\*[\s\S]*?\*\//g, "");
    for (const layer of blocks(text, 0, text.length)) {
      const lm = /^@layer\s+(e\.[a-z]+)$/.exec(layer.head);
      if (!lm) continue;
      for (const rule of blocks(text, layer.open + 1, layer.close)) {
        if (rule.head.startsWith("@")) continue;
        const selector = rule.head.replace(/\s+/g, " ");
        const key = lm[1] + " " + selector;
        const rel = relative(pkgRoot, file).replaceAll("\\", "/");
        const prior = seen.get(key);
        if (prior && prior !== rel)
          problems.push(`${selector} in @layer ${lm[1]} is defined in both ${prior} and ${rel}; share one stylesheet`);
        else if (!prior) seen.set(key, rel);
      }
    }
  }
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`layers ok (${layerOf.size} components with CSS)`);
