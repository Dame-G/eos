// Renders every exported component on the server, in plain Node, from the built package (packages/vue/dist).
// Each one must render with the plugin and without it, give the same HTML twice (stable ids), and log no Vue warning.
// The props and slots come from packages/vue/test/ssr/fixtures.ts, the same cases the hydration test renders.
// Needs a build.   node scripts/ssr.mjs   (or `pnpm ssr`; `pnpm check:package` runs it)
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pkg = join(root, "packages", "vue");
const entry = join(pkg, "dist", "index.js");
if (!existsSync(entry)) {
  console.error("packages/vue/dist is missing. Run `pnpm build` first.");
  process.exit(1);
}
if (!process.features.typescript) {
  console.error("scripts/ssr.mjs loads test/ssr/fixtures.ts with Node's type stripping: use Node 22.18 or later.");
  process.exit(1);
}
// Vue as the package resolves it, so the components and the renderer share one copy.
const fromPkg = createRequire(join(pkg, "package.json"));
const toUrl = (p) => pathToFileURL(p).href;
const { createSSRApp, h } = await import(toUrl(fromPkg.resolve("vue")));
const { renderToString } = await import(toUrl(fromPkg.resolve("vue/server-renderer")));
const eos = await import(toUrl(entry));
const { componentNames } = await import(toUrl(join(pkg, "dist", "component-names.js")));
const { casesOf, componentsOf, tree, OPEN_AFTER_HYDRATION } = await import(toUrl(join(pkg, "test/ssr/fixtures.ts")));

const warnings = [];
const origWarn = console.warn;
console.warn = (...a) => warnings.push(a.map(String).join(" "));

const results = [];
const note = (name, ok, detail = "") => results.push({ name, ok, detail });

const components = componentsOf(eos);

async function render(vnode, withPlugin, options = {}) {
  const app = createSSRApp({ render: vnode });
  if (withPlugin) app.use(eos.createEos({ locale: "fr-CA", currency: "CAD", ...options }));
  return renderToString(app);
}
// The tree is wrapped in <div id="ssr-root-child">; a modal leaves only comments inside it.
const drawn = (html) => html.replace(/^<div id="ssr-root-child">|<\/div>$|<!--[^]*?-->/g, "");

note(
  "The package loads in plain Node (no CSS imports in the JavaScript)",
  typeof eos.createEos === "function",
  `${Object.keys(eos).length} exports`,
);

for (const c of casesOf(eos)) {
  const vnode = tree(c);
  const quiet = OPEN_AFTER_HYDRATION.has(c.name);
  const before = warnings.length;
  try {
    const a = await render(vnode, true);
    const b = await render(vnode, true);
    const plain = await render(vnode, false);
    note(`${c.id} renders on the server`, quiet || drawn(a) !== "", `${a.length} characters`);
    note(`${c.id} gives the same HTML twice (stable ids)`, a === b);
    note(`${c.id} renders without the plugin`, quiet || drawn(plain) !== "");
  } catch (e) {
    note(`${c.id} renders on the server`, false, String(e?.message ?? e).split("\n")[0]);
  }
  const vue = warnings.slice(before).filter((w) => w.includes("[Vue warn]"));
  note(`${c.id} renders with no Vue warning`, vue.length === 0, vue[0]?.split("\n")[0]);
}
const missing = [...componentNames].filter((n) => !components.some(([name]) => name === n));
note(
  "every component in component-names.ts is exported and was rendered",
  missing.length === 0 && components.length === componentNames.size,
  missing.length ? `missing: ${missing.join(", ")}` : `${components.length} components`,
);

const cal = await render(() => h(eos.ECalendar, { month: new Date(2026, 9, 1) }), true);
note(
  "The locale reaches the server HTML (French month name)",
  /octobre/i.test(cal),
  (cal.match(/octobre|October/i) ?? ["none"])[0],
);

const css = eos.defineTheme({ brand: "#8a2be2" }).css({ header: true });
note(
  "defineTheme().css() gives a stylesheet for <head>",
  css.includes("--e-primary") && css.includes("@layer"),
  `${css.length} characters`,
);
note("themeCss() works without a document", eos.themeCss({ brand: "#8a2be2" }).includes("--e-primary"));

const modal = await render(() => h(eos.EDialog, { open: true, title: "Confirm" }, () => "Body"), true);
note(
  "A modal dialog that starts open leaves nothing in the server HTML",
  !modal.includes("Body"),
  `${modal.length} characters`,
);

console.warn = origWarn;
const failed = results.filter((r) => !r.ok);
for (const r of process.argv.includes("--verbose") ? results : failed)
  console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? "  (" + r.detail + ")" : ""}`);
console.log(
  `server render: ${results.length - failed.length} of ${results.length} checks pass, ${components.length} components`,
);
process.exit(failed.length ? 1 : 0);
