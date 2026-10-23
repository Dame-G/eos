import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { playwright } from "@vitest/browser-playwright";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import layers from "./scripts/postcss-layers.ts";
import hover from "./scripts/postcss-hover.ts";
import { ssrRender } from "./test/ssr/command.ts";
import { LAYER_ORDER } from "@eos-ui/tokens";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

// Each component folder is an entry of its own, so `@eos-ui/vue/components/EButton` resolves to a module that exists
// (a file that only re-exports would otherwise be folded into its importers).
const componentEntries = Object.fromEntries(
  readdirSync(src("./src/components"), { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(src(`./src/components/${d.name}/index.ts`)))
    .map((d) => [`components/${d.name}/index`, src(`./src/components/${d.name}/index.ts`)]),
);

const pkg = JSON.parse(readFileSync(src("./package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const external = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})].map(
  (name) => new RegExp(`^${name.replace(/[/@.-]/g, "\\$&")}(/|$)`),
);

// Browsers the tests run in. Default: Chromium. EOS_BROWSERS="chromium,firefox,webkit" adds engines (install them with
// `playwright install firefox webkit`); CI runs them in a separate, non-blocking job.
const engines = (process.env.EOS_BROWSERS ?? "chromium")
  .split(",")
  .map((b) => b.trim())
  .filter((b): b is "chromium" | "firefox" | "webkit" => ["chromium", "firefox", "webkit"].includes(b));

// Locally Chromium runs as the installed Edge, which needs no download. Without Edge (or in CI) it falls back to
// Playwright's own Chromium. EOS_BROWSER_CHANNEL overrides: "chrome", "msedge", or "chromium" to force the bundled one.
const edge = [
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/microsoft-edge",
  "/opt/microsoft/msedge/msedge",
].some((path) => existsSync(path));
const requested = process.env.EOS_BROWSER_CHANNEL ?? (!process.env.CI && edge ? "msedge" : "chromium");
const channel = requested === "chromium" ? undefined : requested;

// The template compiler the tests' string slots go through. @vue/test-utils compiles them with prefixIdentifiers,
// which only the full (CommonJS) compiler supports, and the dependency bundle gives it that compiler-core. Its
// compiler-dom was the ES build, which passes decodeEntities, so the pair warned on every string slot. One build for both.
const fromVue = createRequire(createRequire(import.meta.url).resolve("vue/package.json"));
const compilerDomCjs = fromVue
  .resolve("@vue/compiler-dom/package.json")
  .replace(/package\.json$/, "dist/compiler-dom.cjs.js");
const oneCompiler = {
  name: "e-one-compiler",
  resolveId: (id: string) => (id === "@vue/compiler-dom" ? compilerDomCjs : null),
};

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    ...(command === "build"
      ? [
          dts({
            tsconfigPath: "./tsconfig.build.json",
            entryRoot: "src",
            exclude: ["**/*.test.ts", "**/*.stories.ts", "test/**"],
            beforeWriteFile(filePath, content) {
              const fixed = content.replace(
                /(\bfrom\s+|\bimport\(\s*|\bimport\s+)(["'])(\.{1,2}\/[^"']*)\2/g,
                (match, lead: string, quote: string, spec: string) =>
                  /\.(js|json|css)$/.test(spec) ? match : `${lead}${quote}${spec}.js${quote}`,
              );
              return { filePath, content: fixed };
            },
          }),
        ]
      : []),
    {
      name: "e-copy-static-css",
      closeBundle() {
        mkdirSync(src("./dist"), { recursive: true });
        copyFileSync(src("./src/styles/fonts.css"), src("./dist/fonts.css"));
      },
    },
    {
      // Minifying merges the layer blocks and drops the order statement the cascade depends on.
      name: "e-layer-order",
      closeBundle() {
        const file = src("./dist/style.css");
        if (!existsSync(file)) return;
        const css = readFileSync(file, "utf8");
        const statement = `@layer ${LAYER_ORDER};`;
        if (!css.startsWith(statement)) writeFileSync(file, statement + css);
      },
    },
  ],
  ...(command === "build" ? {} : { optimizeDeps: { rolldownOptions: { plugins: [oneCompiler] } } }),
  css: { postcss: { plugins: [layers(), hover()] } },
  build: {
    target: "es2022",
    sourcemap: true,
    cssCodeSplit: false,
    cssMinify: "lightningcss",
    cssTarget: "esnext",
    lib: {
      cssFileName: "style",
      entry: {
        index: src("./src/index.ts"),
        resolver: src("./src/resolver.ts"),
        globals: src("./src/globals.ts"),
        plugin: src("./src/plugin.ts"),
        "icons/index": src("./src/icons/index.ts"),
        "icons/iconify": src("./src/icons/iconify.ts"),
        "icons/builtin": src("./src/icons/builtin.ts"),
        ...componentEntries,
      },
      formats: ["es"],
    },
    rollupOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    // A passing assertion returns at once; the longer limit only gives a slow CI runner room to open a popup or settle a layout.
    expect: { poll: { timeout: 5000 } },
    // The browser tests click real controls; on a loaded CI runner one click can land before a popup is ready. A genuine failure still fails on the retry.
    retry: process.env.CI ? 1 : 0,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright(),
      instances: engines.map((browser) => ({
        browser,
        ...(browser === "chromium" && channel ? { provider: playwright({ launchOptions: { channel } }) } : {}),
      })),
      viewport: { width: 640, height: 800 },
      // test/ssr.test.ts asks Node for the server render of a component, through the dev server's SSR module graph.
      commands: { ssrRender },
    },
  },
}));
