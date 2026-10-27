import { describe, expect, test } from "vitest";
import { defineComponent, h, markRaw } from "vue";
import { page, userEvent } from "vitest/browser";
import { render } from "vitest-browser-vue";
import EStatLink from "./EStatLink.vue";
import { expectNoViolations } from "../../../test/axe.js";

describe("EStatLink", () => {
  test("is a link named by its label and figure, with a space between them", async () => {
    const { container } = await render(EStatLink, { props: { label: "You", value: 1840, href: "/you" } });
    await expect.element(page.getByRole("link", { name: "You 1,840" })).toBeVisible();
    const a = container.querySelector("a")!;
    expect(a.getAttribute("href")).toBe("/you");
    expect(a.classList.contains("e-statlink")).toBe(true);
  });

  test("a string figure is shown as given, in the mono face", async () => {
    const { container } = await render(EStatLink, { props: { label: "Dameless", value: "v14", href: "/d" } });
    const value = container.querySelector<HTMLElement>(".e-statlink-value")!;
    expect(value.textContent).toBe("v14");
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--e-font-mono").split(",")[0]!.trim();
    expect(getComputedStyle(value).fontFamily).toContain(mono.replace(/"/g, ""));
  });

  test("without a figure it shows the label alone", async () => {
    const { container } = await render(EStatLink, { props: { label: "You", href: "/you" } });
    expect(container.querySelector(".e-statlink-value")).toBeNull();
    await expect.element(page.getByRole("link", { name: "You", exact: true })).toBeVisible();
  });

  test("linkComponent renders the link and gets to", async () => {
    const Router = markRaw(
      defineComponent({
        props: { to: String },
        render() {
          return h("a", { href: "/r" + this.to, "data-router": "" }, this.$slots.default?.());
        },
      }),
    );
    const { container } = await render(EStatLink, {
      props: { label: "You", value: 1840, to: "/you", linkComponent: Router },
    });
    const a = container.querySelector("a")!;
    expect(a.hasAttribute("data-router")).toBe(true);
    expect(a.getAttribute("href")).toBe("/r/you");
    expect(a.classList.contains("e-statlink")).toBe(true);
  });

  test("current marks the page you are on and draws it as the current place", async () => {
    const { container } = await render(EStatLink, {
      props: { label: "You", value: 1840, href: "/you", current: true },
    });
    const a = container.querySelector("a")!;
    expect(a.getAttribute("aria-current")).toBe("page");
    const probe = document.createElement("span");
    probe.style.color = "var(--e-primary)";
    container.append(probe);
    expect(getComputedStyle(a).borderTopColor).toBe(getComputedStyle(probe).color);
  });

  test("with no href or to it is text, not a link", async () => {
    const { container } = await render(EStatLink, { props: { label: "You", value: 1840 } });
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("span.e-statlink")!.textContent!.replace(/\s+/g, " ").trim()).toBe("You 1,840");
  });

  test("is a full tap target, and its edge darkens on hover without the box changing size", async () => {
    const { container } = await render(EStatLink, { props: { label: "You", value: 1840, href: "#you" } });
    const a = container.querySelector("a")!;
    expect(a.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
    const before = a.getBoundingClientRect();
    const rest = getComputedStyle(a).borderTopColor;
    await page.getByRole("link").hover();
    await expect.poll(() => getComputedStyle(a).borderTopColor).not.toBe(rest);
    expect(a.getBoundingClientRect().width).toBe(before.width);
  });

  test("is reached with Tab, shows the focus ring and follows with Enter", async () => {
    let clicks = 0;
    const { container } = await render(EStatLink, {
      props: { label: "You", value: 1840, href: "#you" },
      attrs: { onClick: (e: Event) => (e.preventDefault(), clicks++) },
    });
    await userEvent.tab();
    const a = container.querySelector("a")!;
    expect(document.activeElement).toBe(a);
    expect(getComputedStyle(a).outlineStyle).toBe("solid");
    await userEvent.keyboard("{Enter}");
    expect(clicks).toBe(1);
  });

  test("class and attributes land on the link", async () => {
    const { container } = await render(EStatLink, {
      props: { label: "You", href: "/you" },
      attrs: { class: "mine", "data-x": "1" },
    });
    const a = container.querySelector("a")!;
    expect(a.classList.contains("mine")).toBe(true);
    expect(a.getAttribute("data-x")).toBe("1");
  });

  test("has no axe violations, at rest and current", async () => {
    const { container } = await render(
      defineComponent({
        render: () =>
          h("div", { class: "e-root" }, [
            h(EStatLink, { label: "You", value: 1840, href: "/you" }),
            h(EStatLink, { label: "Dameless", value: "v14", href: "/d", current: true }),
          ]),
      }),
    );
    await expectNoViolations(container);
  });
});
