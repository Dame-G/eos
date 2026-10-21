// Writes dist/llms.txt (an index) and dist/llms-full.txt (every README in one file) for AI coding assistants,
// following https://llmstxt.org. Both are built from the READMEs, so they never drift from the docs.
//
//   node scripts/gen-llms.mjs

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pkg = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = join(pkg, "..", "..");
const components = join(pkg, "src", "components");
const dist = join(pkg, "dist");
const base = "https://github.com/Dame-G/eos/blob/main";

const read = (file) => readFileSync(file, "utf8").replace(/\r\n/g, "\n").trim();
const version = JSON.parse(read(join(pkg, "package.json"))).version;

/** The first paragraph after the title, as plain text with links reduced to their words. */
function intro(markdown) {
  const para =
    markdown
      .split("\n")
      .slice(1)
      .join("\n")
      .trim()
      .split(/\n\s*\n/)[0] ?? "";
  return para
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

/** Relative links in a README point at sibling files; rewrite them to absolute ones so they work outside the repo. */
function absolutise(markdown, dirFromRepo) {
  return markdown.replace(/\]\((?!https?:|#|mailto:)([^)\s]+)\)/g, (_, target) => {
    const parts = [...dirFromRepo.split("/"), ...target.split("/")];
    const out = [];
    for (const p of parts) {
      if (p === "..") out.pop();
      else if (p !== ".") out.push(p);
    }
    return `](${base}/${out.join("/")})`;
  });
}

const names = readdirSync(components)
  .filter((d) => existsSync(join(components, d, "README.md")))
  .sort();

const entries = names.map((folder) => {
  const markdown = read(join(components, folder, "README.md"));
  const title = /^# (.+)$/m.exec(markdown)?.[1] ?? `E${folder}`;
  return { folder, title, markdown, summary: intro(markdown) };
});

const sections = [
  { title: "@eos-ui/vue", path: join(pkg, "README.md"), dir: "packages/vue" },
  { title: "Composables", path: join(pkg, "src", "composables", "README.md"), dir: "packages/vue/src/composables" },
  { title: "@eos-ui/tokens", path: join(repo, "packages", "tokens", "README.md"), dir: "packages/tokens" },
  { title: "Icons", path: join(pkg, "src", "icons", "README.md"), dir: "packages/vue/src/icons" },
].filter((s) => existsSync(s.path));

const tagline = intro(read(join(pkg, "README.md")));

const index = [
  `# EOS (@eos-ui/vue ${version})`,
  "",
  `> ${tagline}`,
  "",
  "Every component is a Vue 3 single-file component named `E` plus its name (`EButton`, `ETextField`). All CSS lives in the cascade layers `e.*`, so your own styles win without `!important`. Every component and composable is exported from `@eos-ui/vue`; import `@eos-ui/vue/style.css` once. Use `llms-full.txt` for the complete documentation in one file.",
  "",
  "## Guides",
  "",
  ...sections.map((s) => `- [${s.title}](${base}/${s.dir}/README.md)`),
  "",
  "## Components",
  "",
  ...entries.map((e) => `- [${e.title}](${base}/packages/vue/src/components/${e.folder}/README.md): ${e.summary}`),
  "",
  "## Optional",
  "",
  `- [Contributing](${base}/CONTRIBUTING.md): conventions for props, naming, layers and accessibility`,
  "",
].join("\n");

const full = [
  `# EOS (@eos-ui/vue ${version}): complete documentation`,
  "",
  `> ${tagline}`,
  "",
  ...sections.flatMap((s) => [`${"=".repeat(3)} ${s.title} ${"=".repeat(3)}`, "", absolutise(read(s.path), s.dir), ""]),
  ...entries.flatMap((e) => [
    `${"=".repeat(3)} ${e.title} ${"=".repeat(3)}`,
    "",
    absolutise(e.markdown, `packages/vue/src/components/${e.folder}`),
    "",
  ]),
].join("\n");

mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, "llms.txt"), index);
writeFileSync(join(dist, "llms-full.txt"), full);
console.log(`llms.txt: ${entries.length} components, ${sections.length} guides (${full.length} bytes full)`);
