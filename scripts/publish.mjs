import { execFileSync } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const run = (cmd, args, cwd = root) => execFileSync(cmd, args, { cwd, stdio: "inherit" });
const read = (cmd, args) =>
  execFileSync(cmd, args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();

const packages = ["tokens", "vue"].map((dir) => {
  const manifest = JSON.parse(readFileSync(join(root, "packages", dir, "package.json"), "utf8"));
  return { dir, name: manifest.name, version: manifest.version };
});

const published = (name, version) => {
  try {
    return read("npm", ["view", `${name}@${version}`, "version"]) === version;
  } catch {
    return false;
  }
};

const packs = mkdtempSync(join(tmpdir(), "eos-publish-"));
for (const pkg of packages) {
  if (published(pkg.name, pkg.version)) {
    console.log(`${pkg.name}@${pkg.version} is already published`);
    continue;
  }
  run("corepack", ["pnpm", "--filter", pkg.name, "pack", "--pack-destination", packs]);
  const tarball = readdirSync(packs).find((f) =>
    f.startsWith(pkg.name.replace("@", "").replace("/", "-") + "-" + pkg.version),
  );
  if (!tarball) throw new Error(`No tarball for ${pkg.name}@${pkg.version}`);
  run("npm", ["publish", join(packs, tarball), "--access", "public", "--provenance"]);
  const tag = `${pkg.name}@${pkg.version}`;
  console.log(`New tag: ${tag}`);
  // The Changesets action creates the GitHub release and pushes the tag only for tags it finds in this file, so each published package is tagged here and reported.
  run("git", ["tag", tag]);
  if (process.env.CHANGESETS_OUTPUT)
    appendFileSync(
      process.env.CHANGESETS_OUTPUT,
      JSON.stringify({ type: "git-tag", tag, packageName: pkg.name }) + "\n",
    );
}
