import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { defineTheme } = await import(pathToFileURL(join(root, "dist/index.js")).href);
writeFileSync(join(root, "dist/tokens.css"), defineTheme({ name: "light" }).css({ header: true }));
console.log("dist/tokens.css written");
const dtcg = JSON.stringify(defineTheme({ name: "light" }).dtcg(), null, 2);
writeFileSync(join(root, "dist/tokens.dtcg.json"), `${dtcg}\n`);
console.log("dist/tokens.dtcg.json written");
