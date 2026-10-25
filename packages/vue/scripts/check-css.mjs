// The CSS rules stylelint cannot express, over every source stylesheet (src/**/*.css and the <style> blocks of .vue files).
// `!important` and raw z-index values are stylelint's (stylelint.config.js). Each rule has a name, printed with what it found.
//
//   layer-membership   every top-level rule sits inside a known `@layer e.*` block (LAYER_ORDER in @eos-ui/tokens)
//   component-layer    a component with a <style> lays it out in an `@layer e.*` block
//   layer-dependency   a component uses only components of its own layer or an earlier one
//   duplicate-selector a selector is laid out in one stylesheet per layer, not repeated across files
//   inset-ring-on-fill an edge is not drawn as an inset shadow over a strong fill
//   base-component-class base.css names no component class, except in a :where() list of defaults
//
// Run: node scripts/check-css.mjs   (CI: `pnpm check:source`)
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";
import { LAYER_ORDER } from "@eos-ui/tokens";
import { pkgRoot, sourceStyles } from "./css-lib.mjs";

const order = LAYER_ORDER.split(",").map((s) => s.trim());
const known = new Set(order);
const problems = [];
const report = (rule, message) => problems.push(`${rule}: ${message}`);
const at = (file, node) => `${file}:${node.source?.start?.line ?? "?"}`;

const sheets = sourceStyles().map(({ file, css }) => ({ file, root: postcss.parse(css, { from: file }) }));

// layer-membership
for (const { file, root } of sheets) {
  root.each((n) => {
    if (n.type === "comment") return;
    if (n.type === "atrule" && (n.name === "import" || n.name === "font-face")) return;
    if (n.type === "atrule" && n.name === "layer") {
      if (n.nodes && !known.has(n.params.trim()))
        report("layer-membership", `${at(file, n)}: unknown layer "${n.params}". Known: ${order.join(", ")}`);
      return;
    }
    report(
      "layer-membership",
      `${at(file, n)}: top-level ${n.type === "rule" ? n.selector : "@" + n.name} is outside an @layer e.* block`,
    );
  });
}

// component-layer and layer-dependency: a component's layer is the first layer block in its folder's .vue files.
const components = new Map();
for (const { file, root } of sheets) {
  const m = /^src\/components\/([^/]+)\/[^/]+\.vue$/.exec(file);
  if (!m) continue;
  const entry = components.get(m[1]) ?? { layer: undefined };
  root.each((n) => {
    if (!entry.layer && n.type === "atrule" && n.name === "layer" && n.nodes) entry.layer = n.params.trim();
  });
  components.set(m[1], entry);
}
const rank = (layer) => order.indexOf(layer);
for (const [name, { layer }] of components) {
  if (!layer) {
    report("component-layer", `${name}: no @layer e.<name> block in its <style>`);
    continue;
  }
  const dir = join(pkgRoot, "src", "components", name);
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".vue"))) {
    const script = readFileSync(join(dir, file), "utf8");
    for (const m of script.matchAll(/from\s+["']\.\.\/([A-Za-z0-9]+)\/[^"']+\.vue["']/g)) {
      const theirs = components.get(m[1])?.layer;
      if (theirs && rank(theirs) > rank(layer))
        report("layer-dependency", `${name} (${layer}) uses ${m[1]} (${theirs}), which is in a higher layer`);
    }
  }
}

// duplicate-selector: the top-level rules of each layer block, by layer and selector.
const seen = new Map();
for (const { file, root } of sheets) {
  root.each((block) => {
    if (block.type !== "atrule" || block.name !== "layer" || !block.nodes) return;
    const layer = block.params.trim();
    block.each((rule) => {
      if (rule.type !== "rule") return;
      const selector = rule.selector.replace(/\s+/g, " ");
      const key = `${layer} ${selector}`;
      const prior = seen.get(key);
      if (!prior) seen.set(key, file);
      else if (prior !== file)
        report(
          "duplicate-selector",
          `${selector} in @layer ${layer} is defined in both ${prior} and ${file}; share one stylesheet`,
        );
    });
  });
}

// inset-ring-on-fill: an edge drawn as an inset shadow over a fill paints the fill into the antialiased corner pixels,
// which shows as a fringe of the fill colour outside the curve. Where the fill is strong, draw the edge as a border and
// stop the fill inside it with background-clip: padding-box. Fills that are only a tint of the ground they sit on (tints,
// hover and wash colours) cannot show a fringe.
const subtle =
  /^(transparent|none|inherit|initial|unset|currentcolor)\b|--e-(surface-tint|wash-)|color-mix\(|var\(--e-border/i;
for (const { file, root } of sheets) {
  root.walkRules((rule) => {
    const decls = rule.nodes.filter((n) => n.type === "decl");
    const strongFill = decls.find((d) => /^background(-color)?$/.test(d.prop) && !subtle.test(d.value.trim()));
    const ring = decls.find(
      (d) => d.prop === "box-shadow" && /(^|,)\s*inset\s+0\s+0\s+0\s+(?!0\b)\S+\s+\S/.test(d.value),
    );
    if (strongFill && ring)
      report(
        "inset-ring-on-fill",
        `${at(file, ring)}: ${rule.selector.replace(/\s+/g, " ")} draws its edge as an inset shadow over a fill; use a border with background-clip: padding-box`,
      );
  });
}

// base-component-class: src/styles/base.css holds the root, the shared utilities and the recipes. It sits in the first
// layer, so a rule there that names a component's class loses to every rule of the component's own layer: an override
// written there (a forced-colours border, say) is silently dead. A component's class belongs in its own stylesheet. The
// one exception is a :where() list of defaults (focus, user-select), which is meant to lose.
const BASE_CLASSES = new Set(["e-root", "e-interact", "e-interact--inset", "e-kicker", "e-numeral", "e-numeral-l", "e-sr"]);
const withoutWhere = (selector) => {
  let out = "";
  for (let i = 0; i < selector.length; i++) {
    if (selector.startsWith(":where(", i)) {
      let depth = 0;
      for (i += ":where".length; i < selector.length; i++) {
        if (selector[i] === "(") depth++;
        else if (selector[i] === ")" && --depth === 0) break;
      }
    } else out += selector[i];
  }
  return out;
};
for (const { file, root } of sheets) {
  if (file !== "src/styles/base.css") continue;
  root.walkRules((rule) => {
    for (const [, name] of withoutWhere(rule.selector).matchAll(/\.(e-[\w-]+)/g)) {
      if (!BASE_CLASSES.has(name))
        report(
          "base-component-class",
          `${at(file, rule)}: .${name} is a component's class; style it in the component's own stylesheet and layer`,
        );
    }
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`css ok (${sheets.length} stylesheets, ${components.size} components with CSS)`);
