// Checks the build (dist): the stylesheet keeps what the PostCSS plugins in vite.config.ts guarantee, the development
// check survives a consumer's bundler, the entry points exist, and the built-in icons tree-shake. Needs a build.
// Run: node scripts/check-dist.mjs
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
// The JavaScript ships unminified, comments and all, so these checks read the code with its block and line comments
// taken out (a line comment is `//` after the start of a line or a space, so a URL in a string survives).
const uncommented = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "$1");
const envFile = join(pkgRoot, "dist", "env.js");
if (!existsSync(envFile)) problems.push("dist/env.js is missing");
else if (!uncommented(readFileSync(envFile, "utf8")).includes("process.env.NODE_ENV"))
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
    if (/\bprocess\b/.test(uncommented(code)))
      problems.push(`dist/env.js bundled for ${mode} still reads process: ${code.trim()}`);
    const { isProduction } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
    if (isProduction() !== (mode === "production"))
      problems.push(`dist/env.js bundled with NODE_ENV=${mode} gives isProduction() === ${isProduction()}`);
  }
}
// The tokens package prints defineTheme's warnings outside production by the same check: bundled for production it
// must stay quiet, bundled for development it must warn, and nothing may still read `process`.
const tokensTheme = join(dirname(fileURLToPath(import.meta.resolve("@eos-ui/tokens"))), "theme.js");
if (!existsSync(tokensTheme)) problems.push(`${tokensTheme} is missing; build the tokens first`);
else {
  for (const mode of ["production", "development"]) {
    const out = await build({
      configFile: false,
      logLevel: "silent",
      define: { "process.env.NODE_ENV": JSON.stringify(mode) },
      build: {
        write: false,
        minify: false,
        lib: { entry: tokensTheme, formats: ["es"], fileName: "theme" },
      },
    });
    const code = (Array.isArray(out) ? out[0] : out).output.map((c) => c.code ?? "").join("\n");
    const live = code.replace(/\/\*[\s\S]*?\*\//g, "");
    if (/\bprocess\b/.test(live)) problems.push(`@eos-ui/tokens dist/theme.js bundled for ${mode} still reads process`);
    const { defineTheme } = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
    const warn = console.warn;
    let warned = 0;
    console.warn = () => warned++;
    try {
      defineTheme({ textScale: -1 });
    } finally {
      console.warn = warn;
    }
    if (warned > 0 !== (mode === "development"))
      problems.push(`@eos-ui/tokens dist/theme.js bundled with NODE_ENV=${mode} ${warned ? "warns" : "does not warn"}`);
  }
}
for (const name of ["plugin.js", "config.js", "env.js"]) {
  const path = join(pkgRoot, "dist", name);
  if (existsSync(path) && uncommented(readFileSync(path, "utf8")).includes("import.meta.env"))
    problems.push(`dist/${name} reads import.meta.env, which the build freezes`);
}

// 5. The global component types are opt-in (`@eos-ui/vue/globals`): the package entry must not load them, since the
// plugin registers no components. `$e` is always set, so its type comes with the entry.
const indexTypes = join(pkgRoot, "dist", "index.d.ts");
const globalsTypes = join(pkgRoot, "dist", "globals.d.ts");
if (existsSync(indexTypes) && readFileSync(indexTypes, "utf8").includes("globals.js"))
  problems.push("dist/index.d.ts loads globals.d.ts; the GlobalComponents types are opt-in (@eos-ui/vue/globals)");
if (!existsSync(globalsTypes) || !readFileSync(globalsTypes, "utf8").includes("GlobalComponents"))
  problems.push("dist/globals.d.ts is missing or does not declare GlobalComponents");
if (!existsSync(join(pkgRoot, "dist", "globals.js"))) problems.push("dist/globals.js is missing");
const pluginTypes = join(pkgRoot, "dist", "plugin.d.ts");
if (!existsSync(pluginTypes) || !readFileSync(pluginTypes, "utf8").includes("$e"))
  problems.push("dist/plugin.d.ts does not declare $e");

// 6. Every component has its own path, `@eos-ui/vue/components/E<Name>` -> dist/components/<Name>/index.js and .d.ts.
const componentsDir = join(pkgRoot, "src", "components");
for (const name of readdirSync(componentsDir)) {
  if (!existsSync(join(componentsDir, name, "index.ts"))) continue;
  for (const ext of ["js", "d.ts"])
    if (!existsSync(join(pkgRoot, "dist", "components", name, `index.${ext}`)))
      problems.push(`dist/components/${name}/index.${ext} is missing (@eos-ui/vue/components/E${name})`);
}

// 7. The built-in icon set (about 9 kB gzipped) is in a bundle that imports the package entry, and not in one that imports
// only per-component paths (`@eos-ui/vue/components/EButton`, `@eos-ui/vue/plugin`). The bundler reads the package's
// `sideEffects`, so the files are bundled from inside the package directory, as a consumer's bundler would see them.
const iconMarker = readFileSync(join(pkgRoot, "dist", "icons", "phosphor.js"), "utf8").match(/M[0-9.,]{12}/)?.[0];
const bundleOf = async (code) => {
  const work = mkdtempSync(join(pkgRoot, "dist", ".shake-"));
  try {
    const entry = join(work, "entry.js");
    writeFileSync(entry, code);
    const out = await build({
      configFile: false,
      logLevel: "silent",
      root: pkgRoot,
      define: { "process.env.NODE_ENV": '"production"' },
      build: {
        write: false,
        minify: false,
        lib: { entry, formats: ["es"], fileName: "entry" },
        rollupOptions: { external: (id) => !/^[./]|^[A-Za-z]:[\\/]/.test(id) },
      },
    });
    return (Array.isArray(out) ? out[0] : out).output.map((c) => c.code ?? "").join("\n");
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
};
if (!iconMarker) problems.push("dist/icons/phosphor.js has no path data to look for");
else {
  const dist = (p) => JSON.stringify("../" + p);
  const whole = await bundleOf(`import { EIcon, createEos } from ${dist("index.js")};\nexport { EIcon, createEos };\n`);
  if (!whole.includes(iconMarker)) problems.push("a bundle of the package entry is missing the built-in icon set");
  const parts = await bundleOf(
    `import { EButton } from ${dist("components/Button/index.js")};
import { createEos } from ${dist("plugin.js")};
import { lucide } from ${dist("icons/index.js")};
export { EButton, createEos, lucide };
`,
  );
  if (parts.includes(iconMarker))
    problems.push(
      "a bundle of only per-component paths still has the built-in icon set; something imports it statically",
    );
}

// 8. The self-hosted fonts entry points at woff2 files that are in the package, and the fallback entry has both faces.
const selfHosted = join(pkgRoot, "dist", "fonts-self-hosted.css");
if (!existsSync(selfHosted)) problems.push("dist/fonts-self-hosted.css is missing");
else {
  const urls = [...readFileSync(selfHosted, "utf8").matchAll(/url\("\.\/([^"]+)"\)/g)].map((m) => m[1]);
  if (urls.length < 2) problems.push("dist/fonts-self-hosted.css has no font files");
  for (const u of urls)
    if (!existsSync(join(pkgRoot, "dist", u))) problems.push(`dist/fonts-self-hosted.css: ${u} is missing`);
}
const fallbackCss = join(pkgRoot, "dist", "fonts-fallback.css");
if (!existsSync(fallbackCss) || (readFileSync(fallbackCss, "utf8").match(/@font-face/g) ?? []).length !== 2)
  problems.push("dist/fonts-fallback.css is missing or does not have the two fallback faces");

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`dist ok (layer order declared first, ${gated} hover rules gated)`);
