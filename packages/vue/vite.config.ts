import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { playwright } from "@vitest/browser-playwright";
import { copyFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import layers from "./scripts/postcss-layers.ts";

const src = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig(({ command }) => ({
  plugins: [
    vue(),
    ...(command === "build" ? [libInjectCss()] : []),
    ...(command === "build"
      ? [
          dts({
            tsconfigPath: "./tsconfig.build.json",
            entryRoot: "src",
            exclude: ["**/*.test.ts", "**/*.stories.ts", "test/**"],
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
  css: { postcss: { plugins: [layers()] } },
  build: {
    target: "es2022",
    sourcemap: true,
    cssCodeSplit: true,
    // Shipped unminified: a minifier may shorten the layer order statement, and the consumer's bundler minifies anyway.
    cssMinify: false,
    lib: {
      entry: {
        index: src("./src/index.ts"),
        resolver: src("./src/resolver.ts"),
        "icons/index": src("./src/icons/index.ts"),
        "icons/iconify": src("./src/icons/iconify.ts"),
      },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["vue", "@iconify/vue", /^@dame-g\//],
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
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({ launchOptions: process.env.CI ? {} : { channel: "msedge" } }),
      instances: [{ browser: "chromium" }],
      viewport: { width: 640, height: 800 },
    },
  },
}));
