import postcss from "postcss";
import { sourceStyles } from "./css-lib.mjs";
import { LAYER_ORDER, deprecated } from "@eos-ui/tokens";

const layers = new Set(LAYER_ORDER.split(",").map((s) => s.trim()));
const problems = [];

// `--spacing` lists, per file, the gap, padding and margin values written as raw lengths instead of tokens, then exits. Migrate them to the `gap-*` and `pad-*` tokens (CONTRIBUTING, Design conventions).
if (process.argv.includes("--spacing")) {
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
  process.exit(0);
}

for (const { file, css } of sourceStyles()) {
  const root = postcss.parse(css, { from: file });
  root.each((n) => {
    if (n.type === "comment") return;
    if (n.type === "atrule" && (n.name === "import" || n.name === "font-face")) return;
    if (n.type === "atrule" && n.name === "layer") {
      if (!n.nodes) return;
      if (!layers.has(n.params.trim()))
        problems.push(`${file}: unknown layer "${n.params}". Known: ${[...layers].join(", ")}`);
      return;
    }
    problems.push(
      `${file}:${n.source?.start?.line ?? "?"}: top-level ${n.type === "rule" ? n.selector : "@" + n.name} is outside an @layer e.* block`,
    );
  });
  // An edge drawn as an inset shadow over a fill paints the fill into the antialiased corner pixels, which shows as a fringe of the fill colour outside the curve. Where the fill is strong, draw the edge as a border and stop the fill inside it with background-clip: padding-box. Fills that are only a tint of the ground they sit on (tints, hover and wash colours) cannot show a fringe.
  root.walkRules((rule) => {
    const decls = [];
    rule.each((n) => n.type === "decl" && decls.push(n));
    const subtle =
      /^(transparent|none|inherit|initial|unset|currentcolor)\b|--e-(surface-tint|surface-hover|wash-)|color-mix\(|var\(--e-border/i;
    const strongFill = decls.find((d) => /^background(-color)?$/.test(d.prop) && !subtle.test(d.value.trim()));
    const ring = decls.find(
      (d) => d.prop === "box-shadow" && /(^|,)\s*inset\s+0\s+0\s+0\s+(?!0\b)\S+\s+\S/.test(d.value),
    );
    if (strongFill && ring)
      problems.push(
        `${file}:${ring.source?.start?.line}: ${rule.selector.replace(/\s+/g, " ")} draws its edge as an inset shadow over a fill; use a border with background-clip: padding-box`,
      );
  });
  root.walkDecls((d) => {
    for (const [, name] of d.value.matchAll(/var\(--e-([a-z0-9-]+)/g))
      if (deprecated[name])
        problems.push(`${file}:${d.source?.start?.line}: --e-${name} is deprecated. ${deprecated[name]}`);
    if (d.important) problems.push(`${file}:${d.source?.start?.line}: !important on ${d.prop}`);
    if (d.prop === "z-index" && /^\d+$/.test(d.value.trim()) && d.value.trim() !== "0")
      problems.push(`${file}:${d.source?.start?.line}: raw z-index ${d.value}; use an --e-z-* token`);
  });
}

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("css layers ok");
