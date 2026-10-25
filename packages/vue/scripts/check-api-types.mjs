// The type exports of `@eos-ui/vue` are deliberate too: every type-only export of the built entry (dist/index.d.ts) is
// listed in test/public-types.txt, as the runtime names are in test/public-api.txt. Needs a build.
//   node scripts/check-api-types.mjs            fail when the list differs (`pnpm check:package` runs it)
//   node scripts/check-api-types.mjs --update   rewrite the list after changing the types on purpose, then commit it
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pkgRoot } from "./css-lib.mjs";

const ts = createRequire(import.meta.url)("typescript");
const entry = join(pkgRoot, "dist", "index.d.ts");
const snapshot = join(pkgRoot, "test", "public-types.txt");
if (!existsSync(entry)) {
  console.error("dist/index.d.ts is missing. Run `pnpm build` first.");
  process.exit(1);
}

const program = ts.createProgram([entry], {
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  target: ts.ScriptTarget.ES2022,
  skipLibCheck: true,
  noEmit: true,
});
const checker = program.getTypeChecker();
const names = checker
  .getExportsOfModule(checker.getSymbolAtLocation(program.getSourceFile(entry)))
  .filter((s) => {
    const target = s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
    return !(target.flags & ts.SymbolFlags.Value);
  })
  .map((s) => s.name)
  .sort((a, b) => a.localeCompare(b));
const next = names.join("\n") + "\n";

if (process.argv.includes("--update")) {
  writeFileSync(snapshot, next);
  console.log(`test/public-types.txt: ${names.length} type exports`);
} else {
  const current = existsSync(snapshot) ? readFileSync(snapshot, "utf8").replaceAll("\r\n", "\n") : "";
  if (current !== next) {
    const was = new Set(current.split("\n").filter(Boolean));
    const now = new Set(names);
    const added = names.filter((n) => !was.has(n));
    const removed = [...was].filter((n) => !now.has(n));
    console.error(
      `The type exports of dist/index.d.ts differ from test/public-types.txt.` +
        (added.length ? `\n  added: ${added.join(", ")}` : "") +
        (removed.length ? `\n  removed: ${removed.join(", ")}` : "") +
        `\nIf the change is deliberate, run \`node scripts/check-api-types.mjs --update\` in packages/vue and commit it.`,
    );
    process.exit(1);
  }
  console.log(`type exports ok (${names.length})`);
}
