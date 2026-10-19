import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import postcss from "postcss";

export const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

/** Every source stylesheet: { file, css }. */
export function sourceStyles() {
  const out = [];
  for (const file of walk(join(pkgRoot, "src"))) {
    const rel = relative(pkgRoot, file).replace(/\\/g, "/");
    if (file.endsWith(".css")) out.push({ file: rel, css: readFileSync(file, "utf8") });
    else if (file.endsWith(".vue")) {
      const src = readFileSync(file, "utf8");
      for (const m of src.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) out.push({ file: rel, css: m[1] });
    }
  }
  return out;
}

/** Normalises a value so formatting differences do not count as changes. */
export function norm(value) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s*([,/])\s*/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/(^|[^\d])0+\.(\d)/g, "$1.$2")
    .replace(/currentcolor/gi, "currentcolor")
    .replace(/\s*!important/g, "!important")
    .trim()
    .toLowerCase();
}

/**
 * Flattens CSS into Map<key, Map<prop, value>> where key is "<context> | <selector>".
 * `@layer` blocks are transparent (the layer is a property of the new library, not of the rule); other at-rules are the context.
 */
export function flatten(css, from = "css") {
  const root = postcss.parse(css, { from });
  const rules = new Map();
  const visit = (node, ctx) => {
    node.each((n) => {
      if (n.type === "atrule") {
        if (n.name === "layer") {
          if (n.nodes) visit(n, ctx);
        } else if (n.nodes && ["media", "container", "supports"].includes(n.name)) {
          visit(n, [...ctx, `@${n.name} ${norm(n.params)}`]);
        } else if (n.nodes) {
          visit(n, [...ctx, `@${n.name} ${norm(n.params)}`]);
        }
      } else if (n.type === "rule") {
        for (const sel of n.selectors) {
          const key = `${ctx.join(" > ")} | ${norm(sel)}`;
          const map = rules.get(key) ?? new Map();
          n.each((d) => {
            if (d.type === "decl") map.set(d.prop.toLowerCase(), norm(d.value));
          });
          rules.set(key, map);
        }
      }
    });
  };
  visit(root, []);
  return rules;
}
