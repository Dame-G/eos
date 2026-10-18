import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";
import { render } from "vitest-browser-vue";

// @iconify/vue is an optional peer dependency and is not installed here, so a stand-in records what it was asked to draw.
vi.mock("@iconify/vue", () => ({
  Icon: defineComponent({
    name: "Icon",
    inheritAttrs: false,
    props: { icon: String },
    setup:
      (props, { attrs }) =>
      () =>
        h("svg", { ...attrs, "data-iconify": props.icon }),
  }),
}));

const { iconify } = await import("./iconify.js");
const { default: EIcon } = await import("../components/Icon/EIcon.vue");
const { createEos } = await import("../plugin.js");

const ctx = { bold: false };
const drawn = (container: Element) => container.querySelector("svg")?.getAttribute("data-iconify");

describe("iconify adapter", () => {
  test("aliases Eos names and prefixes the result", async () => {
    const config = iconify("lucide");
    expect(config.aliases?.card).toBe("credit-card");
    const plugin = createEos({ themeTarget: null, icons: config });
    const card = await render(EIcon, { props: { name: "card" }, global: { plugins: [plugin] } });
    expect(drawn(card.container)).toBe("lucide:credit-card");
    const home = await render(EIcon, { props: { name: "home" }, global: { plugins: [plugin] } });
    expect(drawn(home.container)).toBe("lucide:house");
  });

  test("a name with a colon is used as given, whatever the prefix", async () => {
    const plugin = createEos({ themeTarget: null, icons: iconify("tabler") });
    const { container } = await render(EIcon, { props: { name: "lucide:credit-card" }, global: { plugins: [plugin] } });
    expect(drawn(container)).toBe("lucide:credit-card");
  });

  test("keeps the icon classes and hides it from assistive technology", async () => {
    const plugin = createEos({ themeTarget: null, icons: iconify("mdi") });
    const { container } = await render(EIcon, { props: { name: "mail" }, global: { plugins: [plugin] } });
    expect(drawn(container)).toBe("mdi:email");
    const svg = container.querySelector("svg")!;
    expect(svg.classList.contains("e-icon")).toBe(true);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  test("ph uses the bold variant for small and bold icons", () => {
    const config = iconify("ph");
    const regular = config.resolve?.("credit-card", ctx);
    const bold = config.resolve?.("credit-card", { bold: true });
    expect(regular).not.toBe(bold);
    expect(config.resolve?.("credit-card", ctx)).toBe(regular);
  });

  test("ph bold names end in -bold", async () => {
    const plugin = createEos({ themeTarget: null, icons: iconify("ph") });
    const { container } = await render(EIcon, { props: { name: "card", small: true }, global: { plugins: [plugin] } });
    expect(drawn(container)).toBe("ph:credit-card-bold");
  });

  test("other prefixes have no bold suffix unless asked", () => {
    const plain = iconify("lucide");
    expect(plain.resolve?.("x", ctx)).toBe(plain.resolve?.("x", { bold: true }));
    const custom = iconify("lucide", { boldSuffix: "-2" });
    expect(custom.resolve?.("x", ctx)).not.toBe(custom.resolve?.("x", { bold: true }));
  });

  test("an unknown prefix uses names as given, and own aliases are merged", async () => {
    const config = iconify("my-set", { aliases: { card: "wallet-cards" }, builtin: false });
    expect(config.builtin).toBe(false);
    const plugin = createEos({ themeTarget: null, icons: config });
    const card = await render(EIcon, { props: { name: "card" }, global: { plugins: [plugin] } });
    expect(drawn(card.container)).toBe("my-set:wallet-cards");
    const check = await render(EIcon, { props: { name: "check" }, global: { plugins: [plugin] } });
    expect(drawn(check.container)).toBe("my-set:check");
  });
});
