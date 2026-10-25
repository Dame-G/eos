// How the root scripts call pnpm: the pnpm that started them (`pnpm smoke` sets npm_execpath), else a `pnpm` on PATH,
// else `corepack pnpm` (corepack is no longer bundled from Node 25, so it is the last resort, not the default).
import { execFileSync } from "node:child_process";

function find() {
  const exec = process.env.npm_execpath;
  if (exec && /pnpm/i.test(exec)) return /\.c?js$/.test(exec) ? [process.execPath, exec] : [exec];
  for (const cmd of [["pnpm"], ["corepack", "pnpm"]]) {
    try {
      execFileSync(cmd[0], [...cmd.slice(1), "--version"], { stdio: "ignore", shell: process.platform === "win32" });
      return cmd;
    } catch {}
  }
  throw new Error("pnpm was not found: install pnpm 12 or enable corepack");
}

/** The command and leading arguments that run pnpm, e.g. ["pnpm"] or [node, ".../pnpm.cjs"]. */
export const pnpm = find();

/** Quotes one argument for a shell command line. */
const quote = (a) => (/[\s"]/.test(a) ? `"${a.replaceAll('"', '\\"')}"` : a);

/** pnpm as a shell command prefix, for execSync strings. */
export const pnpmShell = pnpm.map(quote).join(" ");
