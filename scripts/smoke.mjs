import { execSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";
import { pnpmShell as pnpm } from "./pnpm.mjs";

// Packs both packages as npm would publish them, lints the tarballs (publint, arethetypeswrong), installs them in a fresh
// Vite app and checks that the app type-checks, builds for the browser and builds and renders for the server. It proves the
// packages install and import; what each component renders is scripts/ssr.mjs, which covers every one of them.

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const work = mkdtempSync(join(tmpdir(), "eos-smoke-"));
const run = (cmd, cwd = root, env = {}) => execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, ...env } });
// The consumer app builds with the versions this repo tests with (packages/vue devDependencies), never "latest".
const tested = JSON.parse(readFileSync(join(root, "packages", "vue", "package.json"), "utf8")).devDependencies;
const step = (name) => console.log(`\n== ${name}`);

// --no-build packs the build already in packages/*/dist (CI builds once for this and `pnpm check:package`).
if (!process.argv.includes("--no-build")) {
  step("build");
  run("node packages/tokens/scripts/build.mjs");
  run(`${pnpm} --filter @eos-ui/vue build`);
}

step("pack");
const packs = join(work, "packs");
mkdirSync(packs);
run(`${pnpm} --filter @eos-ui/tokens pack --pack-destination "${packs}"`);
run(`${pnpm} --filter @eos-ui/vue pack --pack-destination "${packs}"`);
const tarballs = readdirSync(packs).filter((f) => f.endsWith(".tgz"));
const tokensTgz = tarballs.find((f) => f.includes("tokens"));
const vueTgz = tarballs.find((f) => f.includes("vue"));
console.log(tarballs.join("\n"));

step("lint the packages (publint, arethetypeswrong)");
const checks = [
  [tokensTgz, "."],
  [vueTgz, ". ./resolver ./globals ./plugin ./components/EButton ./icons ./icons/builtin ./icons/iconify"],
];
for (const [tgz, entrypoints] of checks) {
  run(`${pnpm} --filter @eos-ui/vue exec publint "${join(packs, tgz)}" --strict`);
  run(
    `${pnpm} --filter @eos-ui/vue exec attw --pack "${join(packs, tgz)}" --profile esm-only --entrypoints ${entrypoints}`,
  );
}

step("create a fresh app");
const app = join(work, "app");
mkdirSync(join(app, "src"), { recursive: true });
writeFileSync(
  join(app, "package.json"),
  JSON.stringify(
    {
      name: "smoke-app",
      private: true,
      type: "module",
      scripts: {
        build: "vite build",
        "build:ssr": "vite build --ssr src/entry-server.ts --outDir dist-ssr",
        typecheck: "vue-tsc --noEmit",
      },
      dependencies: {
        vue: "^3.5.0",
        "@eos-ui/tokens": `file:../packs/${tokensTgz}`,
        "@eos-ui/vue": `file:../packs/${vueTgz}`,
      },
      devDependencies: {
        vite: tested.vite,
        "@vitejs/plugin-vue": tested["@vitejs/plugin-vue"],
        typescript: "~6",
        "vue-tsc": tested["vue-tsc"],
        "@types/node": "^22.0.0",
      },
    },
    null,
    2,
  ),
);
writeFileSync(
  join(app, "tsconfig.json"),
  JSON.stringify(
    {
      compilerOptions: {
        target: "ES2022",
        module: "ESNext",
        moduleResolution: "Bundler",
        strict: true,
        jsx: "preserve",
        skipLibCheck: false,
        noEmit: true,
        types: ["vite/client", "node"],
        lib: ["ES2023", "DOM"],
      },
      include: ["src/**/*", "env.d.ts"],
    },
    null,
    2,
  ),
);
writeFileSync(join(app, "env.d.ts"), '/// <reference types="vite/client" />\n');
writeFileSync(
  join(app, "vite.config.ts"),
  'import { defineConfig } from "vite";\nimport vue from "@vitejs/plugin-vue";\nexport default defineConfig({ plugins: [vue()] });\n',
);
writeFileSync(join(app, "index.html"), '<div id="app"></div><script type="module" src="/src/main.ts"></script>\n');
writeFileSync(
  join(app, "src/App.vue"),
  `<script setup lang="ts">
import { ref } from "vue";
import { EButton, ETextField, ESelect, ECheckbox, EDialog, ENotice, EIcon, ESurface, EActions, useToast, useLocale, defineTheme, iconNames } from "@eos-ui/vue";
const email = ref("");
const pick = ref<string>();
const open = ref(false);
const theme = defineTheme({ brand: "#2c95b4" });
void [useToast, useLocale, theme, iconNames];
</script>
<template>
  <div class="e-root">
    <ESurface>
      <ETextField v-model="email" label="Email" type="email" required />
      <ESelect v-model="pick" label="Choice" :options="['a', 'b']" />
      <ECheckbox label="Agree" />
      <ENotice tone="info" title="Hello">Body</ENotice>
      <EIcon name="check" />
      <EActions><EButton @click="open = true">Open</EButton></EActions>
      <EDialog v-model:open="open" title="Dialog">Content</EDialog>
    </ESurface>
  </div>
</template>
`,
);
writeFileSync(
  join(app, "src/main.ts"),
  'import { createApp } from "vue";\nimport { createEos } from "@eos-ui/vue";\nimport "@eos-ui/vue/style.css";\nimport { lucide } from "@eos-ui/vue/icons";\nimport App from "./App.vue";\nvoid lucide;\ncreateApp(App).use(createEos({ theme: { brand: "#2c95b4" } })).mount("#app");\n',
);
writeFileSync(
  join(app, "src/entry-server.ts"),
  'import { createSSRApp } from "vue";\nimport { renderToString } from "vue/server-renderer";\nimport { createEos } from "@eos-ui/vue";\nimport App from "./App.vue";\nexport async function render() {\n  const app = createSSRApp(App);\n  app.use(createEos());\n  return renderToString(app);\n}\n',
);

step("install (npm)");
run("npm install --no-audit --no-fund", app);

step("type check the consumer app");
run("npx vue-tsc --noEmit", app);

step("browser build");
run("npx vite build", app);
const assets = join(app, "dist", "assets");
let js = 0,
  css = 0;
for (const f of readdirSync(assets)) {
  const size = gzipSync(readFileSync(join(assets, f))).length;
  if (f.endsWith(".js")) js += size;
  if (f.endsWith(".css")) css += size;
}
console.log(`gzip: ${(js / 1024).toFixed(1)} kB js, ${(css / 1024).toFixed(1)} kB css (a page with 8 components)`);

step("SSR build and render");
run("npx vite build --ssr src/entry-server.ts --outDir dist-ssr", app);
const ssrDir = join(app, "dist-ssr");
const entry = readdirSync(ssrDir).find((f) => f.startsWith("entry-server") && f.endsWith(".js"));
const { render } = await import("file:///" + join(ssrDir, entry).replace(/\\/g, "/"));
const html = await render();
if (!html.includes("e-btn") || !html.includes("e-field"))
  throw new Error("SSR output is missing component markup:\n" + html.slice(0, 600));
console.log(`SSR ok (${html.length} bytes)`);
