// Generates the "## Props" table of every component README from the component source, so the
// table cannot drift. The table is written between <!-- props:start --> and <!-- props:end -->.
//
//   node scripts/gen-props.mjs           rewrite the READMEs
//   node scripts/gen-props.mjs --check   fail (exit 1) if any README is out of date
//
// What is read, from src/components/<Name>/E<Name>.vue:
//   - defineProps<{ ... }>() members: name, type as written, `?` (optional or Required), JSDoc.
//     The type may also be a reference (interface, type alias, intersection, union) to something
//     in the same file or an imported .ts/.vue file; unions are merged (required only if every branch requires it).
//   - withDefaults(..., { ... }): the default. A boolean without a default is `false`.
//   - defineModel<T>(...) / defineModel<T>("name", ...): the v-model props (`modelValue` when unnamed),
//     described by the JSDoc above the `const x = defineModel` statement.
// The READMEs are written through Prettier. To change a row, edit the JSDoc or the default in the .vue file, never the table.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);
const ts = require("typescript");

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "components");
const check = process.argv.includes("--check");
const jsonOut = process.argv.find((a) => a.startsWith("--json="))?.slice(7); // dev aid: where each row's JSDoc sits
const dump = [];
const START = "<!-- props:start -->";
const END = "<!-- props:end -->";

// Prettier belongs to the repo root, so it is looked up from there. The READMEs are written through it,
// so the tables are already formatted and `prettier --check` passes right after a run.
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const loadPrettier = async () => {
  const mod = await import(pathToFileURL(createRequire(join(repoRoot, "package.json")).resolve("prettier")).href);
  return mod.default ?? mod;
};
const prettier = check ? null : await loadPrettier();

const warnings = [];
const warn = (m) => warnings.push(m);

// ---------------------------------------------------------------- source loading

const fileCache = new Map();

/** Parses a .ts file, or the <script> blocks of a .vue file. */
function load(file) {
  if (fileCache.has(file)) return fileCache.get(file);
  let text = readFileSync(file, "utf8");
  if (file.endsWith(".vue")) {
    // Keep only the <script> contents, blanking the rest so offsets stay those of the file.
    const keep = [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => [
      m.index + m[0].indexOf(">") + 1,
      m[1].length,
    ]);
    text = text.replace(/[^\r\n]/g, (c, i) => (keep.some(([a, n]) => i >= a && i < a + n) ? c : " "));
  }
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const entry = { file, text, sf };
  fileCache.set(file, entry);
  return entry;
}

function resolveImport(from, spec) {
  if (!spec.startsWith(".")) return null;
  const base = resolve(dirname(from), spec);
  for (const c of [base, base.replace(/.js$/, ".ts"), base.replace(/.js$/, ".vue"), `${base}.ts`, `${base}.vue`]) {
    if (/.(ts|vue)$/.test(c) && existsSync(c)) return c;
  }
  return null;
}

// ---------------------------------------------------------------- text helpers

const squash = (s) => s.replace(/\s+/g, " ").trim();

/** Where a node and its JSDoc sit in its file (used by --json). */
function locate(node, src) {
  const docs = node.jsDoc ?? [];
  return {
    file: src.file,
    start: node.getStart(src.sf),
    docStart: docs.length ? docs[0].getStart(src.sf) : null,
    docEnd: docs.length ? docs[docs.length - 1].end : null,
  };
}

/** The last JSDoc comment before a node, as one line of text. */
function docOf(node, src, what) {
  const docs = node.jsDoc;
  if (!docs || !docs.length) return "";
  if (docs.length > 1) warn(`${what}: ${docs.length} stacked JSDoc comments, using the last`);
  const d = docs[docs.length - 1];
  const raw = src.text.slice(d.pos, d.end);
  return squash(
    raw
      .replace(/^\/\*\*/, "")
      .replace(/\*\/$/, "")
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, ""))
      .join(" "),
  );
}

const nameOf = (m) => (m.name && (ts.isIdentifier(m.name) || ts.isStringLiteral(m.name)) ? m.name.text : null);

// ---------------------------------------------------------------- resolving a props type to members

/**
 * Returns a list of alternatives; each alternative is an array of
 * { name, optional, type, doc }. A plain object type is one alternative; a union is several.
 */
function alternatives(node, src, seen = new Set()) {
  if (ts.isParenthesizedTypeNode(node)) return alternatives(node.type, src, seen);
  if (ts.isTypeLiteralNode(node)) return [membersOf(node.members, src)];
  if (ts.isIntersectionTypeNode(node)) {
    return node.types
      .map((t) => alternatives(t, src, seen))
      .reduce((acc, alts) => acc.flatMap((a) => alts.map((b) => [...a, ...b])), [[]]);
  }
  if (ts.isUnionTypeNode(node)) return node.types.flatMap((t) => alternatives(t, src, seen));
  if (ts.isTypeReferenceNode(node) && ts.isIdentifier(node.typeName)) return fromName(node.typeName.text, src, seen);
  throw new Error(`cannot read props from type ${node.getText(src.sf)}`);
}

function membersOf(members, src) {
  const out = [];
  for (const m of members) {
    if (!ts.isPropertySignature(m)) continue;
    const name = nameOf(m);
    if (!name) continue;
    out.push({
      name,
      optional: !!m.questionToken,
      type: squash(m.type ? m.type.getText(src.sf) : "unknown"),
      doc: docOf(m, src, name),
      at: locate(m, src),
    });
  }
  return out;
}

function fromName(name, src, seen) {
  const key = `${src.file}#${name}`;
  if (seen.has(key)) return [[]];
  seen.add(key);
  for (const st of src.sf.statements) {
    if (ts.isInterfaceDeclaration(st) && st.name.text === name) {
      const own = membersOf(st.members, src);
      const parents = (st.heritageClauses ?? [])
        .flatMap((h) => h.types)
        .map((t) => fromName(t.expression.text, src, seen));
      const base = parents.reduce((acc, alts) => acc.flatMap((a) => alts.map((b) => [...a, ...b])), [[]]);
      return base.map((b) => [...b, ...own]);
    }
    if (ts.isTypeAliasDeclaration(st) && st.name.text === name) return alternatives(st.type, src, seen);
    if (ts.isImportDeclaration(st) && st.importClause) {
      const named = st.importClause.namedBindings;
      const hit = named && ts.isNamedImports(named) && named.elements.find((e) => e.name.text === name);
      if (hit) {
        const target = resolveImport(src.file, st.moduleSpecifier.text);
        if (!target) throw new Error(`cannot resolve import of ${name} from ${st.moduleSpecifier.text}`);
        return fromName((hit.propertyName ?? hit.name).text, load(target), seen);
      }
    }
  }
  throw new Error(`type ${name} not found in ${src.file}`);
}

/** Merges alternatives: required only when every alternative requires it. */
function merge(alts) {
  const names = [];
  for (const a of alts) for (const m of a) if (!names.includes(m.name)) names.push(m.name);
  return names.map((name) => {
    const hits = alts.map((a) => a.find((m) => m.name === name));
    const present = hits.filter(Boolean);
    const first = present.find((m) => m.doc) ?? present[0];
    const reqIn = alts.filter((a, i) => hits[i] && !hits[i].optional).length;
    return {
      name,
      type: first.type,
      doc: first.doc,
      at: first.at,
      required: reqIn === alts.length,
      conditional: reqIn > 0 && reqIn < alts.length,
    };
  });
}

// ---------------------------------------------------------------- extraction from a component

function defaultText(init, src) {
  let t = init;
  if ((ts.isArrowFunction(t) || ts.isFunctionExpression(t)) && t.parameters.length === 0) {
    let body = t.body;
    if (ts.isBlock(body)) {
      const ret =
        body.statements.length === 1 && ts.isReturnStatement(body.statements[0]) ? body.statements[0].expression : null;
      if (!ret) return squash(t.getText(src.sf));
      body = ret;
    }
    while (ts.isParenthesizedExpression(body)) body = body.expression;
    return squash(body.getText(src.sf));
  }
  return squash(t.getText(src.sf));
}

function objectDefaults(obj, src) {
  const out = new Map();
  if (!obj || !ts.isObjectLiteralExpression(obj)) return out;
  for (const p of obj.properties) {
    if (ts.isPropertyAssignment(p) && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name))) {
      // `undefined` means "no default" (for example a flag that is on or off only when the caller says so).
      if (ts.isIdentifier(p.initializer) && p.initializer.text === "undefined") out.set(p.name.text, null);
      else out.set(p.name.text, defaultText(p.initializer, src));
    } else if (ts.isMethodDeclaration(p) && ts.isIdentifier(p.name)) {
      out.set(p.name.text, "(function)");
    }
  }
  return out;
}

function walk(node, fn) {
  fn(node);
  ts.forEachChild(node, (c) => walk(c, fn));
}

function extract(file) {
  const src = load(file);
  let propsType = null;
  let defaults = new Map();
  const models = [];

  walk(src.sf, (n) => {
    if (!ts.isCallExpression(n) || !ts.isIdentifier(n.expression)) return;
    const fn = n.expression.text;
    if (fn === "withDefaults") {
      defaults = objectDefaults(n.arguments[1], src);
    } else if (fn === "defineProps") {
      if (n.typeArguments?.length) propsType = n.typeArguments[0];
    } else if (fn === "defineModel") {
      const first = n.arguments[0];
      const named = first && ts.isStringLiteral(first) ? first.text : null;
      const optsArg = named ? n.arguments[1] : n.arguments[0];
      let def = null;
      let required = false;
      if (optsArg && ts.isObjectLiteralExpression(optsArg)) {
        for (const p of optsArg.properties) {
          if (!ts.isPropertyAssignment(p) || !ts.isIdentifier(p.name)) continue;
          if (p.name.text === "default") def = defaultText(p.initializer, src);
          if (p.name.text === "required" && p.initializer.kind === ts.SyntaxKind.TrueKeyword) required = true;
        }
      }
      // JSDoc sits on the enclosing `const x = defineModel(...)` statement.
      let stmt = n;
      while (stmt && !ts.isVariableStatement(stmt)) stmt = stmt.parent;
      const name = named ?? "modelValue";
      models.push({
        name,
        model: true,
        type: n.typeArguments?.length ? squash(n.typeArguments[0].getText(src.sf)) : "unknown",
        doc: stmt ? docOf(stmt, src, `model ${name}`) : "",
        at: stmt ? locate(stmt, src) : null,
        required,
        def,
      });
    }
  });

  const props = propsType ? merge(alternatives(propsType, src)) : [];
  return { props, defaults, models };
}

// ---------------------------------------------------------------- table

const esc = (s) => s.replace(/\|/g, "\\|");
const code = (s) => `\`${esc(s)}\``;

function row(p, defaults) {
  // A default that lives in the template or a composable is written in the JSDoc as `@default value`.
  let doc = p.doc;
  let tagDefault = null;
  const dm = /(?:^|\s)@default\s+(.+)$/.exec(doc);
  if (dm) {
    tagDefault = dm[1].trim();
    doc = doc.slice(0, dm.index).trim();
  }
  let def;
  if (p.required) def = "**Required**";
  else if (p.model && p.def != null) def = code(p.def);
  else if (!p.model && defaults.get(p.name)) def = code(defaults.get(p.name));
  else if (tagDefault) def = code(tagDefault);
  else if (!p.model && defaults.has(p.name))
    def = "None"; // declared as `undefined`: no default, even for a boolean
  else if (p.type === "boolean") def = "`false`";
  else def = "None";

  let note = doc.replace(/^Required\.\s*/i, "");
  if (p.model) {
    const prefix = p.name === "modelValue" ? "v-model" : `v-model:${p.name}`;
    // The prefix is code: a bare `v-model:end:` would be turned into an emoji by markdown-it.
    const lead = "`" + prefix + "`";
    note = note ? `${lead}: ${note.replace(/^[A-Z](?=[a-z])/, (c) => c.toLowerCase())}` : lead;
  }
  return `| ${code(p.name)} | ${code(p.type)} | ${def} | ${esc(note)} |`;
}

function table(info) {
  const rows = [...info.models, ...info.props];
  const lines = [
    "| Prop | Type | Default | Notes |",
    "| --- | --- | --- | --- |",
    ...rows.map((p) => row(p, info.defaults)),
  ];
  return { text: lines.join("\n"), count: rows.length };
}

// ---------------------------------------------------------------- README rewriting

function rewrite(readme, tableText) {
  const block = `${START}\n\n${tableText}\n\n${END}`;
  const s = readme.indexOf(START);
  const e = readme.indexOf(END);
  if (s !== -1 && e !== -1 && e > s) return readme.slice(0, s) + block + readme.slice(e + END.length);

  const lines = readme.split("\n");
  const h = lines.findIndex((l) => /^## Props\s*$/.test(l));
  if (h === -1) return null;
  let i = h + 1;
  while (i < lines.length && !lines[i].startsWith("|") && !/^## /.test(lines[i])) i++;
  if (i >= lines.length || !lines[i].startsWith("|")) return null;
  let j = i;
  while (j < lines.length && lines[j].startsWith("|")) j++;
  return [...lines.slice(0, i), ...block.split("\n"), ...lines.slice(j)].join("\n");
}

// ---------------------------------------------------------------- main

const stale = [];
let components = 0;
let propCount = 0;
const skipped = [];

for (const d of readdirSync(root, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .sort((a, b) => a.name.localeCompare(b.name))) {
  const dir = join(root, d.name);
  const sfc = join(dir, `E${d.name}.vue`);
  const readmePath = join(dir, "README.md");
  if (!existsSync(sfc) || !existsSync(readmePath)) {
    skipped.push(`${d.name} (no ${existsSync(sfc) ? "README" : "component"})`);
    continue;
  }
  let info;
  try {
    info = extract(sfc);
  } catch (err) {
    console.error(`${d.name}: ${err.message}`);
    process.exitCode = 1;
    continue;
  }
  const raw = readFileSync(readmePath, "utf8");
  const crlf = raw.includes("\r\n");
  const readme = raw.replace(/\r\n/g, "\n");
  if (info.props.length + info.models.length === 0) {
    if (/^## Props\s*$/m.test(readme) || readme.includes(START)) {
      console.error(`${d.name}: README has a Props section but the component declares no props`);
      process.exitCode = 1;
    } else skipped.push(`${d.name} (no props)`);
    continue;
  }
  const { text, count } = table(info);
  for (const p of [...info.models, ...info.props])
    dump.push({ component: d.name, name: p.name, model: !!p.model, at: p.at });
  const next = rewrite(readme, text);
  if (next === null) {
    console.error(`${d.name}: README has no "## Props" table or markers to fill`);
    process.exitCode = 1;
    continue;
  }
  components++;
  propCount += count;
  // Padding is ignored, so running prettier over the tables does not make them "stale".
  const squashTable = (s) => s.replace(/[ \t]+/g, " ").replace(/-{3,}/g, "---");
  if (squashTable(next) !== squashTable(readme)) {
    stale.push(d.name);
    if (!check) {
      const options = (await prettier.resolveConfig(readmePath)) ?? {};
      const formatted = await prettier.format(next, { ...options, filepath: readmePath });
      writeFileSync(readmePath, crlf ? formatted.replace(/\n/g, "\r\n") : formatted);
    }
  }
}

if (jsonOut) writeFileSync(jsonOut, JSON.stringify(dump, null, 1));
for (const w of warnings) console.warn(`warning: ${w}`);

if (check) {
  if (stale.length) {
    console.error(
      `Props tables out of date for: ${stale.join(", ")}.\nRun \`node scripts/gen-props.mjs\` (edit the JSDoc or defaults in the .vue file, not the table).`,
    );
    process.exitCode = 1;
  } else if (!process.exitCode)
    console.log(`Props tables are up to date (${components} components, ${propCount} props).`);
} else {
  console.log(
    `gen-props: ${components} components, ${propCount} props; ${stale.length} README(s) changed${skipped.length ? `; skipped: ${skipped.join(", ")}` : ""}.`,
  );
}
