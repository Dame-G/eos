// Every exported component, rendered on the server and hydrated in the browser: hydration must find what the server
// drew. The HTML comes from Node (test/ssr/command.ts), where there is no window or document, as on a real server; the
// browser then mounts the same tree with createSSRApp over it. Two of each component check that generated ids line
// up, the teleported parts go to their target as a server would send them, and the right-to-left run checks useDir.
import { afterEach, describe, expect, test, vi } from "vitest";
import { createSSRApp, nextTick } from "vue";
import { commands } from "vitest/browser";
import * as Library from "../src/index.js";
import { componentNames } from "../src/component-names.js";
import { casesOf, componentsOf, OPEN_AFTER_HYDRATION, RUNS, tree, type Run } from "./ssr/fixtures.js";
import { frames } from "./frames.js";

declare module "vitest/browser" {
  interface BrowserCommands {
    ssrRender: (
      name: string,
      run: Run,
    ) => Promise<{ html: string; teleports: Record<string, string>; warnings: string[] }>;
  }
}

const components = componentsOf(Library);
const cases = casesOf(Library);
const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const undo of cleanup.splice(0)) undo();
  vi.restoreAllMocks();
});

const runs = Object.keys(RUNS) as Run[];

describe.each(runs)("server render and hydration (%s)", (run) => {
  test("covers every exported component", () => {
    expect(components.map(([name]) => name)).toEqual([...componentNames].sort((a, b) => a.localeCompare(b)));
  });

  test("the server reads the direction from the config (useDir)", async () => {
    const { html } = await commands.ssrRender("ESlider", run);
    expect(html).toContain(`dir="${run}"`);
  });

  test.each(cases.map((c) => c.id))("%s hydrates without a mismatch", async (id) => {
    const c = cases.find((x) => x.id === id)!;
    const server = await commands.ssrRender(id, run);
    expect(server.warnings.filter((w) => w.includes("[Vue warn]")).join("\n\n")).toBe("");
    const drawn = server.html.replace(/^<div id="ssr-root-child">|<\/div>$|<!--[^]*?-->/g, "");
    if (!OPEN_AFTER_HYDRATION.has(c.name)) expect(drawn, "server HTML").not.toBe("");
    // The two copies get ids of their own: generated ids are unique on the server, and hydration checks they match.
    const ids = [...server.html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(ids.filter((id, i) => ids.indexOf(id) !== i)).toEqual([]);

    const host = document.createElement("div");
    host.innerHTML = server.html;
    document.body.append(host);
    cleanup.push(() => host.remove());
    // Teleported markup goes where the server put it, as a page would carry it.
    for (const [selector, markup] of Object.entries(server.teleports)) {
      const target = document.querySelector(selector);
      expect(target, `teleport target ${selector}`).not.toBeNull();
      const holder = document.createElement("template");
      holder.innerHTML = markup;
      const nodes = [...holder.content.childNodes];
      target!.append(...nodes);
      cleanup.push(() => nodes.forEach((n) => n.parentNode?.removeChild(n)));
    }

    const said: string[] = [];
    const record = (...args: unknown[]) => void said.push(args.map(String).join(" "));
    vi.spyOn(console, "warn").mockImplementation(record);
    vi.spyOn(console, "error").mockImplementation(record);
    const app = createSSRApp({ render: tree(c) });
    app.use(Library.createEos({ ...RUNS[run], themeTarget: null }));
    app.mount(host);
    cleanup.unshift(() => app.unmount());
    await nextTick();
    await frames(1);
    expect(said.filter((s) => /hydration/i.test(s)).join("\n\n")).toBe("");
  });
});
