import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const run = (file, args = []) => execFileSync(process.execPath, [file, ...args], { cwd: root, stdio: "inherit" });

run(join(root, "scripts/generate.mjs"));
run(require.resolve("typescript/bin/tsc"), ["-p", "tsconfig.build.json"]);
run(join(root, "scripts/emit-css.mjs"));
