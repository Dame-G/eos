// Checks the documentation rules in CONTRIBUTING.md ("Documentation") that a machine can check:
//
//   - every relative link in a README resolves to a file
//   - a component's first paragraph links the sibling components it names (`EDrawer` -> [`EDrawer`](../Drawer/README.md))
//   - no bare URLs outside code: write [Documentation](https://eos.dame.gg)
//   - a `|` inside a table cell is escaped (`\|`)
//   - an icon name in a component example is one of the built-in names, so the example draws something
//   - a component's intro links at least one other component, unless the README has <!-- lede: no sibling -->
//   - a component README has Accessibility, Keyboard and Related sections; a component that is not focusable
//     may write "Not focusable." on its own line under Accessibility instead of a Keyboard section
//   - a keyboard table is headed `| Key | Action |`
//
//   node scripts/check-docs.mjs

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { phosphor } from "../src/icons/phosphor.ts";

const pkg = join(dirname(fileURLToPath(import.meta.url)), "..");
const repo = resolve(pkg, "..", "..");
const components = join(pkg, "src", "components");

const builtin = new Set(Object.keys(phosphor));

const names = readdirSync(components).filter((d) => existsSync(join(components, d, "README.md")));
const files = [
  join(repo, "README.md"),
  join(repo, "CONTRIBUTING.md"),
  join(repo, "packages", "tokens", "README.md"),
  join(pkg, "README.md"),
  join(pkg, "src", "icons", "README.md"),
  join(pkg, "src", "composables", "README.md"),
  ...names.map((n) => join(components, n, "README.md")),
];

const problems = [];
const fail = (file, line, text) =>
  problems.push(`${file.slice(repo.length + 1).replaceAll("\\", "/")}:${line}  ${text}`);

const NO_SIBLING = "<!-- lede: no sibling -->";
const NOT_FOCUSABLE = /^(?:- )?Not focusable\.\s*$/m;
const sectionOf = (source, name) =>
  new RegExp(`^## ${name}[ \\t]*\\r?\\n([\\s\\S]*?)(?=^## |(?![\\s\\S]))`, "m").exec(source)?.[1] ?? null;
const lineOf = (source, index) => source.slice(0, index).split("\n").length;

/**
 * A component README has Accessibility and Related, and Keyboard unless its Accessibility section says
 * "Not focusable." on a line of its own. A keyboard table is headed `| Key | Action |`.
 */
function checkKeyboard(file, component, source) {
  for (const name of ["Accessibility", "Related"])
    if (sectionOf(source, name) === null) fail(file, 1, `no "## ${name}" section`);
  const a11y = sectionOf(source, "Accessibility") ?? "";
  const keyboard = sectionOf(source, "Keyboard");
  if (NOT_FOCUSABLE.test(a11y) && keyboard !== null)
    fail(file, 1, `"Not focusable." under Accessibility and a Keyboard section: keep one`);
  if (!NOT_FOCUSABLE.test(a11y) && keyboard === null)
    fail(file, 1, `no "## Keyboard" section: add one, or "Not focusable." under Accessibility`);
  for (const m of source.matchAll(/^\| Key\s*\|\s*([^|]+?)\s*\|$/gm)) {
    if (m[1] !== "Action") fail(file, lineOf(source, m.index), `keyboard table header "${m[1]}": write "| Key | Action |"`);
  }
}

for (const file of files) {
  const component = file.startsWith(components) ? file.split(/[\\/]/).at(-2) : null;
  const source = readFileSync(file, "utf8");
  const lines = source.split(/\r?\n/);
  if (component) {
    // The intro names the sibling to use instead. A component with no sibling to point at says so with the marker.
    const siblings = [...(lines[2] ?? "").matchAll(/\[`E([A-Z][A-Za-z]+)`\]\(\.\.\/\1\/README\.md\)/g)];
    if (!siblings.some((m) => m[1] !== component) && !source.includes(NO_SIBLING))
      fail(file, 3, `the intro links no other component: say which to use instead, or add ${NO_SIBLING}`);
    checkKeyboard(file, component, source);
  }
  let fenced = false;
  lines
    .forEach((text, i) => {
      const line = i + 1;
      if (text.startsWith("```")) {
        fenced = !fenced;
        return;
      }
      if (fenced) {
        if (component) {
          for (const m of text.matchAll(/(?<!:)\bicon(?:=|: )["']([^"':]+)["']/g)) {
            if (!builtin.has(m[1])) fail(file, line, `icon "${m[1]}" is not a built-in name`);
          }
        }
        return;
      }
      const prose = text.replace(/`[^`]*`/g, "");

      for (const m of text.replace(/``.+?``/g, "").matchAll(/\]\((?!https?:|#|mailto:)([^)\s]+)\)/g)) {
        const target = resolve(dirname(file), m[1].split("#")[0]);
        if (!existsSync(target)) fail(file, line, `broken link ${m[1]}`);
      }
      if (/(?<![(<[])https?:\/\/\S+/.test(prose.replace(/\]\([^)]*\)/g, "")))
        fail(file, line, "bare URL: use [text](url)");

      if (text.startsWith("|")) {
        for (const m of text.matchAll(/`([^`]*)`/g)) {
          if (/(?<!\\)\|/.test(m[1])) fail(file, line, "unescaped | in a table cell: write \\|");
        }
      }

      if (component && line === 3) {
        for (const m of text.matchAll(/(?<!\[)`E([A-Z][A-Za-z]+)`(?!\])/g)) {
          if (m[1] !== component && names.includes(m[1])) fail(file, line, `link \`E${m[1]}\` to ../${m[1]}/README.md`);
        }
      }
    });
}

if (problems.length) {
  console.error(`${problems.length} documentation problem(s):\n${problems.join("\n")}`);
  process.exit(1);
}
console.log(`docs ok (${files.length} files)`);
