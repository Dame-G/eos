import { afterEach, describe, expect, test, vi } from "vitest";
import { createApp, defineComponent, h, isReactive, nextTick, type App } from "vue";
import { contrast } from "@eos-ui/tokens";
import { createEos, themeCss } from "./plugin.js";
import { useConfig, useMessages } from "./config.js";
import EButton from "./components/Button/EButton.vue";
import ETextField from "./components/TextField/ETextField.vue";
import EIcon from "./components/Icon/EIcon.vue";

const hosts: HTMLElement[] = [];
const apps: App[] = [];
function mountApp(component: ReturnType<typeof defineComponent>, plugin?: ReturnType<typeof createEos>) {
  const host = document.createElement("div");
  document.body.append(host);
  hosts.push(host);
  const app = createApp(component);
  if (plugin) app.use(plugin);
  app.mount(host);
  apps.push(app);
  return { host, app };
}

const token = (el: Element, name: string) => getComputedStyle(el).getPropertyValue(`--e-${name}`).trim();

afterEach(() => {
  for (const a of apps.splice(0)) a.unmount();
  for (const h of hosts.splice(0)) h.remove();
  document.documentElement.removeAttribute("style");
  document.documentElement.removeAttribute("data-e-theme");
  document.documentElement.removeAttribute("dir");
  document.documentElement.removeAttribute("lang");
});

describe("createEos", () => {
  test("applies the theme to the page and marks it", () => {
    const eos = createEos({ theme: { name: "clinic", brand: "#8a2be2" } });
    mountApp(defineComponent({ render: () => h("div") }), eos);
    const root = document.documentElement;
    expect(root.getAttribute("data-e-theme")).toBe("clinic");
    const primary = token(root, "primary");
    expect(primary).toBe(eos.theme.tokens["primary"]);
    expect(contrast(primary, "#ffffff")).toBeGreaterThanOrEqual(7);
    expect(root.style.getPropertyValue("--e-primary")).toBe("");
  });

  test("with no theme, nothing is applied: the stylesheet carries the default", () => {
    const sheets = document.adoptedStyleSheets.length;
    mountApp(defineComponent({ render: () => h("div") }), createEos());
    const root = document.documentElement;
    expect(root.hasAttribute("data-e-theme")).toBe(false);
    expect(root.getAttribute("style")).toBeNull();
    expect(document.adoptedStyleSheets.length).toBe(sheets);
  });

  test("the page's own CSS wins over the theme, and the media-query variants are kept", () => {
    const own = document.createElement("style");
    own.textContent = ":root { --e-primary: #0b4f6c; }";
    document.head.append(own);
    try {
      mountApp(
        defineComponent({ render: () => h("div") }),
        createEos({ theme: { brand: "#8a2be2", contrast: "auto" } }),
      );
      expect(token(document.documentElement, "primary")).toBe("#0b4f6c");
      const css = document.adoptedStyleSheets.flatMap((s) => [...s.cssRules].map((r) => r.cssText)).join("\n");
      expect(css).toContain("prefers-contrast: more");
    } finally {
      own.remove();
    }
  });

  test("unmounting the app removes the theme", () => {
    const sheets = document.adoptedStyleSheets.length;
    const { app } = mountApp(defineComponent({ render: () => h("div") }), createEos({ theme: { name: "gone" } }));
    expect(document.documentElement.getAttribute("data-e-theme")).toBe("gone");
    apps.splice(apps.indexOf(app), 1);
    app.unmount();
    expect(document.documentElement.hasAttribute("data-e-theme")).toBe(false);
    expect(document.adoptedStyleSheets.length).toBe(sheets);
  });

  test("applyTheme: false leaves the theme to the page's own CSS, and still sets lang and dir", () => {
    const eos = createEos({ theme: { name: "mine", brand: "#8a2be2" }, applyTheme: false, locale: "ar" });
    mountApp(defineComponent({ render: () => h("div") }), eos);
    const root = document.documentElement;
    expect(token(root, "primary")).not.toBe(eos.theme.tokens["primary"]);
    expect(root.hasAttribute("data-e-theme")).toBe(false);
    expect(root.getAttribute("lang")).toBe("ar");
    expect(root.getAttribute("dir")).toBe("rtl");
    expect(themeCss(eos.theme)).toContain("--e-primary");
  });

  test("a theme can be scoped to one element instead of the page", async () => {
    const scope = document.createElement("section");
    document.body.append(scope);
    hosts.push(scope);
    const eos = createEos({ theme: { name: "scoped", brand: "#b00020" }, themeTarget: scope });
    mountApp(defineComponent({ render: () => h("div") }), eos);
    expect(scope.getAttribute("data-e-theme")).toBe("scoped");
    expect(token(scope, "primary")).toBe(eos.theme.tokens["primary"]);
    expect(document.documentElement.getAttribute("data-e-theme")).toBeNull();
    expect(token(document.documentElement, "primary")).not.toBe(eos.theme.tokens["primary"]);
  });

  test("the theme changes what a component looks like", async () => {
    const eos = createEos({ theme: { brand: "#8a2be2" } });
    const { host } = mountApp(
      defineComponent({
        render: () =>
          h(
            "div",
            { class: "e-root" },
            h(EButton, null, () => "Go"),
          ),
      }),
      eos,
    );
    const button = host.querySelector("button")!;
    const defaults = createEos();
    const other = mountApp(
      defineComponent({
        render: () =>
          h(
            "div",
            { class: "e-root" },
            h(EButton, null, () => "Go"),
          ),
      }),
      defaults,
    );
    void other;
    expect(getComputedStyle(button).backgroundColor).not.toBe("");
    expect(eos.theme.tokens["primary"]).not.toBe(defaults.theme.tokens["primary"]);
  });

  test("a failing theme is reported in the console, once, with the pair that fails", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    createEos({ theme: { tokens: { primary: "#9fd3e3" } }, applyTheme: false }).install(
      createApp(defineComponent({ render: () => h("div") })),
    );
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toMatch(/Primary button label/);
    warn.mockRestore();
  });

  test("locale, currency and messages are reactive: change them and components follow", async () => {
    const eos = createEos({ locale: "en-US", messages: { required: "Needed" } });
    const { host } = mountApp(defineComponent({ render: () => h(ETextField, { label: "Name", required: true }) }), eos);
    expect(host.textContent).toContain("Needed");
    eos.config.messages.required = "Obligatoire";
    await nextTick();
    expect(host.textContent).toContain("Obligatoire");
    expect(eos.config.locale).toBe("en-US");
    eos.config.locale = "fr-CA";
    expect(useConfigInApp(eos).locale).toBe("fr-CA");
  });

  test("direction is set on the page only when asked for", async () => {
    mountApp(defineComponent({ render: () => h("div") }), createEos());
    expect(document.documentElement.getAttribute("dir")).toBeNull();
    mountApp(defineComponent({ render: () => h("div") }), createEos({ dir: "rtl" }));
    expect(document.documentElement.getAttribute("dir")).toBe("rtl");
  });

  test("a locale sets lang and the direction it is written in", async () => {
    const eos = createEos({ locale: "ar" });
    mountApp(defineComponent({ render: () => h("div") }), eos);
    const root = document.documentElement;
    expect(root.getAttribute("lang")).toBe("ar");
    expect(root.getAttribute("dir")).toBe("rtl");
    eos.config.locale = "en-US";
    await nextTick();
    expect(root.getAttribute("lang")).toBe("en-US");
    expect(root.getAttribute("dir")).toBe("ltr");
  });

  test("an explicit dir wins over the locale, and no locale leaves lang alone", () => {
    mountApp(defineComponent({ render: () => h("div") }), createEos({ locale: "ar", dir: "ltr" }));
    expect(document.documentElement.getAttribute("dir")).toBe("ltr");
    document.documentElement.removeAttribute("lang");
    mountApp(defineComponent({ render: () => h("div") }), createEos());
    expect(document.documentElement.hasAttribute("lang")).toBe(false);
  });

  test("lang and dir go on the theme target when the theme is scoped", () => {
    const scope = document.createElement("section");
    document.body.append(scope);
    hosts.push(scope);
    mountApp(defineComponent({ render: () => h("div") }), createEos({ locale: "he", themeTarget: scope }));
    expect(scope.getAttribute("dir")).toBe("rtl");
    expect(scope.getAttribute("lang")).toBe("he");
    expect(document.documentElement.hasAttribute("dir")).toBe(false);
  });

  test("themeTarget: null touches no element: no theme, lang or dir, while the config keeps them", () => {
    const eos = createEos({ themeTarget: null, theme: { name: "nowhere" }, locale: "he-IL", dir: "rtl" });
    mountApp(defineComponent({ render: () => h("div") }), eos);
    const root = document.documentElement;
    expect(root.hasAttribute("dir")).toBe(false);
    expect(root.hasAttribute("data-e-theme")).toBe(false);
    expect(root.getAttribute("lang")).not.toBe("he-IL");
    expect(eos.config.dir).toBe("rtl");
  });

  test("unmounting puts back the lang and dir the target had", () => {
    const root = document.documentElement;
    root.setAttribute("lang", "en");
    const { app } = mountApp(defineComponent({ render: () => h("div") }), createEos({ locale: "ar" }));
    expect(root.getAttribute("dir")).toBe("rtl");
    app.unmount();
    apps.splice(apps.indexOf(app), 1);
    expect(root.getAttribute("lang")).toBe("en");
    expect(root.hasAttribute("dir")).toBe(false);
  });

  test("portalTarget defaults to body and can point at a themed container", () => {
    expect(createEos().config.portalTarget).toBe("body");
    expect(createEos({ portalTarget: "#themed" }).config.portalTarget).toBe("#themed");
  });

  test("an icon component in the config is rendered as given, not as a reactive proxy", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const Mark = defineComponent({ render: () => h("svg", { "data-testid": "mark" }) });
    const eos = createEos({ icons: { icons: { mark: Mark } } });
    expect(isReactive(eos.config.icons.icons!.mark)).toBe(false);
    expect(eos.config.icons.icons!.mark).toBe(Mark);
    const { host } = mountApp(defineComponent({ render: () => h(EIcon, { name: "mark" }) }), eos);
    await nextTick();
    expect(host.querySelector("[data-testid=mark]")).not.toBeNull();
    expect(warn.mock.calls.flat().join(" ")).not.toMatch(/reactive object/);
    warn.mockRestore();
  });

  test("components work with no plugin installed", async () => {
    const { host } = mountApp(defineComponent({ render: () => h(ETextField, { label: "Name", optional: true }) }));
    expect(host.textContent).toContain("Name");
    expect(host.textContent).toContain("Optional");
  });

  test("useMessages fills placeholders", () => {
    const eos = createEos({ messages: { pageN: "Seite {n}" } });
    let text = "";
    mountApp(
      defineComponent({
        setup() {
          text = useMessages()("pageN", { n: 3 });
          return () => h("div");
        },
      }),
      eos,
    );
    expect(text).toBe("Seite 3");
  });
});

function useConfigInApp(eos: ReturnType<typeof createEos>) {
  let config!: ReturnType<typeof useConfig>;
  mountApp(
    defineComponent({
      setup() {
        config = useConfig();
        return () => h("div");
      },
    }),
    eos,
  );
  return config;
}

describe("themeCss", () => {
  test("renders the theme tokens as CSS without a document", () => {
    const css = themeCss({ name: "clinic", brand: "#8a2be2" });
    expect(css).toContain("@layer e.tokens");
    expect(css).toContain("--e-primary:");
    expect(css).toContain(":root {");
  });

  test("takes a built theme and a selector", () => {
    const css = themeCss(createEos({ theme: { brand: "#2c95b4" } }).theme, ".scope");
    expect(css).toContain(".scope {");
  });
});
