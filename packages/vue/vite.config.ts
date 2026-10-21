import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { playwright } from "@vitest/browser-playwright";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import layers from "./scripts/postcss-layers.ts";
import hover from "./scripts/postcss-hover.ts";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const pkg = JSON.parse(readFileSync(src("./package.json"), "utf8")) as {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};
const external = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.peerDependencies ?? {})].map(
  (name) => new RegExp(`^${name.replace(/[/@.-]/g, "\\$&")}(/|$)`),
);

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
  ],
  css: { postcss: { plugins: [layers(), hover()] } },
  build: {
    target: "es2022",
    sourcemap: true,
    cssCodeSplit: false,
    cssMinify: false,
    lib: {
      cssFileName: "style",
      entry: {
        index: src("./src/index.ts"),
        resolver: src("./src/resolver.ts"),
        "icons/index": src("./src/icons/index.ts"),
        "icons/iconify": src("./src/icons/iconify.ts"),
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
    include: ["src/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    // A passing assertion returns at once; the longer limit only gives a slow CI runner room to open a popup or settle a layout.
    expect: { poll: { timeout: 5000 } },
    // The browser tests click real controls; on a loaded CI runner one click can land before a popup is ready. A genuine failure still fails on the retry.
    retry: process.env.CI ? 1 : 0,
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ launchOptions: process.env.CI ? {} : { channel: "msedge" } }),
      instances: [{ browser: "chromium" }],
      viewport: { width: 640, height: 800 },
    },
  },
}));
