// Checks the built stylesheet (dist/style.css) for what the PostCSS plugins in vite.config.ts guarantee, so a plugin that
// silently stops running fails here. Needs a build. Run: node scripts/check-dist.mjs
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";
import { build } from "vite";
import { LAYER_ORDER } from "@eos-ui/tokens";
import { pkgRoot } from "./css-lib.mjs";

const file = join(pkgRoot, "dist", "style.css");
if (!existsSync(file)) {
  console.error("dist/style.css is missing. Run `pnpm build` first.");
  process.exit(1);
}

const root = postcss.parse(readFileSync(file, "utf8"), { from: file });
const problems = [];

// 1. The layer order is declared before anything is laid out in a layer.
const order = LAYER_ORDER.split(",").map((s) => s.trim());
let declared = false;
let firstBlock = -1;
let index = 0;
root.each((n) => {
  index++;
  if (n.type !== "atrule" || n.name !== "layer") return;
  if (!n.nodes) {
    if (
      !declared &&
      n.params
        .split(",")
        .map((s) => s.trim())
        .join(",") === order.join(",")
    )
      declared = true;
  } else if (firstBlock < 0) {
    firstBlock = index;
    if (!declared)
      problems.push(`the first @layer block (${n.params}) comes before the order statement "@layer ${LAYER_ORDER}"`);
  }
});
if (!declared) problems.push(`no "@layer ${LAYER_ORDER};" statement at the top level`);

// 2. Every top-level rule sits in a known layer (at-rules that cannot be layered are allowed).
const unlayered = new Set(["charset", "import", "font-face", "property", "keyframes", "layer", "media", "supports"]);
root.each((n) => {
  if (n.type === "rule") problems.push(`top-level rule outside any layer: ${n.selector}`);
  if (n.type === "atrule" && !unlayered.has(n.name)) problems.push(`top-level @${n.name} outside any layer`);
  if (n.type === "atrule" && n.name === "layer" && n.nodes && !order.includes(n.params.trim()))
    problems.push(`unknown layer "${n.params}"`);
});

// 3. :hover only applies where the device can hover.
let gated = 0;
root.walkRules((rule) => {
  if (!rule.selector.includes(":hover")) return;
  let ok = false;
  for (let p = rule.parent; p; p = p.parent) {
    if (p.type === "atrule" && (p.name === "keyframes" || p.params.includes("hover:"))) ok = true;
  }
  if (ok) gated++;
  else problems.push(`:hover outside @media (hover: hover): ${rule.selector}`);
});
if (!gated) problems.push("no hover rule was found inside @media (hover: hover); the hover plugin may not have run");

// 4. The development check reads NODE_ENV in the consumer's build. Vite would freeze import.meta.env while building the library.
const envFile = join(pkgRoot, "dist", "env.js");
if (!existsSync(envFile)) problems.push("dist/env.js is missing");
else if (!readFileSync(envFile, "utf8").includes("process.env.NODE_ENV"))
  problems.push("dist/env.js no longer reads process.env.NODE_ENV");
// Bundle it as a consumer's app would, once per NODE_ENV, and run the result: production must say true, development false.
// Nothing in the bundle may still read `process`, which a browser does not have.
if (existsSync(envFile)) {
  for (const mode of ["production", "development"]) {
    const out = await build({
      configFile: false,
      logLevel: "silent",
      define: { "process.env.NODE_ENV": JSON.stringify(mode) },
      build: {
        write: false,
        minify: false,
        lib: { entry: envFile, formats: ["es"], fileName: "env" },
      },
    });
    const code = (Array.isArray(out) ? out[0] : out).output[0].code;
    if (/\bprocess\b/.test(code)) problems.push(`dist/env.js bundled for ${mode} still reads process: ${code.trim()}`);
    const { isProduction } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
    if (isProduction() !== (mode === "production"))
      problems.push(`dist/env.js bundled with NODE_ENV=${mode} gives isProduction() === ${isProduction()}`);
  }
}
for (const name of ["plugin.js", "config.js", "env.js"]) {
  const path = join(pkgRoot, "dist", name);
  if (existsSync(path) && readFileSync(path, "utf8").includes("import.meta.env"))
    problems.push(`dist/${name} reads import.meta.env, which the build freezes`);
}

// 5. The types that augment "vue" are reachable from the package entry.
const indexTypes = join(pkgRoot, "dist", "index.d.ts");
if (!existsSync(indexTypes) || !readFileSync(indexTypes, "utf8").includes("globals.js"))
  problems.push("dist/index.d.ts does not load globals.d.ts (GlobalComponents and $e types)");

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`dist ok (layer order declared first, ${gated} hover rules gated)`);
