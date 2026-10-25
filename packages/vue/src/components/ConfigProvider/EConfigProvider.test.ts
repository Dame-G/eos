import { afterEach, describe, expect, test } from "vitest";
import { defineComponent, h, markRaw, nextTick } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import { darkVariant, defineTheme, themeVariant } from "@eos-ui/tokens";
import EConfigProvider from "./EConfigProvider.vue";
import EIcon from "../Icon/EIcon.vue";
import EMenu from "../Menu/EMenu.vue";
import EButton from "../Button/EButton.vue";
import { createEos } from "../../plugin.js";
import { useConfig, useMessages } from "../../config.js";
import { useDir } from "../../composables/useDir.js";
import { expectNoViolations } from "../../../test/axe.js";

afterEach(() => {
  for (const a of ["style", "data-e-theme", "lang", "dir"]) document.documentElement.removeAttribute(a);
});

/** Shows what a component inside sees. */
const Probe = defineComponent({
  setup() {
    const config = useConfig();
    const t = useMessages();
    const dir = useDir();
    return () =>
      h("output", {
        "data-locale": config.locale,
        "data-currency": config.currency,
        "data-dir": dir.value,
        "data-close": t("close"),
        "data-hello": t("hello"),
      });
  },
});
const Mark = markRaw(defineComponent({ render: () => h("svg", { "data-testid": "mark" }) }));
const Dot = markRaw(defineComponent({ render: () => h("svg", { "data-testid": "dot" }) }));

const probe = (c: Element) => c.querySelector("output")!.dataset;

describe("EConfigProvider", () => {
  test("inherits the parent config and overrides what it is given", async () => {
    const eos = createEos({
      locale: "en-CA",
      currency: "CAD",
      messages: { close: "Shut", hello: "Hi" },
      icons: { icons: { mark: Mark } },
    });
    const { container } = await render(
      defineComponent({
        render: () => [
          h(Probe, { id: "outside" }),
          h(EConfigProvider, { locale: "fr-CA", messages: { hello: "Salut" }, icons: { icons: { dot: Dot } } }, () => [
            h(Probe),
            h(EIcon, { name: "mark" }),
            h(EIcon, { name: "dot" }),
          ]),
        ],
      }),
      { global: { plugins: [eos] } },
    );
    const inside = container.querySelector(".e-config")!;
    expect(probe(inside)).toMatchObject({
      locale: "fr-CA",
      currency: "CAD",
      close: "Shut",
      hello: "Salut",
      dir: "ltr",
    });
    expect(probe(container)).toMatchObject({ locale: "en-CA", hello: "Hi" });
    // The parent's icons are still there next to the provider's own.
    expect(inside.querySelector("[data-testid=mark]")).not.toBeNull();
    expect(inside.querySelector("[data-testid=dot]")).not.toBeNull();
    expect(inside.getAttribute("lang")).toBe("fr-CA");
  });

  test("a change to the parent config reaches inside", async () => {
    const eos = createEos({ currency: "USD" });
    const { container } = await render(
      defineComponent({ render: () => h(EConfigProvider, { locale: "de-DE" }, () => h(Probe)) }),
      { global: { plugins: [eos] } },
    );
    eos.config.currency = "EUR";
    await nextTick();
    expect(probe(container).currency).toBe("EUR");
  });

  test("a right-to-left locale sets dir, and dir wins over the locale", async () => {
    const { container } = await render(
      defineComponent({
        render: () => [
          h(EConfigProvider, { locale: "ar", class: "a" }, () => h(Probe)),
          h(EConfigProvider, { locale: "ar", dir: "ltr", class: "b" }, () => h(Probe)),
        ],
      }),
    );
    const a = container.querySelector(".a")!;
    const b = container.querySelector(".b")!;
    expect(a.getAttribute("dir")).toBe("rtl");
    expect(probe(a).dir).toBe("rtl");
    expect(b.getAttribute("dir")).toBe("ltr");
    expect(probe(b).dir).toBe("ltr");
  });

  test("a theme is set on its own element, so the part inside takes it and the page keeps its own", async () => {
    const theme = defineTheme({ name: "violet", brand: "#8a2be2" });
    const { container } = await render(
      defineComponent({ render: () => h(EConfigProvider, { theme }, () => h(EButton, null, () => "Go")) }),
      { global: { plugins: [createEos()] } },
    );
    const scope = container.querySelector<HTMLElement>(".e-config")!;
    expect(scope.dataset.eTheme).toBe("violet");
    expect(scope.style.getPropertyValue("--e-primary")).toBe(theme.tokens["primary"]);
    expect(scope.classList.contains("e-root")).toBe(true);
    expect(document.documentElement.style.getPropertyValue("--e-primary")).not.toBe(theme.tokens["primary"]);
    expect(getComputedStyle(scope.querySelector("button")!).getPropertyValue("--e-primary").trim()).toBe(
      theme.tokens["primary"],
    );
  });

  test("scheme dark shows the dark variant, and light the light one", async () => {
    const input = { brand: "#2c95b4" };
    const { container } = await render(
      defineComponent({
        render: () => [
          h(EConfigProvider, { theme: input, scheme: "dark", class: "d" }, () => "Dark"),
          h(EConfigProvider, { theme: input, scheme: "light", class: "l" }, () => "Light"),
        ],
      }),
    );
    const dark = container.querySelector<HTMLElement>(".d")!;
    const light = container.querySelector<HTMLElement>(".l")!;
    expect(dark.style.getPropertyValue("color-scheme")).toBe("dark");
    expect(light.style.getPropertyValue("color-scheme")).toBe("light");
    expect(dark.style.getPropertyValue("--e-surface")).not.toBe(light.style.getPropertyValue("--e-surface"));
    expect(dark.style.getPropertyValue("--e-surface")).toBe(defineTheme(darkVariant(input)).tokens["surface"]);
  });

  test("scheme picks the variant of a built theme that has one, and leaves a fixed one as built", async () => {
    const auto = defineTheme({ name: "auto", brand: "#2c95b4", scheme: "auto" });
    const fixed = defineTheme({ name: "fixed", brand: "#2c95b4" });
    const { container } = await render(
      defineComponent({
        render: () => [
          h(EConfigProvider, { theme: auto, scheme: "dark", class: "a" }, () => "Auto"),
          h(EConfigProvider, { theme: fixed, scheme: "dark", class: "f" }, () => "Fixed"),
        ],
      }),
    );
    const a = container.querySelector<HTMLElement>(".a")!;
    const f = container.querySelector<HTMLElement>(".f")!;
    expect(a.style.getPropertyValue("color-scheme")).toBe("dark");
    expect(a.style.getPropertyValue("--e-surface")).toBe(themeVariant(auto, { dark: true }).tokens["surface"]);
    expect(f.style.getPropertyValue("color-scheme")).toBe("light");
    expect(f.style.getPropertyValue("--e-surface")).toBe(fixed.tokens["surface"]);
  });

  test("floating parts render inside only when the provider sets a theme or scheme", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EConfigProvider, { currency: "EUR" }, () => h(EMenu, { label: "Money", items: [{ label: "Edit" }] })),
      }),
    );
    await userEvent.click(page.getByRole("button", { name: "Money" }));
    await expect.poll(() => document.querySelector("[role=menu]")).not.toBeNull();
    expect(container.querySelector(".e-config")!.contains(document.querySelector("[role=menu]"))).toBe(false);
    await userEvent.keyboard("{Escape}");
  });

  test("a menu opened inside renders inside, so it keeps the theme", async () => {
    const theme = defineTheme({ name: "scoped", brand: "#b00020" });
    const { container } = await render(
      defineComponent({
        render: () => h(EConfigProvider, { theme }, () => h(EMenu, { label: "Open", items: [{ label: "Edit" }] })),
      }),
      { global: { plugins: [createEos()] } },
    );
    await userEvent.click(page.getByRole("button", { name: "Open" }));
    await expect.poll(() => document.querySelector("[role=menu]")).not.toBeNull();
    expect(container.querySelector(".e-config")!.contains(document.querySelector("[role=menu]"))).toBe(true);
    await userEvent.keyboard("{Escape}");
  });

  test("portal: false leaves floating parts where the parent puts them", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EConfigProvider, { portal: false, theme: { brand: "#2c95b4" } }, () =>
            h(EMenu, { label: "More", items: [{ label: "Edit" }] }),
          ),
      }),
    );
    await userEvent.click(page.getByRole("button", { name: "More" }));
    await expect.poll(() => document.querySelector("[role=menu]")).not.toBeNull();
    expect(container.querySelector(".e-config")!.contains(document.querySelector("[role=menu]"))).toBe(false);
    await userEvent.keyboard("{Escape}");
  });

  test("works without the plugin, and has no accessibility violations", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h(EConfigProvider, { locale: "he", theme: { brand: "#2c95b4" } }, () => [h(Probe), h("p", "שלום")]),
      }),
    );
    expect(probe(container)).toMatchObject({ locale: "he", currency: "USD", dir: "rtl" });
    await expectNoViolations(container);
  });
});
