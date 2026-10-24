import { describe, expect, test } from "vitest";
import { defineComponent, h, type Component, markRaw } from "vue";
import { render } from "vitest-browser-vue";
import EIcon from "../components/Icon/EIcon.vue";
import EButton from "../components/Button/EButton.vue";
import { createEos } from "../plugin.js";
import { defineIcons, heroicons, iconNames, lucide, phosphorVue, tabler } from "./index.js";
import type { IconsConfig } from "./types.js";

function fake(id: string): Component {
  return markRaw(
    defineComponent({
      name: id,
      inheritAttrs: false,
      props: { weight: String },
      setup:
        (props, { attrs }) =>
        () =>
          h("svg", { ...attrs, viewBox: "0 0 24 24", "data-fake": id, "data-weight": props.weight }, [
            h("path", { d: "M0 0" }),
          ]),
    }),
  );
}

const eos = (icons: IconsConfig) => createEos({ themeTarget: null, icons });
const ctx = { bold: false };

describe("lucide adapter", () => {
  const source = {
    CreditCard: fake("CreditCard"),
    House: fake("House"),
    Check: fake("Check"),
    icons: { not: "a component" },
  };

  test("resolves the PascalCase of the aliased name", () => {
    const config = lucide(source);
    expect(config.aliases?.card).toBe("credit-card");
    expect(config.aliases?.home).toBe("house");
    expect(config.resolve?.("credit-card", ctx)).toBe(source.CreditCard);
    expect(config.resolve?.("house", ctx)).toBe(source.House);
  });

  test("returns undefined for a missing icon or a non-component export", () => {
    const config = lucide(source);
    expect(config.resolve?.("bell", ctx)).toBeUndefined();
    expect(config.resolve?.("icons", ctx)).toBeUndefined();
  });

  test("own aliases win over the table, and builtin can be turned off", () => {
    const config = lucide(source, { aliases: { card: "check" }, builtin: false });
    expect(config.aliases?.card).toBe("check");
    expect(config.aliases?.eye).toBe("eye");
    expect(config.builtin).toBe(false);
    expect(lucide(source).builtin).toBe(true);
  });

  test("renders through EIcon by eos name, by set name, and by an alias override", async () => {
    const plugin = eos(lucide(source, { aliases: { alert: "check" } }));
    for (const name of ["card", "credit-card"]) {
      const { container } = await render(EIcon, { props: { name }, global: { plugins: [plugin] } });
      expect(container.querySelector("[data-fake=CreditCard]"), name).not.toBeNull();
    }
    const alert = await render(EIcon, { props: { name: "alert" }, global: { plugins: [plugin] } });
    expect(alert.container.querySelector("[data-fake=Check]")).not.toBeNull();
    const svg = alert.container.querySelector("svg")!;
    expect(svg.classList.contains("e-icon")).toBe(true);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });

  test("a name the set lacks falls through to the built-in icon, unless builtin is off", async () => {
    const withFallback = await render(EIcon, { props: { name: "bell" }, global: { plugins: [eos(lucide(source))] } });
    expect(withFallback.container.querySelector(".e-icon--glyph")).not.toBeNull();
    const without = await render(EIcon, {
      props: { name: "bell" },
      global: { plugins: [eos(lucide(source, { builtin: false }))] },
    });
    expect(without.container.querySelector(".e-icon")).toBeNull();
  });

  test('EButton draws icon="credit-card" from the Lucide module', async () => {
    const { container } = await render(EButton, {
      props: { icon: "credit-card" },
      slots: { default: "Pay now" },
      global: { plugins: [eos(lucide(source))] },
    });
    const button = container.querySelector("button")!;
    expect(button.textContent).toContain("Pay now");
    const icon = button.querySelector("[data-fake=CreditCard]")!;
    expect(icon).not.toBeNull();
    expect(icon.classList.contains("e-icon")).toBe(true);
    expect(button.querySelector(".e-icon--glyph")).toBeNull();
  });

  test("an icon component passed to the prop is used as given", async () => {
    const { container } = await render(EButton, {
      props: { icon: source.CreditCard },
      slots: { default: "Pay" },
      global: { plugins: [eos(lucide(source))] },
    });
    expect(container.querySelector("[data-fake=CreditCard]")).not.toBeNull();
  });
});

describe("tabler adapter", () => {
  const source = {
    IconCreditCard: fake("IconCreditCard"),
    IconMenu2: fake("IconMenu2"),
    IconAlertTriangle: fake("IconAlertTriangle"),
  };

  test("uses the Icon prefix and renames eos names", () => {
    const config = tabler(source);
    expect(config.resolve?.(config.aliases!.card!, ctx)).toBe(source.IconCreditCard);
    expect(config.resolve?.(config.aliases!.menu!, ctx)).toBe(source.IconMenu2);
    expect(config.resolve?.(config.aliases!.alert!, ctx)).toBe(source.IconAlertTriangle);
    expect(config.resolve?.("bell", ctx)).toBeUndefined();
  });
});

describe("heroicons adapter", () => {
  const source = { CreditCardIcon: fake("CreditCardIcon"), Bars3Icon: fake("Bars3Icon"), XMarkIcon: fake("XMarkIcon") };

  test("uses the Icon suffix, digits and multi-word names", () => {
    const config = heroicons(source);
    expect(config.resolve?.(config.aliases!.card!, ctx)).toBe(source.CreditCardIcon);
    expect(config.resolve?.(config.aliases!.menu!, ctx)).toBe(source.Bars3Icon);
    expect(config.resolve?.(config.aliases!.x!, ctx)).toBe(source.XMarkIcon);
  });

  test("renders through the plugin from an explicit map", async () => {
    const { container } = await render(EIcon, {
      props: { name: "menu" },
      global: { plugins: [eos(heroicons(source))] },
    });
    expect(container.querySelector("[data-fake=Bars3Icon]")).not.toBeNull();
  });
});

describe("phosphorVue adapter", () => {
  const source = { PhCreditCard: fake("PhCreditCard"), PhList: fake("PhList") };

  test("passes the weight: regular normally, bold for the bold flag", async () => {
    const plugin = eos(phosphorVue(source));
    const normal = await render(EIcon, { props: { name: "card" }, global: { plugins: [plugin] } });
    expect(normal.container.querySelector("[data-fake=PhCreditCard]")!.getAttribute("data-weight")).toBe("regular");
    const small = await render(EIcon, { props: { name: "card", size: "sm" }, global: { plugins: [plugin] } });
    expect(small.container.querySelector("[data-fake=PhCreditCard]")!.getAttribute("data-weight")).toBe("bold");
    const bold = await render(EIcon, { props: { name: "menu", bold: true }, global: { plugins: [plugin] } });
    expect(bold.container.querySelector("[data-fake=PhList]")!.getAttribute("data-weight")).toBe("bold");
  });

  test("the weight option changes the normal weight, and the same wrapper is reused", () => {
    const config = phosphorVue(source, { weight: "light" });
    const first = config.resolve?.("credit-card", ctx);
    expect(config.resolve?.("credit-card", ctx)).toBe(first);
    expect(config.resolve?.("credit-card", { bold: true })).not.toBe(first);
  });

  test("keeps the classes and aria attributes EIcon puts on it", async () => {
    const { container } = await render(EIcon, {
      props: { name: "card" },
      global: { plugins: [eos(phosphorVue(source))] },
    });
    const svg = container.querySelector("svg")!;
    expect(svg.classList.contains("e-icon")).toBe(true);
    expect(svg.getAttribute("aria-hidden")).toBe("true");
  });
});

describe("defineIcons", () => {
  test("returns the config unchanged", () => {
    const config = { aliases: { card: "wallet" } };
    expect(defineIcons(config)).toBe(config);
  });

  test("iconNames is exported from the entry", () => {
    expect(iconNames).toContain("card");
  });
});
