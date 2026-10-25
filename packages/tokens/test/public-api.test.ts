// The public API is deliberate: every export of `@eos-ui/tokens`, value or type, is listed in public-api.txt.
// After changing it on purpose, run `pnpm --filter @eos-ui/tokens exec vitest run test/public-api.test.ts -u` and
// commit the updated file.
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { expect, test } from "vitest";
import * as api from "../src/index.js";

test("exports exactly the documented names", async () => {
  const entry = fileURLToPath(new URL("../src/index.ts", import.meta.url));
  const program = ts.createProgram([entry], {
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    target: ts.ScriptTarget.ES2022,
    resolveJsonModule: true,
    noEmit: true,
  });
  const checker = program.getTypeChecker();
  const moduleSymbol = checker.getSymbolAtLocation(program.getSourceFile(entry)!)!;
  const lines = checker
    .getExportsOfModule(moduleSymbol)
    .map((s) => {
      const target = s.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(s) : s;
      return `${target.flags & ts.SymbolFlags.Value ? "value" : "type "} ${s.name}`;
    })
    .sort((a, b) => a.slice(6).localeCompare(b.slice(6)));
  // The values TypeScript sees are the ones the module really exports.
  expect(lines.filter((l) => l.startsWith("value")).map((l) => l.slice(6))).toEqual(
    Object.keys(api).sort((a, b) => a.localeCompare(b)),
  );
  await expect(lines.join("\n") + "\n").toMatchFileSnapshot("./public-api.txt");
});
