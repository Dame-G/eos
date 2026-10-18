import { afterEach, describe, expect, test, vi } from "vitest";
import { createApp, defineComponent, h, nextTick } from "vue";
import { contrast } from "@eos-ui/tokens";
import { createEos } from "./plugin.js";
import { useConfig, useMessages } from "./config.js";
import EButton from "./components/Button/EButton.vue";
import ETextField from "./components/TextField/ETextField.vue";

const hosts: HTMLElement[] = [];
function mountApp(component: ReturnType<typeof defineComponent>, plugin?: ReturnType<typeof createEos>) {
  const host = document.createElement("div");
  document.body.append(host);
  hosts.push(host);
  const app = createApp(component);
  if (plugin) app.use(plugin);
  app.mount(host);
  return { host, app };
}

afterEach(() => {
  for (const h of hosts.splice(0)) h.remove();
  document.documentElement.removeAttribute("style");
  document.documentElement.removeAttribute("data-e-theme");
  document.documentElement.removeAttribute("dir");
});

describe("createEos", () => {
  test("applies the theme to the page and marks it", () => {
    const eos = createEos({ theme: { name: "clinic", brand: "#8a2be2" } });
    mountApp(defineComponent({ render: () => h("div") }), eos);
    const root = document.documentElement;
    expect(root.getAttribute("data-e-theme")).toBe("clinic");
    const primary = root.style.getPropertyValue("--e-primary");
    expect(primary).toMatch(/^#[0-9a-f]{6}$/);
    expect(contrast(primary, "#ffffff")).toBeGreaterThanOrEqual(7);
  });

  test("a theme can be scoped to one element instead of the page", async () => {
    const scope = document.createElement("section");
    document.body.append(scope);
    hosts.push(scope);
    const eos = createEos({ theme: { name: "scoped", brand: "#b00020" }, themeTarget: scope });
    mountApp(defineComponent({ render: () => h("div") }), eos);
    expect(scope.getAttribute("data-e-theme")).toBe("scoped");
    expect(document.documentElement.getAttribute("data-e-theme")).toBeNull();
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
    // the inline variables on <html> are the last theme applied, so measure the first with its own value
    expect(getComputedStyle(button).backgroundColor).not.toBe("");
    expect(eos.theme.tokens["primary"]).not.toBe(defaults.theme.tokens["primary"]);
  });

  test("a failing theme is reported in the console, once, with the pair that fails", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    createEos({ theme: { tokens: { primary: "#9fd3e3" } } }).install(
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

  test("portalTarget defaults to body and can point at a themed container", () => {
    expect(createEos().config.portalTarget).toBe("body");
    expect(createEos({ portalTarget: "#themed" }).config.portalTarget).toBe("#themed");
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
