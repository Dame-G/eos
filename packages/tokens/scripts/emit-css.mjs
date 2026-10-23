import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { defineTheme } = await import(pathToFileURL(join(root, "dist/index.js")).href);
// The shipped sheet is the light theme and follows `prefers-contrast: more`. Following `prefers-color-scheme` is a separate sheet, because a consumer's page ground has to follow it too.
writeFileSync(join(root, "dist/tokens.css"), defineTheme({ name: "light", contrast: "auto" }).css({ header: true }));
console.log("dist/tokens.css written");
writeFileSync(
  join(root, "dist/tokens.auto.css"),
  defineTheme({ name: "light", scheme: "auto", contrast: "auto" }).css({ header: true }),
);
console.log("dist/tokens.auto.css written");
const dtcg = JSON.stringify(defineTheme({ name: "light" }).dtcg(), null, 2);
writeFileSync(join(root, "dist/tokens.dtcg.json"), `${dtcg}\n`);
console.log("dist/tokens.dtcg.json written");
