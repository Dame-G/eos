// `pnpm dev`: builds the tokens, then watch-builds the Vue package, and rebuilds the tokens whenever
// packages/tokens/src/tokens.json changes (the docs site reads both packages' dist).
import { execFileSync, spawn } from "node:child_process";
import { watch } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pnpm } from "./pnpm.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokensJson = join(root, "packages", "tokens", "src", "tokens.json");
const buildTokens = () =>
  execFileSync(process.execPath, [join(root, "packages", "tokens", "scripts", "build.mjs")], { stdio: "inherit" });

buildTokens();

let timer;
watch(tokensJson, () => {
  // An editor's save can fire several events; build once they settle.
  clearTimeout(timer);
  timer = setTimeout(() => {
    try {
      buildTokens();
    } catch {
      console.error("tokens build failed; fix tokens.json and save again");
    }
  }, 100);
});

const vue = spawn(pnpm[0], [...pnpm.slice(1), "--filter", "@eos-ui/vue", "dev"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32" && pnpm.length === 1,
});
vue.on("exit", (code) => process.exit(code ?? 0));
