// A browser command: renders one component to HTML on the server side, in Node, through the dev server's SSR module
// graph, so the components run as they do on a real server (no window, no document). test/ssr.test.ts hydrates it.
// A dev server of its own: the test server bundles Vue into its SSR graph for the browser, where a real server
// imports the installed package. It has no HTTP server and no watcher, and starts on first use.
import { fileURLToPath } from "node:url";
import { createServer, type ViteDevServer } from "vite";
import vuePlugin from "@vitejs/plugin-vue";
import type { BrowserCommand } from "vitest/node";
import type { App } from "vue";

interface Rendered {
  html: string;
  /** Teleported markup by target selector, as the server collects it. */
  teleports: Record<string, string>;
  /** Vue warnings logged while rendering. */
  warnings: string[];
}

type Lib = Record<string, unknown> & { createEos: (o: object) => { install: (app: App) => void } };

const root = fileURLToPath(new URL("../../", import.meta.url));
let server: Promise<ViteDevServer> | undefined;
const start = () =>
  (server ??= createServer({
    root,
    configFile: false,
    logLevel: "error",
    appType: "custom",
    plugins: [vuePlugin()],
    server: { middlewareMode: true, hmr: false, watch: null, ws: false },
  }));

export const ssrRender: BrowserCommand<[name: string, run: string]> = async (_ctx, name, run): Promise<Rendered> => {
  const vite = await start();
  const load = <T>(id: string) => vite.ssrLoadModule(id) as Promise<T>;
  const lib = await load<Lib>("/src/index.ts");
  const fixtures = await load<typeof import("./fixtures.js")>("/test/ssr/fixtures.ts");
  // Vue as Node imports it, the one the externalized dependencies of the library share.
  const vue = await import("vue");
  const { renderToString } = await import("vue/server-renderer");
  const found = fixtures.casesOf(lib).find((c) => c.id === name);
  if (!found) throw new Error(`No case named ${name}`);
  const warnings: string[] = [];
  const warn = console.warn;
  console.warn = (...args: unknown[]) => warnings.push(args.map(String).join(" "));
  try {
    const app = vue.createSSRApp({ render: fixtures.tree(found) });
    app.use(lib.createEos({ ...fixtures.RUNS[run as keyof typeof fixtures.RUNS], themeTarget: null }));
    const context: { teleports?: Record<string, string> } = {};
    const html = await renderToString(app, context);
    return { html, teleports: context.teleports ?? {}, warnings };
  } finally {
    console.warn = warn;
  }
};
